// /app/api/doctors/me/availability/route.ts
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

    // Get current doctor
    const doctor = await prisma.doctor.findFirst({
      where: {
        user: {
          email: session.user.email
        },
        isActive: true,
        deletedAt: null
      }
    })

    if (!doctor) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      )
    }

    // Get availability
    const availability = await prisma.doctorAvailability.findMany({
      where: {
        doctorId: doctor.id
      },
      orderBy: {
        dayOfWeek: 'asc'
      }
    })

    return NextResponse.json(availability)
  } catch (error) {
    console.error('Error fetching current doctor availability:', error)
    return NextResponse.json(
      { error: 'Failed to fetch availability' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.isDoctor) {
      return NextResponse.json(
        { error: 'Doctor access required' },
        { status: 401 }
      )
    }

    // Get current doctor
    const doctor = await prisma.doctor.findFirst({
      where: {
        user: {
          email: session.user.email
        },
        isActive: true,
        deletedAt: null
      }
    })

    if (!doctor) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      )
    }

    // Forward to the main availability endpoint
    const requestUrl = new URL(request.url)
    const targetUrl = new URL(`/api/doctors/${doctor.id}/availability`, requestUrl.origin)
    
    const response = await fetch(targetUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || ''
      },
      body: JSON.stringify(await request.json())
    })

    const data = await response.json()
    
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Error updating current doctor availability:', error)
    return NextResponse.json(
      { error: 'Failed to update availability' },
      { status: 500 }
    )
  }
}