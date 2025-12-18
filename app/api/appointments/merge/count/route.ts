// /app/api/appointments/merge/count/route.ts
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
      return NextResponse.json({ success: true, count: 0 })
    }

    // Count appointments that require merge for this patient
    const mergeCount = await prisma.appointment.count({
      where: {
        OR: [
          // Appointments booked by this patient that require merge
          {
            bookedByPatientId: patient.id,
            requiresMerge: true,
            mergeResolvedAt: null
          },
          // Appointments for family members of this patient that require merge
          {
            familyMember: {
              patientId: patient.id
            },
            requiresMerge: true,
            mergeResolvedAt: null
          }
        ]
      }
    })

    return NextResponse.json({
      success: true,
      count: mergeCount
    })
  } catch (error) {
    console.error('Error fetching merge count:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch merge requests' },
      { status: 500 }
    )
  }
}