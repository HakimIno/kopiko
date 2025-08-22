import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { PrismaClient } from '@prisma/client'
import { authMiddleware } from '@/middleware/auth'

// Types
type Variables = {
    user: {
        userId: string
    }
}

// Initialize
const app = new Hono<{ Variables: Variables }>()
const prisma = new PrismaClient()

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

export const POST = handle(app)
