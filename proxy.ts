import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const protectedRoutes = ['/profile', '/dashboard', '/dashboard/freelance', '/dashboard/client']
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route))

  if (isProtected) {
    const token = request.cookies.get('sb-zfqxgjbqrnsnyfkplhxt-auth-token')
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/profile/:path*', '/dashboard/:path*']
}
