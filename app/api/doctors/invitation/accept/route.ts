// app/api/doctors/invitation/accept/route.ts - UPDATED WITH CONFLICT RESOLUTION
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'

// Helper function to generate random color
function getRandomColor() {
  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

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

    // Check if email already has a user and their status
    const existingUser = await prisma.user.findUnique({
      where: { email: invitation.email },
      include: {
        doctor: true,
        patient: true
      }
    })

    let user = null
    let doctor = null
    let actionTaken = 'created' // created, converted, or restored

    // Handle different user states
    if (existingUser) {
      // 1. Active doctor exists - should have been caught by validation
      if (existingUser.doctor && !existingUser.doctor.deletedAt) {
        return NextResponse.json(
          { error: 'Doctor account already exists with this email' },
          { status: 400 }
        )
      }

      // 2. Deleted doctor exists - restore it
      if (existingUser.doctor && existingUser.doctor.deletedAt) {
        // Update user info
        user = await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            name: name,
            role: 'DOCTOR'
          }
        })

        // Restore deleted doctor
        doctor = await prisma.doctor.update({
          where: { id: existingUser.doctor.id },
          data: {
            deletedAt: null,
            isActive: true,
            isAdmin: invitation.role === 'ADMIN'
          }
        })
        
        actionTaken = 'restored'
      }
      // 3. Patient exists - convert to doctor
      else if (existingUser.patient) {
        // Update user info and role
        user = await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            name: name,
            role: 'DOCTOR'
          }
        })

        // Create doctor record for existing patient
        doctor = await prisma.doctor.create({
          data: {
            userId: existingUser.id,
            specialization: 'Homoeopathy',
            qualifications: [],
            experience: 0,
            consultationFee: 0,
            isAdmin: invitation.role === 'ADMIN',
            isActive: true,
            colorCode: getRandomColor()
          }
        })
        
        actionTaken = 'converted'
      }
      // 4. User exists but no role - add doctor role
      else {
        // Update user info and role
        user = await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            name: name,
            role: 'DOCTOR'
          }
        })

        // Create doctor record
        doctor = await prisma.doctor.create({
          data: {
            userId: existingUser.id,
            specialization: 'Homoeopathy',
            qualifications: [],
            experience: 0,
            consultationFee: 0,
            isAdmin: invitation.role === 'ADMIN',
            isActive: true,
            colorCode: getRandomColor()
          }
        })
        
        actionTaken = 'upgraded'
      }
    } else {
      // 5. No user exists - create new user and doctor
      user = await prisma.user.create({
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
              consultationFee: 0,
              isAdmin: invitation.role === 'ADMIN',
              isActive: true,
              colorCode: getRandomColor()
            }
          }
        },
        include: {
          doctor: true
        }
      })
      
      doctor = user.doctor
    }

    // Create or update doctor credentials
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // Check if credentials already exist (for restored/converted doctors)
    const existingCredentials = await prisma.doctorCredentials.findUnique({
      where: { doctorId: doctor!.id }
    })

    if (existingCredentials) {
      // Update existing credentials with new password
      await prisma.doctorCredentials.update({
        where: { doctorId: doctor!.id },
        data: {
          passwordHash,
          saltRounds,
          lastPasswordChange: new Date(),
          failedAttempts: 0,
          lockedUntil: null
        }
      })
    } else {
      // Create new credentials
      await prisma.doctorCredentials.create({
        data: {
          doctorId: doctor!.id,
          email: invitation.email,
          passwordHash,
          saltRounds,
          lastPasswordChange: new Date()
        }
      })
    }

    // Mark invitation as accepted
    await prisma.doctorInvitation.update({
      where: { id: invitation.id },
      data: {
        acceptedAt: new Date()
      }
    })

    // Create default availability (Monday-Friday, 9 AM - 5 PM) if not exists
    const existingAvailability = await prisma.doctorAvailability.findMany({
      where: { doctorId: doctor!.id }
    })

    if (existingAvailability.length === 0) {
      const defaultAvailability = []
      for (let day = 1; day <= 5; day++) { // Monday to Friday
        defaultAvailability.push({
          doctorId: doctor!.id,
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
    }

    return NextResponse.json({
      success: true,
      message: `Account ${actionTaken} successfully`,
      doctorId: doctor!.id,
      action: actionTaken
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