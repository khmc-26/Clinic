// /app/api/doctors/[id]/availability/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// GET: Get doctor's availability
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    // Only doctors or admins can view availability
    if (!session?.user?.isDoctor && !session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const doctorId = params.id

    // Check if doctor exists and is active
    const doctor = await prisma.doctor.findUnique({
      where: { 
        id: doctorId,
        isActive: true,
        deletedAt: null
      }
    })

    if (!doctor) {
      return NextResponse.json(
        { error: 'Doctor not found or inactive' },
        { status: 404 }
      )
    }

    // Check permission: Either admin or the doctor themselves
    if (!session.user.isAdmin && doctor.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only view your own availability' },
        { status: 403 }
      )
    }

    // Get all availability slots for this doctor
    const availability = await prisma.doctorAvailability.findMany({
      where: {
        doctorId: doctorId
      },
      orderBy: {
        dayOfWeek: 'asc'
      }
    })

    return NextResponse.json(availability)
  } catch (error) {
    console.error('Error fetching availability:', error)
    return NextResponse.json(
      { error: 'Failed to fetch availability' },
      { status: 500 }
    )
  }
}

// PUT: Update doctor's availability (full replacement)
// PUT: Update doctor's availability (full replacement)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let session: any; // Declare session at function scope

  try {
    session = await getServerSession(authOptions); // Now accessible in catch block
    
    if (!session?.user?.isDoctor && !session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const doctorId = params.id
    const body = await request.json()
    const { availability } = body

    // ... validation code remains the same ...

    // Get user from database using email (this is the fix!)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Start transaction to replace all availability
    const result = await prisma.$transaction(async (tx) => {
      // Delete existing availability for this doctor
      await tx.doctorAvailability.deleteMany({
        where: { doctorId: doctorId }
      })

      // Create new availability slots
      const newSlots = []
      for (const slot of availability) {
        const newSlot = await tx.doctorAvailability.create({
          data: {
            doctorId: doctorId,
            dayOfWeek: slot.dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
            isActive: slot.isActive,
            slotDuration: slot.slotDuration,
            maxPatients: slot.maxPatients
          }
        })
        newSlots.push(newSlot)
      }
      
      // Create audit log - USE user.id FROM DATABASE
      await tx.auditLog.create({
        data: {
          action: 'UPDATE_AVAILABILITY',
          entityType: 'DOCTOR_AVAILABILITY',
          entityId: doctorId,
          userId: user.id, // FIXED: Use database user ID
          userEmail: session.user.email,
          userRole: session.user.role,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
          requestPath: request.nextUrl.pathname,
          requestMethod: 'PUT',
          metadata: {
            doctorId,
            slotsCount: newSlots.length,
            activeDays: availability.filter(s => s.isActive).length
          },
          success: true
        }
      })

      return newSlots
    })

    return NextResponse.json({
      success: true,
      message: 'Availability updated successfully',
      availability: result,
      count: result.length
    })
  } catch (error) {
    console.error('Error updating availability:', error)
    
    // Create audit log for failure - session is now accessible
    try {
      // Get user from database for audit log
      let userForAudit = null;
      if (session?.user?.email) {
        userForAudit = await prisma.user.findUnique({
          where: { email: session.user.email }
        });
      }
      
      await prisma.auditLog.create({
        data: {
          action: 'UPDATE_AVAILABILITY',
          entityType: 'DOCTOR_AVAILABILITY',
          entityId: params.id,
          userId: userForAudit?.id, // Use database user ID
          userEmail: session?.user?.email,
          userRole: session?.user?.role,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
          requestPath: request.nextUrl.pathname,
          requestMethod: 'PUT',
          success: false,
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        }
      })
    } catch (auditError) {
      console.error('Failed to create audit log:', auditError)
    }

    return NextResponse.json(
      { error: 'Failed to update availability' },
      { status: 500 }
    )
  }
}