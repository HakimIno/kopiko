import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { PrismaClient } from '@prisma/client'
import { authMiddleware } from '@/middleware/auth'

type Variables = {
  user: {
    userId: string
  }
}

const app = new Hono<{ Variables: Variables }>()
const prisma = new PrismaClient()

app.post('/api/auth/logout', authMiddleware, async (c) => {
  try {
    const userId = c.get('user').userId
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    // Remove refresh token from database
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null }
    })

    return c.json({ message: 'Logged out successfully' })
  } catch (error) {
    console.error('[LOGOUT]', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export const GET = handle(app)
export const POST = handle(app) 