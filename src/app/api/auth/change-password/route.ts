import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { PrismaClient } from '@prisma/client'
import { hash, compare } from 'bcryptjs'
import { z } from 'zod'
import { authMiddleware } from '@/middleware/auth'
import { rateLimitMiddleware } from '@/middleware/rate-limit'

const app = new Hono()
const prisma = new PrismaClient()

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters")
})

// Apply rate limiting: 5 attempts per 15 minutes
app.use('/api/auth/change-password', rateLimitMiddleware({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5 // 5 attempts
}))

app.post('/api/auth/change-password', authMiddleware, async (c) => {
  try {
    const userId = c.req.query("userId")
    const body = await c.req.json()
    const { currentPassword, newPassword } = changePasswordSchema.parse(body)

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return c.json({ error: 'User not found' }, 404)
    }

    // Verify current password
    const isValidPassword = await compare(currentPassword, user.password)
    if (!isValidPassword) {
      return c.json({ error: 'Current password is incorrect' }, 401)
    }

    // Hash new password
    const hashedPassword = await hash(newPassword, 12)

    // Update password and invalidate all sessions by removing refresh token
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        refreshToken: null // Invalidate all sessions
      }
    })

    return c.json({
      message: 'Password changed successfully. Please log in again with your new password.'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: error.errors }, 400)
    }
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export const GET = handle(app)
export const POST = handle(app) 