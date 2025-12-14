// app/api/auth/magic-link/route.ts - CREATE THIS FILE
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateMagicToken } from '@/lib/auth'
import { sendMagicLinkEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Don't allow doctor email for magic link
    if (normalizedEmail === 'drkavithahc@gmail.com') {
      return NextResponse.json(
        { error: 'Doctors must use Google OAuth or password login' },
        { status: 400 }
      )
    }

    // Check if email belongs to a doctor
    const doctor = await prisma.doctor.findFirst({
      where: {
        user: {
          email: normalizedEmail
        }
      }
    })

    if (doctor) {
      return NextResponse.json(
        { error: 'Doctors must use the doctor login page' },
        { status: 400 }
      )
    }

    // Generate magic token
    const token = await generateMagicToken(normalizedEmail)
    
    // Send magic link email
    const emailSent = await sendMagicLinkEmail(normalizedEmail, token)

    if (!emailSent) {
      return NextResponse.json(
        { error: 'Failed to send magic link email' },
        { status: 500 }
      )
    }

    console.log('Magic link sent to:', normalizedEmail)
    
    return NextResponse.json({
      success: true,
      message: 'Magic link sent to your email'
    })

  } catch (error: any) {
    console.error('Magic link error:', error)
    return NextResponse.json(
      { 
        error: error.message || 'Failed to send magic link',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}