import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { PrismaClient } from '@prisma/client'
import { compare } from 'bcryptjs'
import { sign } from 'jsonwebtoken'
import { z } from 'zod'
import { rateLimitMiddleware } from '@/middleware/rate-limit'

const app = new Hono()
const prisma = new PrismaClient()

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'your-refresh-secret'

const signInSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required")
})

// Apply rate limiting: 10 attempts per 5 minutes
app.use('/api/auth/sign-in', rateLimitMiddleware({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10 // 10 attempts
}))

app.post('/api/auth/sign-in', async (c) => {
    try {
        const { email, password } = signInSchema.parse(await c.req.json())

        // Find user
        const user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user) {
            return c.json({ error: 'Invalid credentials' }, 401)
        }

        // Verify password
        const isValidPassword = await compare(password, user.password)
        if (!isValidPassword) {
            return c.json({ error: 'Invalid credentials' }, 401)
        }

        const { id } = user

        // Generate access token
        const accessToken = sign(
            { userId: id, email },
            JWT_SECRET,
            { expiresIn: '15m' }
        )

        // Generate refresh token
        const refreshToken = sign(
            { userId: id },
            REFRESH_SECRET,
            { expiresIn: '7d' }
        )

        // Store refresh token in database
        await prisma.user.update({
            where: { id },
            data: { refreshToken }
        })

        // Remove password from response
        const {  ...userWithoutPassword } = user

        return c.json({
            message: 'Login successful',
            user: userWithoutPassword,
            accessToken,
            refreshToken
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