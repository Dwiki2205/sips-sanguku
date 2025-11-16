import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const { pathname } = request.nextUrl

  // Route yang tidak membutuhkan authentication
  const publicPaths = ['/', '/registrasi', '/lupa-password']
  const isPublicPath = publicPaths.includes(pathname)

  // Route dashboard/protected
  const isProtectedPath = pathname.startsWith('/owner') ||
                        pathname.startsWith('/manager') || 
                         pathname.startsWith('/pegawai') || 
                         pathname.startsWith('/pelanggan') ||
                         pathname.startsWith('/dashboard') ||
                         pathname.startsWith('/booking') ||
                         pathname.startsWith('/membership') ||
                         pathname.startsWith('/stok') ||
                         pathname.startsWith('/laporan')

  // **FIX: Redirect /login ke / (karena / adalah halaman login)**
  if (pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Jika sudah login dan mencoba akses public path (kecuali root), redirect ke dashboard
  if (token && isPublicPath && pathname !== '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Jika belum login dan mencoba akses protected path, redirect ke root (/)
  if (!token && isProtectedPath) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}