import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get current user session
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const appointmentId = params.id

    // Get patient ID from user email
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

    // Get the appointment
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        patientId: patient.id
      },
      include: {
        doctor: true
      }
    })

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found or access denied' },
        { status: 404 }
      )
    }

    // Check if appointment can be cancelled
    const now = new Date()
    const appointmentDate = new Date(appointment.appointmentDate)
    const hoursUntilAppointment = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60)

    // Can't cancel appointments that are in the past
    if (appointmentDate < now) {
      return NextResponse.json(
        { 
          error: 'Cannot cancel past appointments',
          details: 'This appointment has already passed.'
        },
        { status: 400 }
      )
    }

    // Can't cancel already cancelled appointments
    if (appointment.status === 'CANCELLED') {
      return NextResponse.json(
        { 
          error: 'Appointment already cancelled',
          details: 'This appointment is already cancelled.'
        },
        { status: 400 }
      )
    }

    // Check cancellation policy (e.g., minimum 24 hours notice)
    const minCancellationHours = 24
    if (hoursUntilAppointment < minCancellationHours) {
      return NextResponse.json(
        { 
          error: 'Cancellation policy violation',
          details: `Appointments must be cancelled at least ${minCancellationHours} hours in advance.`,
          hoursUntilAppointment: Math.round(hoursUntilAppointment)
        },
        { status: 400 }
      )
    }

    // Update appointment status to CANCELLED
    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date()
      },
      include: {
        patient: {
          include: {
            user: true
          }
        },
        doctor: {
          include: {
            user: true
          }
        }
      }
    })

    console.log(`Appointment ${appointmentId} cancelled by patient ${patient.id}`)

    return NextResponse.json({
      success: true,
      message: 'Appointment cancelled successfully',
      appointment: {
        id: updatedAppointment.id,
        appointmentDate: updatedAppointment.appointmentDate,
        status: updatedAppointment.status,
        cancelledAt: updatedAppointment.cancelledAt
      }
    })

  } catch (error) {
    console.error('Error cancelling appointment:', error)
    return NextResponse.json(
      { error: 'Failed to cancel appointment' },
      { status: 500 }
    )
  }
}