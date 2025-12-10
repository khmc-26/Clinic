// app/api/doctors/route.ts - UPDATE THIS
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

    // Check for active filter and show deleted filter
    const searchParams = request.nextUrl.searchParams
    const activeOnly = searchParams.get('active') === 'true'
    const showDeleted = searchParams.get('showDeleted') === 'true'

    // Build where clause - FILTER OUT SOFT DELETED BY DEFAULT
    const whereClause: any = {
      deletedAt: showDeleted ? { not: null } : null // Show only non-deleted by default
    }
    
    if (activeOnly) {
      whereClause.isActive = true
    }

    const doctors = await prisma.doctor.findMany({
      where: whereClause,
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