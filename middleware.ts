import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  // Headers de sécurité
  const response = NextResponse.next()
  
  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' data:; " +
    "connect-src 'self'; " +
    "frame-ancestors 'none';"
  )
  
  // Protection contre clickjacking
  response.headers.set('X-Frame-Options', 'DENY')
  
  // Protection XSS
  response.headers.set('X-Content-Type-Options', 'nosniff')
  
  // Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // HSTS (HTTPS strict)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains'
    )
  }
  
  // Protection contre les attaques de type MIME
  response.headers.set('X-Content-Type-Options', 'nosniff')
  
  // Désactiver les features du navigateur non nécessaires
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  )

  // Vérification d'authentification pour les routes protégées
  const protectedPaths = ['/dashboard', '/profile']
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )

  if (isProtectedPath) {
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET 
    })

    if (!token) {
      const url = new URL('/auth/login', request.url)
      url.searchParams.set('callbackUrl', request.nextUrl.pathname)
      return NextResponse.redirect(url)
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
}
