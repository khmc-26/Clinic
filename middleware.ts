// middleware.ts - SIMPLIFIED VERSION
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    console.log('🔐 Middleware - Path:', pathname, 'Email:', token?.email, 'isDoctor:', token?.isDoctor)

    // Doctor dashboard protection
    if (pathname.startsWith('/dashboard')) {
      const isDoctor = token?.email === 'drkavithahc@gmail.com' || token?.isDoctor
      
      if (!isDoctor) {
        console.log('🔐 Middleware - Not a doctor, redirecting')
        return NextResponse.redirect(new URL('/doctor/login?error=doctor_access_required', req.url))
      }
      
      console.log('🔐 Middleware - Doctor access granted')
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname
        
        // Only require auth for dashboard
        if (pathname.startsWith('/dashboard')) {
          return !!token
        }
        
        return true
      }
    }
  }
)

export const config = {
  matcher: ['/dashboard/:path*']
}