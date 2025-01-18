import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { PrismaClient } from '@prisma/client'
import { sign, verify } from 'jsonwebtoken'
import { z } from 'zod'

const app = new Hono()
const prisma = new PrismaClient()

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'your-refresh-secret'

const refreshSchema = z.object({
  refreshToken: z.string()
})

app.post('/api/auth/refresh', async (c) => {
  try {
    const body = await c.req.json()
    const { refreshToken } = refreshSchema.parse(body)

    // Find user with this refresh token
    const user = await prisma.user.findFirst({
      where: { refreshToken }
    })

    if (!user) {
      return c.json({ error: 'Invalid refresh token' }, 401)
    }

    try {
      // Verify refresh token
      verify(refreshToken, REFRESH_SECRET)

      // Generate new access token
      const newAccessToken = sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '15m' }
      )

      // Generate new refresh token
      const newRefreshToken = sign(
        { userId: user.id },
        REFRESH_SECRET,
        { expiresIn: '7d' }
      )

      // Update refresh token in database
      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: newRefreshToken }
      })

      return c.json({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      })
    } catch (error) {
      // If refresh token is expired, remove it from database
      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: null }
      })
      return c.json({ error: 'Refresh token expired' }, 401)
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: error.errors }, 400)
    }
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export const GET = handle(app)
export const POST = handle(app) 