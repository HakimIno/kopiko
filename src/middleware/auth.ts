import { Context, Next } from 'hono'
import { verify } from 'jsonwebtoken'

type AuthUser = {
  userId: string
}

declare module 'hono' {
  interface ContextVariables {
    user: AuthUser
  }
}

export const authMiddleware = async (c: Context, next: Next) => {
  try {
    const authHeader = c.req.header('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return c.json({ error: 'Missing or invalid authorization header' }, 401)
    }

    const token = authHeader.split(' ')[1]
    if (!token) {
      return c.json({ error: 'Missing token' }, 401)
    }

    if (!process.env.JWT_SECRET) {
      console.error('[AUTH_MIDDLEWARE] JWT_SECRET is not defined')
      return c.json({ error: 'Internal server error' }, 500)
    }

    try {
      const decoded = verify(token, process.env.JWT_SECRET) as { userId: string, email: string }
      if (!decoded.userId) {
        return c.json({ error: 'Invalid token payload' }, 401)
      }
      
      c.set('user', { userId: decoded.userId })
      await next()
    } catch (verifyError) {
      console.error('[AUTH_MIDDLEWARE] Token verification failed:', verifyError)
      return c.json({ error: 'Invalid token' }, 401)
    }
  } catch (error) {
    console.error('[AUTH_MIDDLEWARE] Unexpected error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
} 