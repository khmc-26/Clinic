// app/api/auth/callback/email/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get('token')
    const email = searchParams.get('email')

    console.log('Email callback params:', { token, email })

    if (!token || !email) {
      return NextResponse.redirect(new URL('/portal?error=InvalidToken', request.url))
    }

    // Verify token - find by both identifier and token
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        identifier: email,
        token: token,
      },
    })

    console.log('Found verification token:', verificationToken)

    if (!verificationToken) {
      return NextResponse.redirect(new URL('/portal?error=InvalidToken', request.url))
    }

    // Check if token expired
    if (verificationToken.expires < new Date()) {
      return NextResponse.redirect(new URL('/portal?error=TokenExpired', request.url))
    }

    // Get or create user
    let user = await prisma.user.findUnique({
      where: { email: decodeURIComponent(email) },
    })

    console.log('Found user:', user)

    if (!user) {
      // Create new patient user
      user = await prisma.user.create({
        data: {
          email: decodeURIComponent(email),
          role: 'PATIENT',
          patient: {
            create: {}
          }
        },
      })
      console.log('Created new user:', user)
    }

    // Delete used token
    await prisma.verificationToken.deleteMany({
      where: { 
        identifier: decodeURIComponent(email),
        token: token 
      }
    })

    // Redirect to portal with success message
    return NextResponse.redirect(new URL('/portal?tokenVerified=true', request.url))

  } catch (error: any) {
    console.error('Email callback error:', error)
    return NextResponse.redirect(new URL('/portal?error=ServerError', request.url))
  }
}