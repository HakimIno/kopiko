    import { Hono } from 'hono'
    import { handle } from 'hono/vercel'
    import { createNodeWebSocket } from '@hono/node-ws'
    import { PrismaClient } from '@prisma/client'
    import { verify } from 'jsonwebtoken'

    // Types
    type Variables = {
        user: {
            userId: string
        }
    }

    // Initialize
    const app = new Hono<{ Variables: Variables }>()
    const prisma = new PrismaClient()

    // Store active connections
    const activeConnections = new Map<string, any>()

    // WebSocket handler
    const { upgradeWebSocket } = createNodeWebSocket({ app })

    app.get('/api/notifications/ws', upgradeWebSocket((c: any) => {
        let userId: string | null = null

        // Extract token from query parameters
        const url = new URL(c.req.url)
        const token = url.searchParams.get('token')

        if (!token) {
            return {
                onOpen(event: Event, ws: any) {
                    ws.send(JSON.stringify({
                        type: 'AUTH_ERROR',
                        message: 'No token provided'
                    }))
                    ws.close(1008, 'Authentication required')
                }
            }
        }

        try {
            // Verify token
            const decoded = verify(token, process.env.JWT_SECRET!) as { userId: string, email: string }
            userId = decoded.userId

            if (!userId) {
                return {
                    onOpen(event: Event, ws: any) {
                        ws.send(JSON.stringify({
                            type: 'AUTH_ERROR',
                            message: 'Invalid token payload'
                        }))
                        ws.close(1008, 'Invalid token')
                    }
                }
            }
        } catch {
            return {
                onOpen(event: Event, ws: any) {
                    ws.send(JSON.stringify({
                        type: 'AUTH_ERROR',
                        message: 'Token verification failed'
                    }))
                    ws.close(1008, 'Token verification failed')
                }
            }
        }

        return {
            onOpen(event: Event, ws: any) {
                console.log(`User ${userId} connected to WebSocket`)
                activeConnections.set(userId!, ws)

                // Send initial unread notifications count
                sendUnreadCount(userId!, ws)
            },

            onMessage(event: MessageEvent, ws: any) {
                try {
                    const data = JSON.parse(event.data as string)

                    switch (data.type) {
                        case 'MARK_AS_READ':
                            handleMarkAsRead(userId!, data.notificationId)
                            break
                        case 'MARK_ALL_AS_READ':
                            handleMarkAllAsRead(userId!)
                            break
                        case 'GET_NOTIFICATIONS':
                            sendNotifications(userId!, ws)
                            break
                    }
                } catch (error) {
                    console.error('WebSocket message error:', error)
                }
            },

            onClose(event: CloseEvent, ws: any) {
                console.log(`User ${userId} disconnected from WebSocket`)
                activeConnections.delete(userId!)
            },

            onError(error: Event, ws: any) {
                console.error(`WebSocket error for user ${userId}:`, error)
                activeConnections.delete(userId!)
            }
        }
    }))

    // Helper functions
    async function sendUnreadCount(userId: string, ws: WebSocket) {
        try {
            const unreadCount = await prisma.notification.count({
                where: {
                    userId,
                    isRead: false
                }
            })

            ws.send(JSON.stringify({
                type: 'UNREAD_COUNT',
                count: unreadCount
            }))
        } catch (error) {
            console.error('Error sending unread count:', error)
        }
    }
    async function sendNotifications(userId: string, ws: WebSocket) {
        try {
            const notifications = await prisma.notification.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take: 50
            })

            ws.send(JSON.stringify({
                type: 'NOTIFICATIONS',
                notifications
            }))
        } catch (error) {
            console.error('Error sending notifications:', error)
        }
    }

    async function handleMarkAsRead(userId: string, notificationId: string) {
        try {
            await prisma.notification.updateMany({
                where: {
                    id: notificationId,
                    userId
                },
                data: { isRead: true }
            })

            // Send updated unread count
            const ws = activeConnections.get(userId)
            if (ws) {
                sendUnreadCount(userId, ws)
            }
        } catch (error) {
            console.error('Error marking notification as read:', error)
        }
    }

    async function handleMarkAllAsRead(userId: string) {
        try {
            await prisma.notification.updateMany({
                where: {
                    userId,
                    isRead: false
                },
                data: { isRead: true }
            })

            // Send updated unread count
            const ws = activeConnections.get(userId)
            if (ws) {
                sendUnreadCount(userId, ws)
            }
        } catch (error) {
            console.error('Error marking all notifications as read:', error)
        }
    }

    // Function to send notification to specific user
    export async function sendNotificationToUser(userId: string, notification: any) {
        const ws = activeConnections.get(userId)
        if (ws) {
            ws.send(JSON.stringify({
                type: 'NEW_NOTIFICATION',
                notification
            }))

            // Update unread count
            sendUnreadCount(userId, ws)
        }
    }

    // Function to send notification to multiple users
    export async function sendNotificationToUsers(userIds: string[], notification: any) {
        for (const userId of userIds) {
            await sendNotificationToUser(userId, notification)
        }
    }

    export const GET = handle(app)

