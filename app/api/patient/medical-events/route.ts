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

    // Get patient ID
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
    const eventType = searchParams.get('eventType')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      patientId: patient.id
    }

    if (eventType) {
      where.eventType = eventType
    }

    // Get medical events with doctor info
    const [medicalEvents, totalCount] = await Promise.all([
      prisma.patientMedicalEvent.findMany({
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
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.patientMedicalEvent.count({ where })
    ])

    // Format response
    const formattedEvents = medicalEvents.map(event => ({
      id: event.id,
      eventType: event.eventType,
      eventId: event.eventId,
      title: event.title,
      description: event.description,
      metadata: event.metadata,
      doctor: event.doctor ? {
        id: event.doctor.id,
        name: event.doctor.user.name,
        specialization: event.doctor.specialization
      } : null,
      createdAt: event.createdAt,
      // Add color based on event type (for UI)
      color: getEventTypeColor(event.eventType)
    }))

    // Group by date for timeline view
    const eventsByDate: Record<string, any[]> = {}
    formattedEvents.forEach(event => {
      const date = new Date(event.createdAt).toISOString().split('T')[0]
      if (!eventsByDate[date]) {
        eventsByDate[date] = []
      }
      eventsByDate[date].push(event)
    })

    // Get event type counts
    const eventTypeCounts = await prisma.patientMedicalEvent.groupBy({
      by: ['eventType'],
      where: { patientId: patient.id },
      _count: true
    })

    const counts = eventTypeCounts.reduce((acc: Record<string, number>, item) => {
      acc[item.eventType] = item._count
      return acc
    }, {})

    return NextResponse.json({
      success: true,
      events: formattedEvents,
      eventsByDate,
      counts,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching medical events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch medical events' },
      { status: 500 }
    )
  }
}

// Helper function to get color for event type
function getEventTypeColor(eventType: string): string {
  const colors: Record<string, string> = {
    'APPOINTMENT': '#3B82F6', // Blue
    'PRESCRIPTION': '#10B981', // Green
    'DIAGNOSIS': '#8B5CF6', // Purple
    'NOTE': '#F59E0B', // Yellow
    'REFERRAL': '#F97316', // Orange
    'TEST_RESULT': '#EC4899', // Pink
    'VACCINATION': '#06B6D4', // Cyan
    'SURGERY': '#EF4444' // Red
  }
  
  return colors[eventType] || '#6B7280' // Default gray
}

// POST: Create a new medical event - DISABLED FOR PATIENTS
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { 
      error: 'Patient cannot create medical events. Events are created automatically by doctors.' 
    },
    { status: 403 }
  )
}

// PUT: Update medical event - DISABLED FOR PATIENTS
export async function PUT(request: NextRequest) {
  return NextResponse.json(
    { 
      error: 'Patient cannot modify medical events. Please contact your doctor for corrections.' 
    },
    { status: 403 }
  )
}

// DELETE: Delete medical event - DISABLED FOR PATIENTS
export async function DELETE(request: NextRequest) {
  return NextResponse.json(
    { 
      error: 'Patient cannot delete medical events. Please contact your doctor for corrections.' 
    },
    { status: 403 }
  )
}