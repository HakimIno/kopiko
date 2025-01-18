import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'
import { z } from 'zod'

const app = new Hono()
const prisma = new PrismaClient()

const signUpSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters")
})

app.post('/api/auth/sign-up', async (c) => {
  try {
    const body = await c.req.json()
    const validatedData = signUpSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUser) {
      return c.json({ error: 'User already exists' }, 400)
    }

    // Hash password
    const hashedPassword = await hash(validatedData.password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword
      }
    })

    const {  ...userWithoutPassword } = user

    return c.json({ 
      message: 'User created successfully',
      user: userWithoutPassword 
    }, 201)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: error.errors }, 400)
    }
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export const GET = handle(app)
export const POST = handle(app) 