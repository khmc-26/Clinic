import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for patient profile update
const patientProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  phone: z.string().regex(/^[0-9]{10}$/, "Phone must be 10 digits").optional(),
  age: z.coerce.number().min(0).max(120).optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  address: z.string().optional(),
  medicalHistory: z.string().optional(),
  allergies: z.string().optional(),
  emergencyContact: z.string().optional(),
  bloodGroup: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    // Get current user session
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get patient with user info - FIXED FIELD NAME
    const patient = await prisma.patient.findFirst({
      where: {
        user: {
          email: session.user.email
        }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            image: true,
            createdAt: true,
            updatedAt: true
          }
        },
        assignments: {  // CHANGED FROM doctorAssignments to assignments
          where: {
            isActive: true
          },
          include: {
            doctor: {
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
        }
      }
    })

    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      )
    }

    // Format response - FIXED: Include user in type check
    const profile = {
      id: patient.id,
      user: patient.user ? {
        id: patient.user.id,
        email: patient.user.email,
        name: patient.user.name,
        phone: patient.user.phone,
        image: patient.user.image,
        createdAt: patient.user.createdAt,
        updatedAt: patient.user.updatedAt
      } : null,
      age: patient.age,
      gender: patient.gender,
      address: patient.address,
      medicalHistory: patient.medicalHistory,
      allergies: patient.allergies,
      emergencyContact: patient.emergencyContact,
      bloodGroup: patient.bloodGroup,
      assignedDoctors: patient.assignments ? patient.assignments.map((assignment: any) => ({
        id: assignment.doctor.id,
        name: assignment.doctor.user.name,
        specialization: assignment.doctor.specialization,
        assignedAt: assignment.assignedAt
      })) : [],
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt
    }

    return NextResponse.json({
      success: true,
      profile
    })

  } catch (error) {
    console.error('Error fetching patient profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get current user session
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get patient
    const patient = await prisma.patient.findFirst({
      where: {
        user: {
          email: session.user.email
        }
      },
      include: {
        user: true
      }
    })

    if (!patient || !patient.user) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = patientProfileSchema.parse(body)

    // Update user info if name or phone is provided
    if (validatedData.name || validatedData.phone) {
      await prisma.user.update({
        where: { id: patient.userId },
        data: {
          ...(validatedData.name && { name: validatedData.name }),
          ...(validatedData.phone && { phone: validatedData.phone })
        }
      })
    }

    // Update patient info
    const updatedPatient = await prisma.patient.update({
      where: { id: patient.id },
      data: {
        ...(validatedData.age !== undefined && { age: validatedData.age }),
        ...(validatedData.gender && { gender: validatedData.gender }),
        ...(validatedData.address && { address: validatedData.address }),
        ...(validatedData.medicalHistory && { medicalHistory: validatedData.medicalHistory }),
        ...(validatedData.allergies && { allergies: validatedData.allergies }),
        ...(validatedData.emergencyContact && { emergencyContact: validatedData.emergencyContact }),
        ...(validatedData.bloodGroup && { bloodGroup: validatedData.bloodGroup })
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      profile: {
        id: updatedPatient.id,
        user: updatedPatient.user,
        age: updatedPatient.age,
        gender: updatedPatient.gender,
        address: updatedPatient.address,
        medicalHistory: updatedPatient.medicalHistory,
        allergies: updatedPatient.allergies,
        emergencyContact: updatedPatient.emergencyContact,
        bloodGroup: updatedPatient.bloodGroup,
        updatedAt: updatedPatient.updatedAt
      }
    })

  } catch (error) {
    console.error('Error updating patient profile:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Validation failed',
          details: error.issues  // CHANGED FROM error.errors to error.issues
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}