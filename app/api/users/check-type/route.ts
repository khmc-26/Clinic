// app/api/users/check-type/route.ts - FIXED
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        doctor: true,
        patient: true
      }
    })

    if (!user) {
      // Check if user has any appointments as a patient
      const appointments = await prisma.appointment.findMany({
        where: {
          patient: {
            user: {
              email: email
            }
          }
        },
        take: 1
      })

      return NextResponse.json({
        exists: false,
        hasDoctorAccount: false,
        hasPatientAccount: appointments.length > 0,
        hasAppointments: appointments.length > 0,
        role: 'NONE'
      })
    }

    // Check if user has appointments
    const appointments = await prisma.appointment.findMany({
      where: {
        patient: {
          userId: user.id
        }
      },
      take: 1
    })

    return NextResponse.json({
      exists: true,
      hasDoctorAccount: !!user.doctor,
      hasPatientAccount: !!user.patient || user.role === 'PATIENT' || appointments.length > 0,
      hasAppointments: appointments.length > 0,
      role: user.role
    })

  } catch (error) {
    console.error('Check user type error:', error)
    return NextResponse.json(
      { error: 'Failed to check user type' },
      { status: 500 }
    )
  }
}