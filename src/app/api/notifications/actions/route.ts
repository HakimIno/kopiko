import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { PrismaClient } from '@prisma/client'
import { authMiddleware } from '@/middleware/auth'
import { z } from 'zod'

// Types
type Variables = {
    user: {
        userId: string
    }
}

// Initialize
const app = new Hono<{ Variables: Variables }>()
const prisma = new PrismaClient()

// Validation schemas
const actionSchema = z.object({
    notificationId: z.string().uuid(),
    action: z.enum(['accept', 'reject'])
})

// POST /api/notifications/actions - Handle notification actions
app.post('/api/notifications/actions', authMiddleware, async (c) => {
    try {
        const userId = c.get('user').userId
        const body = await c.req.json()
        const { notificationId, action } = actionSchema.parse(body)
        
        // Get notification with data
        const notification = await prisma.notification.findFirst({
            where: {
                id: notificationId,
                userId
            },
            include: {
                user: true
            }
        })
        
        if (!notification) {
            return c.json({ error: 'Notification not found' }, 404)
        }
        
        // Handle different notification types
        switch (notification.type) {
            case 'WORKSPACE_INVITE':
                return await handleWorkspaceInviteAction(c, notification, action, userId)
            default:
                return c.json({ error: 'Unsupported notification type' }, 400)
        }
    } catch (error) {
        console.error('[NOTIFICATION_ACTION]', error)
        
        if (error instanceof z.ZodError) {
            return c.json({ errors: error.errors }, 400)
        }
        return c.json({ error: 'Internal server error' }, 500)
    }
})

async function handleWorkspaceInviteAction(
    c: any, 
    notification: any, 
    action: string, 
    userId: string
) {
    try {
        const data = notification.data as any
        const invitationId = data.invitationId
        
        if (!invitationId) {
            return c.json({ error: 'Invalid invitation data' }, 400)
        }
        
        // Get invitation
        const invitation = await prisma.workspaceInvitation.findFirst({
            where: {
                id: invitationId
            },
            include: {
                workspace: true
            }
        })
        
        if (!invitation) {
            return c.json({ error: 'Invitation not found' }, 404)
        }
        
        if (invitation.status !== 'PENDING') {
            return c.json({ error: 'Invitation already processed' }, 400)
        }
        
        if (action === 'accept') {
            // Accept invitation
            await prisma.$transaction(async (tx) => {
                // Update invitation status
                await tx.workspaceInvitation.update({
                    where: { id: invitationId },
                    data: { status: 'ACCEPTED' }
                })
                
                // Add user to workspace
                await tx.userWorkspace.create({
                    data: {
                        userId,
                        workspaceId: invitation.workspaceId,
                        role: invitation.role
                    }
                })
                
                // Mark notification as read
                await tx.notification.update({
                    where: { id: notification.id },
                    data: { isRead: true }
                })
            })
            
            return c.json({ 
                message: 'Invitation accepted successfully',
                workspaceId: invitation.workspaceId
            })
        } else {
            // Reject invitation
            await prisma.$transaction(async (tx) => {
                // Update invitation status
                await tx.workspaceInvitation.update({
                    where: { id: invitationId },
                    data: { status: 'REJECTED' }
                })
                
                // Mark notification as read
                await tx.notification.update({
                    where: { id: notification.id },
                    data: { isRead: true }
                })
            })
            
            return c.json({ message: 'Invitation rejected' })
        }
    } catch (error) {
        console.error('[HANDLE_WORKSPACE_INVITE_ACTION]', error)
        return c.json({ error: 'Failed to process invitation' }, 500)
    }
}

export const POST = handle(app)
