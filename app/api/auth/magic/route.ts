// app/api/auth/magic/route.ts - FIXED
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Handle GET request for token validation
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const email = searchParams.get('email')

    if (!token || !email) {
      return NextResponse.json(
        { error: 'Token and email are required' },
        { status: 400 }
      )
    }

    // Find the verification token
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        identifier: email,
        token,
        expires: {
          gt: new Date()
        }
      }
    })

    if (!verificationToken) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      email: email
    })

  } catch (error) {
    console.error('Magic link verification error:', error)
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    )
  }
}

// Handle POST request for token authentication
export async function POST(request: NextRequest) {
  try {
    const { token, email } = await request.json() // Get both token AND email

    if (!token || !email) {
      return NextResponse.json(
        { error: 'Token and email are required' },
        { status: 400 }
      )
    }

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }

    // Find the verification token
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        token,
        expires: {
          gt: new Date()
        }
      }
    })

    if (!verificationToken) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      )
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: verificationToken.identifier },
      include: {
        patient: true,
        doctor: true
      }
    })

    if (!user) {
      // Create new patient user
      user = await prisma.user.create({
        data: {
          email: verificationToken.identifier,
          role: 'PATIENT',
          emailVerified: new Date(),
          patient: {
            create: {}
          }
        },
        include: {
          patient: true,
          doctor: true
        }
      })
    }

    // Clean up the token
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: verificationToken.identifier,
          token: verificationToken.token
        }
      }
    })

    return NextResponse.json({
      success: true,
      email: user.email,
      userId: user.id
    })

  } catch (error) {
    console.error('Magic link error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}