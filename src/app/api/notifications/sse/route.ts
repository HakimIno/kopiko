import { NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verify } from 'jsonwebtoken'

const prisma = new PrismaClient()

// Store active connections
const activeConnections = new Map<string, ReadableStreamDefaultController>()

export async function GET(request: NextRequest) {
    try {
        // Extract token from query parameters
        const url = new URL(request.url)
        const token = url.searchParams.get('token')

        if (!token) {
            return new Response('No token provided', { status: 401 })
        }

        // Verify token
        let userId: string
        try {
            const decoded = verify(token, process.env.JWT_SECRET!) as { userId: string, email: string }
            userId = decoded.userId
        } catch (error: any) {
            // Check if token is expired
            if (error.name === 'TokenExpiredError') {
                return new Response('Token expired', { status: 401 })
            }
            return new Response('Invalid token', { status: 401 })
        }

        // Create SSE stream
        const stream = new ReadableStream({
            start(controller) {
                // Store connection
                activeConnections.set(userId, controller)

                // Send initial data
                sendInitialData(userId, controller)

                // Send keep-alive every 30 seconds
                const keepAliveInterval = setInterval(() => {
                    try {
                        controller.enqueue(`data: ${JSON.stringify({ type: 'KEEP_ALIVE' })}\n\n`)
                    } catch {
                        clearInterval(keepAliveInterval)
                    }
                }, 30000)

                // Cleanup on close
                request.signal.addEventListener('abort', () => {
                    clearInterval(keepAliveInterval)
                    activeConnections.delete(userId)
                })
            }
        })

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Cache-Control'
            }
        })
    } catch (error) {
        return new Response('Internal server error', { status: 500 })
    }
}

// Helper functions
async function sendUnreadCount(userId: string, controller: ReadableStreamDefaultController) {
    try {
        const unreadCount = await prisma.notification.count({
            where: {
                userId,
                isRead: false
            }
        })

        controller.enqueue(`data: ${JSON.stringify({
            type: 'UNREAD_COUNT',
            count: unreadCount
        })}\n\n`)
            } catch (error) {
            // Handle error silently
        }
}

async function sendInitialData(userId: string, controller: ReadableStreamDefaultController) {
    try {
        // Send unread count
        await sendUnreadCount(userId, controller)

        // Send recent notifications
        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 20
        })

        controller.enqueue(`data: ${JSON.stringify({
            type: 'NOTIFICATIONS',
            notifications
        })}\n\n`)
            } catch (error) {
            // Handle error silently
        }
}

// Function to send notification to specific user
export async function sendNotificationToUser(userId: string, notification: any) {
    const controller = activeConnections.get(userId)
    if (controller) {
        try {
            controller.enqueue(`data: ${JSON.stringify({
                type: 'NEW_NOTIFICATION',
                notification
            })}\n\n`)

            // Update unread count
            sendUnreadCount(userId, controller)
        } catch (error) {
            activeConnections.delete(userId)
        }
    }
}

// Function to send notification to multiple users
export async function sendNotificationToUsers(userIds: string[], notification: any) {
    for (const userId of userIds) {
        await sendNotificationToUser(userId, notification)
    }
}
