// app/api/auth/magic/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateMagicToken, createUserFromEmail } from '@/lib/auth'
import { signIn } from 'next-auth/react'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get('token')
    const email = searchParams.get('email')

    if (!token || !email) {
      return NextResponse.redirect(new URL('/portal/login?error=invalid_link', request.url))
    }

    // Validate token
    const isValid = await validateMagicToken(email, token)
    if (!isValid) {
      return NextResponse.redirect(new URL('/portal/login?error=expired_link', request.url))
    }

    // Create or get user
    const user = await createUserFromEmail(email)

    // Clean up used token
    await prisma.verificationToken.deleteMany({
      where: { identifier: email, token }
    })

    // Redirect to portal with auth
    const url = new URL('/portal', request.url)
    url.searchParams.set('magic', 'true')
    url.searchParams.set('email', email)

    // In a real implementation, you'd create a session here
    // For now, we'll redirect and handle the session in the portal page
    return NextResponse.redirect(url)

  } catch (error: any) {
    console.error('Magic verification error:', error)
    return NextResponse.redirect(new URL('/portal/login?error=verification_failed', request.url))
  }
}