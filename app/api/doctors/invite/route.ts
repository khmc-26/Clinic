// app/api/doctors/invite/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import crypto from 'crypto'
import { sendDoctorInvitationEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { email, role, specialization } = await request.json()

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Check if invitation already exists and is not expired
    const existingInvitation = await prisma.doctorInvitation.findUnique({
      where: { email }
    })

    if (existingInvitation && existingInvitation.expiresAt > new Date()) {
      return NextResponse.json(
        { error: 'Invitation already sent and still valid' },
        { status: 400 }
      )
    }

    // Get the inviter doctor
    const inviterDoctor = await prisma.doctor.findFirst({
      where: {
        user: {
          email: session.user.email
        }
      }
    })

    if (!inviterDoctor) {
      return NextResponse.json(
        { error: 'Inviter doctor not found' },
        { status: 500 }
      )
    }

    // Generate token
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours

    // Create invitation
    const invitation = await prisma.doctorInvitation.create({
      data: {
        email,
        invitedBy: inviterDoctor.id,
        token,
        role,
        expiresAt
      }
    })

    // Send invitation email
    const invitationUrl = `${process.env.NEXTAUTH_URL}/doctor/accept-invitation?token=${token}`
    await sendDoctorInvitationEmail(email, invitationUrl, specialization, role)

    return NextResponse.json({
      message: 'Invitation sent successfully',
      invitationId: invitation.id,
      expiresAt: invitation.expiresAt
    })
  } catch (error) {
    console.error('Error sending invitation:', error)
    return NextResponse.json(
      { error: 'Failed to send invitation' },
      { status: 500 }
    )
  }
}