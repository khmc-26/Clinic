// app/api/doctors/invite/route.ts - FIXED (No patient conversion during invitation)
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

    const { email, role, specialization, restoreDeleted } = await request.json()

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: {
        doctor: true,
        patient: true
      }
    })

    // Handle existing users based on type
    if (existingUser) {
      // 1. Active doctor account exists
      if (existingUser.doctor && !existingUser.doctor.deletedAt) {
        return NextResponse.json(
          { error: 'A doctor account already exists with this email' },
          { status: 400 }
        )
      }

      // 2. Deleted doctor account - restore if requested
      if (existingUser.doctor && existingUser.doctor.deletedAt) {
        if (!restoreDeleted) {
          return NextResponse.json(
            { error: 'This doctor was previously deleted. Check "Restore Account" to proceed.' },
            { status: 400 }
          )
        }

        // Restore deleted doctor
        await prisma.doctor.update({
          where: { id: existingUser.doctor.id },
          data: {
            deletedAt: null,
            isActive: true,
            specialization,
            isAdmin: role === 'ADMIN'
          }
        })
        
        // Note: For restored doctors, we still send invitation so they can set password
      }

      // 3. Patient account - ALLOW invitation (conversion happens during acceptance)
      // No action needed here - just allow the invitation
      
      // 4. User exists but no patient/doctor record - ALLOW invitation
      // No action needed here
    }

    // Get the inviter doctor
    const inviterDoctor = await prisma.doctor.findFirst({
      where: {
        user: {
          email: session.user.email || undefined
        }
      }
    })

    if (!inviterDoctor) {
      return NextResponse.json(
        { error: 'Inviter doctor not found' },
        { status: 500 }
      )
    }

    // Check if invitation already exists and is not expired
    const existingInvitation = await prisma.doctorInvitation.findUnique({
      where: { email }
    })

    // If invitation exists and is not expired, prevent sending new one
    if (existingInvitation && existingInvitation.expiresAt > new Date()) {
      return NextResponse.json(
        { error: 'Invitation already sent and still valid' },
        { status: 400 }
      )
    }

    // If invitation exists but is expired, delete it
    if (existingInvitation && existingInvitation.expiresAt <= new Date()) {
      await prisma.doctorInvitation.delete({
        where: { email }
      })
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

    // Determine message based on user status
    let message = 'Invitation sent successfully'
    let action = 'invited'
    
    if (existingUser) {
      if (existingUser.doctor && existingUser.doctor.deletedAt) {
        message = 'Doctor restored and invitation sent'
        action = 'restored'
      } else if (existingUser.patient) {
        message = 'Invitation sent to patient - conversion will happen during acceptance'
        action = 'patient_invited'
      } else {
        message = 'Invitation sent to existing user'
        action = 'existing_user_invited'
      }
    }

    return NextResponse.json({
      message,
      invitationId: invitation.id,
      expiresAt: invitation.expiresAt,
      action
    })
  } catch (error) {
    console.error('Error sending invitation:', error)
    return NextResponse.json(
      { error: 'Failed to send invitation' },
      { status: 500 }
    )
  }
}