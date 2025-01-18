import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Add paths that don't require authentication
const publicPaths = [
  '/sign-in',
  '/sign-up',
  '/api/auth/sign-in',
  '/api/auth/sign-up',
  '/api/auth/refresh'
]

// Auth pages that should redirect to home if user is logged in
const authPages = ['/sign-in', '/sign-up']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get access token
  const accessToken = request.cookies.get('accessToken')?.value || 
                     request.headers.get('Authorization')?.split(' ')[1]

  // If user is logged in and trying to access auth pages, redirect to home
  if (accessToken && authPages.some(path => pathname.startsWith(path))) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Allow public paths
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Check for access token for protected routes
  if (!accessToken) {
    // Redirect to login if accessing protected route without token
    if (request.headers.get('accept')?.includes('application/json')) {
      return new NextResponse(
        JSON.stringify({ error: 'Authentication required' }),
        {
          status: 401,
          headers: { 'content-type': 'application/json' },
        }
      )
    }

    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 