// /app/api/appointments/merge/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get patient record for logged in user
    const patient = await prisma.patient.findFirst({
      where: { user: { email: session.user.email } }
    })

    if (!patient) {
      return NextResponse.json({ success: true, appointments: [] })
    }

    // Get appointments that require merge for this patient
    const appointments = await prisma.appointment.findMany({
      where: {
        OR: [
          // Appointments booked by this patient that require merge
          {
            bookedByPatientId: patient.id,
            requiresMerge: true
          },
          // Appointments for family members of this patient that require merge
          {
            familyMember: {
              patientId: patient.id
            },
            requiresMerge: true
          },
          // Appointments where original email matches logged-in user
          {
            originalPatientEmail: session.user.email.toLowerCase(),
            requiresMerge: true
          }
        ]
      },
      include: {
        patient: {
          include: {
            user: true
          }
        },
        familyMember: true,
        bookedByPatient: {
          include: {
            user: true
          }
        },
        doctor: {
          include: {
            user: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      appointments
    })
  } catch (error) {
    console.error('Error fetching merge appointments:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch merge appointments' },
      { status: 500 }
    )
  }
}