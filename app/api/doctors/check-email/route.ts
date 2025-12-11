// app/api/doctors/check-email/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        doctor: true,
        patient: true
      }
    })

    if (!user) {
      return NextResponse.json({
        exists: false,
        type: undefined
      })
    }

    // Check if user has a doctor record
    if (user.doctor) {
      return NextResponse.json({
        exists: true,
        type: user.doctor.deletedAt ? 'DELETED_DOCTOR' : 'DOCTOR',
        user: {
          name: user.name,
          email: user.email
        },
        doctor: {
          isActive: user.doctor.isActive,
          deletedAt: user.doctor.deletedAt
        }
      })
    }

    // Check if user has a patient record
    if (user.patient) {
      return NextResponse.json({
        exists: true,
        type: 'PATIENT',
        user: {
          name: user.name,
          email: user.email
        }
      })
    }

    // User exists but has no role (shouldn't happen)
    return NextResponse.json({
      exists: true,
      type: undefined,
      user: {
        name: user.name,
        email: user.email
      }
    })

  } catch (error) {
    console.error('Error checking email:', error)
    return NextResponse.json(
      { error: 'Failed to check email' },
      { status: 500 }
    )
  }
}