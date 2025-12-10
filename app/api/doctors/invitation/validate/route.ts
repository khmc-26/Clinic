// app/api/doctors/invitation/validate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required', valid: false },
        { status: 400 }
      )
    }

    // Find the invitation
    const invitation = await prisma.doctorInvitation.findUnique({
      where: { token },
      include: {
        inviter: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    })

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitation not found', valid: false, status: 'NOT_FOUND' },
        { status: 404 }
      )
    }

    // Check if expired
    if (invitation.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Invitation expired', valid: false, status: 'EXPIRED' },
        { status: 400 }
      )
    }

    // Check if already accepted
    if (invitation.acceptedAt) {
      return NextResponse.json(
        { error: 'Invitation already accepted', valid: false, status: 'ACCEPTED' },
        { status: 400 }
      )
    }

    // Check if email already has a user
    const existingUser = await prisma.user.findUnique({
      where: { email: invitation.email },
      include: { doctor: true }
    })

    if (existingUser?.doctor) {
      return NextResponse.json(
        { error: 'Doctor with this email already exists', valid: false, status: 'EXISTS' },
        { status: 400 }
      )
    }

    // Valid invitation
    return NextResponse.json({
      valid: true,
      invitation: {
        email: invitation.email,
        role: invitation.role,
        invitedBy: invitation.inviter.user.name || invitation.inviter.user.email,
        expiresAt: invitation.expiresAt
      }
    })

  } catch (error) {
    console.error('Error validating invitation:', error)
    return NextResponse.json(
      { error: 'Failed to validate invitation', valid: false },
      { status: 500 }
    )
  }
}