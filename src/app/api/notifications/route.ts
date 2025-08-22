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
const markAsReadSchema = z.object({
    notificationId: z.string().uuid()
})

// GET /api/notifications - Get user's notifications
app.get('/api/notifications', authMiddleware, async (c) => {
    try {
        const userId = c.get('user').userId
        const { searchParams } = new URL(c.req.url)
        
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const unreadOnly = searchParams.get('unread') === 'true'
        
        const skip = (page - 1) * limit
        
        const where = {
            userId,
            ...(unreadOnly && { isRead: false })
        }
        
        const [notifications, total] = await Promise.all([
            prisma.notification.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.notification.count({ where })
        ])
        
        return c.json({
            notifications,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        })
    } catch (error) {
        console.error('[GET_NOTIFICATIONS]', error)
        return c.json({ error: 'Internal server error' }, 500)
    }
})

// POST /api/notifications/mark-read - Mark notification as read
app.post('/api/notifications/mark-read', authMiddleware, async (c) => {
    try {
        const userId = c.get('user').userId
        const body = await c.req.json()
        const { notificationId } = markAsReadSchema.parse(body)
        
        await prisma.notification.updateMany({
            where: {
                id: notificationId,
                userId
            },
            data: { isRead: true }
        })
        
        return c.json({ message: 'Notification marked as read' })
    } catch (error) {
        console.error('[MARK_AS_READ]', error)
        
        if (error instanceof z.ZodError) {
            return c.json({ errors: error.errors }, 400)
        }
        return c.json({ error: 'Internal server error' }, 500)
    }
})

// POST /api/notifications/mark-all-read - Mark all notifications as read
app.post('/api/notifications/mark-all-read', authMiddleware, async (c) => {
    try {
        const userId = c.get('user').userId
        
        await prisma.notification.updateMany({
            where: {
                userId,
                isRead: false
            },
            data: { isRead: true }
        })
        
        return c.json({ message: 'All notifications marked as read' })
    } catch (error) {
        console.error('[MARK_ALL_AS_READ]', error)
        return c.json({ error: 'Internal server error' }, 500)
    }
})

// GET /api/notifications/unread-count - Get unread count
app.get('/api/notifications/unread-count', authMiddleware, async (c) => {
    try {
        const userId = c.get('user').userId
        
        const count = await prisma.notification.count({
            where: {
                userId,
                isRead: false
            }
        })
        
        return c.json({ count })
    } catch (error) {
        console.error('[GET_UNREAD_COUNT]', error)
        return c.json({ error: 'Internal server error' }, 500)
    }
})

export const GET = handle(app)
export const POST = handle(app)
