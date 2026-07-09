import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password']
const AUTH_ROUTES = ['/login', '/register']
const STATIC_EXTENSIONS = ['.png','.jpg','.jpeg','.svg','.ico','.webp','.woff','.woff2','.ttf']

function isStaticFile(pathname: string): boolean { return STATIC_EXTENSIONS.some((ext) => pathname.endsWith(ext)) }
function isPublicRoute(pathname: string): boolean { return PUBLIC_ROUTES.some((route) => pathname.startsWith(route)) }
function isAuthRoute(pathname: string): boolean { return AUTH_ROUTES.some((route) => pathname.startsWith(route)) }

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.startsWith('/icons') || isStaticFile(pathname)) {
    return NextResponse.next()
  }
  const sessionCookie = request.cookies.get('__session')?.value ?? request.cookies.get('firebase-auth-token')?.value
  const isAuthenticated = Boolean(sessionCookie)
  if (isAuthenticated && isAuthRoute(pathname)) return NextResponse.redirect(new URL('/dashboard', request.url))
  if (!isAuthenticated && !isPublicRoute(pathname)) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.json|icons|sw.js|workbox-.*\\.js).*)'],
}
