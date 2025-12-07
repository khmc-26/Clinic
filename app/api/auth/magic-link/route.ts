// app/api/auth/magic-link/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendMagicLinkEmail } from '@/lib/email'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Generate token
    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date()
    expires.setHours(expires.getHours() + 24) // Token valid for 24 hours

    // Delete any existing token for this email
    await prisma.verificationToken.deleteMany({
      where: { identifier: email }
    })

    // Save token in database
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    })

    console.log('Sending magic link to:', email)

    // Send email using nodemailer
    const emailSent = await sendMagicLinkEmail(email, token)

    if (!emailSent) {
      return NextResponse.json(
        { error: 'Failed to send magic link email' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Magic link sent to your email'
    })

  } catch (error: any) {
    console.error('Magic link error:', error)
    return NextResponse.json(
      { error: `Failed to send magic link: ${error.message}` },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Magic link API is running',
    method: 'Use POST to send magic link'
  })
}