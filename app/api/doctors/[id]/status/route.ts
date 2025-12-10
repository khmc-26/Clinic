// app/api/doctors/[id]/status/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { isActive } = await request.json()
    const doctorId = params.id

    // Cannot disable yourself
    const currentDoctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      include: { user: true }
    })

    if (currentDoctor?.user.email === session.user.email) {
      return NextResponse.json(
        { error: 'Cannot disable your own account' },
        { status: 400 }
      )
    }

    const doctor = await prisma.doctor.update({
      where: { id: doctorId },
      data: {
        isActive,
        disabledAt: isActive ? null : new Date()
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      message: `Doctor ${isActive ? 'enabled' : 'disabled'} successfully`,
      doctor
    })
  } catch (error) {
    console.error('Error updating doctor status:', error)
    return NextResponse.json(
      { error: 'Failed to update doctor status' },
      { status: 500 }
    )
  }
}