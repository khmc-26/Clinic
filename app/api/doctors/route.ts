// app/api/doctors/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.isDoctor) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check for active filter
    const searchParams = request.nextUrl.searchParams
    const activeOnly = searchParams.get('active') === 'true'

    // Build where clause
    const whereClause: any = {}
    if (activeOnly) {
      whereClause.isActive = true
      whereClause.deletedAt = null
    }
    const doctors = await prisma.doctor.findMany({
      where: whereClause,  // ADD FILTER
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
        availabilities: {  // ADD THIS
      select: {
        dayOfWeek: true,
        startTime: true,
        endTime: true,
        isActive: true
      }
    }
  },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(doctors)
  } catch (error) {
    console.error('Error fetching doctors:', error)
    return NextResponse.json(
      { error: 'Failed to fetch doctors' },
      { status: 500 }
    )
  }
}