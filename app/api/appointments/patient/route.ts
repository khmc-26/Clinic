import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

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

    // Get patient ID from user email
    const patient = await prisma.patient.findFirst({
      where: {
        user: {
          email: session.user.email
        }
      }
    })

    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      )
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') // 'upcoming' or 'past'
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50

    const now = new Date()
    
    // Build where clause
    const where: any = {
      OR: [
        { patientId: patient.id }, // Appointments where patient is the main patient
        { bookedByPatientId: patient.id }, // Appointments booked by this patient for others
        { mergedToPatientId: patient.id } // Appointments merged to this patient
      ]
    }

    if (status === 'upcoming') {
      where.appointmentDate = { gte: now }
      where.status = { not: 'CANCELLED' }
    } else if (status === 'past') {
      where.appointmentDate = { lt: now }
    }

    // Fetch appointments with all related data
    const appointments = await prisma.appointment.findMany({
      where,
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
        },
        familyMember: {
          select: {
            id: true,
            name: true,
            relationship: true,
            email: true
          }
        },
        // Include merge information
        mergedToPatient: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        mergedToFamilyMember: {
          select: {
            id: true,
            name: true,
            relationship: true
          }
        },
        // Include patient for original appointment
        patient: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    })

    // Format response
    const formattedAppointments = appointments.map(appointment => ({
      id: appointment.id,
      appointmentDate: appointment.appointmentDate,
      appointmentType: appointment.appointmentType,
      serviceType: appointment.serviceType,
      status: appointment.status,
      symptoms: appointment.symptoms,
      previousTreatment: appointment.previousTreatment,
      duration: appointment.duration,
      googleMeetLink: appointment.googleMeetLink,
      googleEventId: appointment.googleEventId,
      diagnosis: appointment.diagnosis,
      treatmentPlan: appointment.treatmentPlan,
      recommendations: appointment.recommendations,
      
      // Booking info
      bookedByUserId: appointment.bookedByUserId,
      bookedByPatientId: appointment.bookedByPatientId,
      
      // Family member info
      familyMemberId: appointment.familyMemberId,
      familyMember: appointment.familyMember ? {
        id: appointment.familyMember.id,
        name: appointment.familyMember.name,
        relationship: appointment.familyMember.relationship,
        email: appointment.familyMember.email
      } : null,
      
      // Merge fields
      originalPatientName: appointment.originalPatientName,
      originalPatientEmail: appointment.originalPatientEmail,
      originalPatientPhone: appointment.originalPatientPhone,
      requiresMerge: appointment.requiresMerge,
      mergeResolvedAt: appointment.mergeResolvedAt,
      mergedToPatientId: appointment.mergedToPatientId,
      mergedToFamilyMemberId: appointment.mergedToFamilyMemberId,
      
      // Merged info
      mergedToPatient: appointment.mergedToPatient ? {
        id: appointment.mergedToPatient.id,
        name: appointment.mergedToPatient.user.name
      } : null,
      mergedToFamilyMember: appointment.mergedToFamilyMember ? {
        id: appointment.mergedToFamilyMember.id,
        name: appointment.mergedToFamilyMember.name,
        relationship: appointment.mergedToFamilyMember.relationship
      } : null,
      
      // Doctor info
      doctor: appointment.doctor ? {
        id: appointment.doctor.id,
        name: appointment.doctor.user.name,
        specialization: appointment.doctor.specialization,
        consultationFee: appointment.doctor.consultationFee
      } : null,
      
      // Timestamps
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
      confirmedAt: appointment.confirmedAt,
      completedAt: appointment.completedAt,
      cancelledAt: appointment.cancelledAt
    }))

    // Separate upcoming and past
    const upcoming = formattedAppointments.filter(a => 
      new Date(a.appointmentDate) >= now && a.status !== 'CANCELLED'
    )
    const past = formattedAppointments.filter(a => 
      new Date(a.appointmentDate) < now || a.status === 'CANCELLED'
    )

    return NextResponse.json({
      success: true,
      appointments: formattedAppointments,
      upcomingCount: upcoming.length,
      pastCount: past.length,
      totalCount: appointments.length
    })

  } catch (error) {
    console.error('Error fetching patient appointments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    )
  }
}