// app/api/auth/magic-link/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateMagicToken } from '@/lib/auth'
import crypto from 'crypto'

// Add this function at the top (since sendEmail doesn't exist yet)
async function sendEmail({ to, subject, html }: {
  to: string;
  subject: string;
  html: string;
}) {
  // Use nodemailer directly
  const nodemailer = require('nodemailer')
  
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  })

  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('Email sent:', info.messageId)
    return true
  } catch (error) {
    console.error('Failed to send email:', error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Don't allow doctor email for magic link
    if (email === 'drkavithahc@gmail.com') {
      return NextResponse.json(
        { error: 'Doctors must use Google OAuth or password login' },
        { status: 400 }
      )
    }

    // Generate token
    const token = await generateMagicToken(email)
    const magicLink = `${process.env.NEXTAUTH_URL}/auth/magic?token=${token}&email=${encodeURIComponent(email)}`

    // Send email
    const emailSent = await sendEmail({
      to: email,
      subject: 'Your Magic Link for Patient Portal',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Your Magic Link</h2>
          <p>Click the link below to sign in to your patient portal:</p>
          <a href="${magicLink}" 
             style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Sign In to Patient Portal
          </a>
          <p style="margin-top: 20px; color: #666; font-size: 14px;">
            This link will expire in 24 hours. If you didn't request this, please ignore this email.
          </p>
        </div>
      `
    })

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
      { error: 'Failed to send magic link' },
      { status: 500 }
    )
  }
}