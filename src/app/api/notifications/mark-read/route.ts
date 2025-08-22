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

export const POST = handle(app)
