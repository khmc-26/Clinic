// app/api/doctors/[id]/route.ts - FIXED
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const doctorId = params.id

    // Check if doctor exists
    const currentDoctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      include: { 
        user: true,
        credentials: true
      }
    })

    if (!currentDoctor) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      )
    }

    // Cannot delete yourself
    if (currentDoctor.user.email === session.user.email) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      )
    }

    // Check if doctor is admin (prevent deleting admin doctors)
    if (currentDoctor.isAdmin) {
      return NextResponse.json(
        { error: 'Cannot delete admin doctors' },
        { status: 400 }
      )
    }

    // Check if already deleted
    if (currentDoctor.deletedAt) {
      return NextResponse.json(
        { error: 'Doctor is already deleted' },
        { status: 400 }
      )
    }

    // SOFT DELETE ONLY THE DOCTOR (not cascade since schema doesn't support it)
    const doctor = await prisma.doctor.update({
      where: { id: doctorId },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Doctor soft deleted successfully',
      doctor
    })
  } catch (error) {
    console.error('Error deleting doctor:', error)
    
    // Check if doctor doesn't exist
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to delete doctor' },
      { status: 500 }
    )
  }
}

// GET method remains the same...
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.isDoctor) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const doctorId = params.id

    const doctor = await prisma.doctor.findUnique({
      where: { 
        id: doctorId,
        deletedAt: null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        appointments: {
          select: {
            id: true
          }
        },
        patientAssignments: {
          where: {
            isActive: true
          },
          select: {
            id: true
          }
        },
        availabilities: {
          select: {
            dayOfWeek: true,
            startTime: true,
            endTime: true,
            isActive: true
          }
        }
      }
    })

    if (!doctor) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(doctor)
  } catch (error) {
    console.error('Error fetching doctor:', error)
    return NextResponse.json(
      { error: 'Failed to fetch doctor' },
      { status: 500 }
    )
  }
}