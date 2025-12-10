import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const loginAttempts = new Map<string, { count: number; expires: number }>()

export function rateLimitMiddleware(req: NextRequest) {
  const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown'
  const pathname = req.nextUrl.pathname
  
  // Only apply to login endpoints
  if (pathname.includes('/api/auth/') || pathname.includes('/doctor/login')) {
    const now = Date.now()
    const key = `${ip}:login`
    
    const attempt = loginAttempts.get(key)
    
    if (attempt && attempt.expires > now) {
      if (attempt.count >= 5) {
        return NextResponse.json(
          { error: 'Too many attempts. Try again in 15 minutes.' },
          { status: 429 }
        )
      }
      loginAttempts.set(key, { 
        count: attempt.count + 1, 
        expires: attempt.expires 
      })
    } else {
      loginAttempts.set(key, { 
        count: 1, 
        expires: now + 15 * 60 * 1000 // 15 minutes
      })
    }
    
    // Cleanup old entries every hour
    if (now % 3600000 < 1000) {
      for (const [key, value] of loginAttempts.entries()) {
        if (value.expires < now) {
          loginAttempts.delete(key)
        }
      }
    }
  }
  
  return null
}