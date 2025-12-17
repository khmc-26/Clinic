// /app/api/doctors/me/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.isDoctor) {
      return NextResponse.json(
        { error: 'Doctor access required' },
        { status: 401 }
      )
    }

    const doctor = await prisma.doctor.findFirst({
      where: {
        user: {
          email: session.user.email
        },
        isActive: true,
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
        availabilities: {
          select: {
            dayOfWeek: true,
            startTime: true,
            endTime: true,
            isActive: true,
            slotDuration: true,
            maxPatients: true
          },
          orderBy: {
            dayOfWeek: 'asc'
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
    console.error('Error fetching current doctor:', error)
    return NextResponse.json(
      { error: 'Failed to fetch doctor information' },
      { status: 500 }
    )
  }
}