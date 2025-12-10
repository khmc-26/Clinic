// app/api/doctors/invitation/accept/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'

export async function POST(request: NextRequest) {
  try {
    const { token, name, password } = await request.json()

    if (!token || !name || !password) {
      return NextResponse.json(
        { error: 'Token, name, and password are required' },
        { status: 400 }
      )
    }

    // Find and validate invitation
    const invitation = await prisma.doctorInvitation.findUnique({
      where: { token }
    })

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      )
    }

    if (invitation.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Invitation has expired' },
        { status: 400 }
      )
    }

    if (invitation.acceptedAt) {
      return NextResponse.json(
        { error: 'Invitation already accepted' },
        { status: 400 }
      )
    }

    // Check if email already has a user
    const existingUser = await prisma.user.findUnique({
      where: { email: invitation.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email: invitation.email,
        name: name,
        role: 'DOCTOR',
        emailVerified: new Date(),
        doctor: {
          create: {
            specialization: 'Homoeopathy',
            qualifications: [],
            experience: 0,
            consultationFee: 0, // Admin will set this later
            isAdmin: invitation.role === 'ADMIN',
            isActive: true,
            colorCode: `#${Math.floor(Math.random()*16777215).toString(16)}` // Random color
          }
        }
      },
      include: {
        doctor: true
      }
    })

    // Create doctor credentials
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(password, saltRounds)

    await prisma.doctorCredentials.create({
      data: {
        doctorId: user.doctor!.id,
        email: invitation.email,
        passwordHash,
        saltRounds,
        lastPasswordChange: new Date()
      }
    })

    // Mark invitation as accepted
    await prisma.doctorInvitation.update({
      where: { id: invitation.id },
      data: {
        acceptedAt: new Date()
      }
    })

    // Create default availability (Monday-Friday, 9 AM - 5 PM)
    const defaultAvailability = []
    for (let day = 1; day <= 5; day++) { // Monday to Friday
      defaultAvailability.push({
        doctorId: user.doctor!.id,
        dayOfWeek: day,
        startTime: '09:00',
        endTime: '17:00',
        isActive: true,
        slotDuration: 30,
        maxPatients: 1
      })
    }

    await prisma.doctorAvailability.createMany({
      data: defaultAvailability
    })

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      doctorId: user.doctor!.id
    })

  } catch (error: any) {
    console.error('Error accepting invitation:', error)
    
    // Handle duplicate email error
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return NextResponse.json(
        { error: 'Email already exists in the system' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to accept invitation' },
      { status: 500 }
    )
  }
}