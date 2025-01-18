import { Context } from 'hono'

interface RateLimitOptions {
  windowMs: number // Time window in milliseconds
  max: number // Max requests per window
}

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

export const rateLimitMiddleware = (options: RateLimitOptions) => {
  return async (c: Context, next: () => Promise<void>) => {
    const ip = c.req.header('x-forwarded-for') || 'unknown'
    const now = Date.now()
    
    // Clean up expired entries
    for (const key in store) {
      if (store[key].resetTime < now) {
        delete store[key]
      }
    }

    // Initialize or get existing record
    if (!store[ip] || store[ip].resetTime < now) {
      store[ip] = {
        count: 0,
        resetTime: now + options.windowMs
      }
    }

    // Increment request count
    store[ip].count++

    // Check if limit exceeded
    if (store[ip].count > options.max) {
      const resetTime = new Date(store[ip].resetTime)
      const minutesLeft = Math.ceil((store[ip].resetTime - now) / 60000)
      return c.json({
        error: `Too many attempts. Please try again in ${minutesLeft} minute${minutesLeft === 1 ? '' : 's'}.`,
        resetTime: resetTime.toISOString()
      }, 429)
    }

    await next()
  }
} 