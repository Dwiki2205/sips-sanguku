import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const { pathname } = request.nextUrl

  // Route yang tidak membutuhkan authentication
  const publicPaths = ['/login', '/registrasi', '/lupa-password', '/']
  const isPublicPath = publicPaths.some(path => pathname === path)

  // Route dashboard
  const isDashboardPath = pathname.startsWith('/owner') || 
                         pathname.startsWith('/pegawai') || 
                         pathname.startsWith('/pelanggan')

  // Redirect ke dashboard jika sudah login dan mengakses public path
  if (isPublicPath && token && pathname !== '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Redirect ke login jika belum login dan mengakses dashboard
  if (isDashboardPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}