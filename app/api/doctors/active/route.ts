import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const doctors = await prisma.doctor.findMany({
      where: {
        isActive: true,
        deletedAt: null  // Soft delete check
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Format the response
    const formattedDoctors = doctors.map(doctor => ({
      id: doctor.id,
      user: doctor.user,
      specialization: doctor.specialization,
      experience: doctor.experience,
      consultationFee: doctor.consultationFee,
      colorCode: doctor.colorCode,
      isActive: doctor.isActive
    }))

    return NextResponse.json(formattedDoctors)
  } catch (error) {
    console.error('Error fetching active doctors:', error)
    return NextResponse.json(
      { error: 'Failed to fetch doctors' },
      { status: 500 }
    )
  }
}