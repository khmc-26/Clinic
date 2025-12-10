// app/api/appointments/availability/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const dateParam = searchParams.get('date')
    const doctorIdParam = searchParams.get('doctorId') // ADD THIS

    if (!dateParam) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      )
    }

    if (!doctorIdParam) {
      return NextResponse.json(
        { error: 'Doctor ID is required' },
        { status: 400 }
      )
    }

    const date = new Date(dateParam)
    const dayOfWeek = date.getDay() // 0 = Sunday, 1 = Monday, etc.

    // Get SPECIFIC doctor's availability (not just first)
    const doctor = await prisma.doctor.findFirst({
      where: {
        id: doctorIdParam,  // FILTER BY DOCTOR ID
        isActive: true,     // ONLY ACTIVE DOCTORS
      },
      include: {
        availabilities: {
          where: {
            dayOfWeek,
            isActive: true
          }
        }
      }
    })

    if (!doctor) {
      return NextResponse.json(
        { error: 'Doctor not found or not active' },
        { status: 404 }
      )
    }

    if (doctor.availabilities.length === 0) {
      return NextResponse.json({
        success: true,
        availableSlots: [],
        message: 'Doctor has no availability for this day'
      })
    }

    const availability = doctor.availabilities[0]
    const [startHour, startMinute] = availability.startTime.split(':').map(Number)
    const [endHour, endMinute] = availability.endTime.split(':').map(Number)

    // Get existing appointments for this date
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const existingAppointments = await prisma.appointment.findMany({
      where: {
        doctorId: doctor.id,
        appointmentDate: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: {
          notIn: ['CANCELLED']
        }
      }
    })

    // Generate time slots
    const slots: string[] = []
    let currentHour = startHour
    let currentMinute = startMinute

    while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
      const time = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`
      const slotDateTime = new Date(date)
      slotDateTime.setHours(currentHour, currentMinute, 0, 0)

      // Check if slot is in the future and not booked
      const isBooked = existingAppointments.some(appointment => {
        const appointmentTime = new Date(appointment.appointmentDate)
        return (
          appointmentTime.getHours() === currentHour &&
          appointmentTime.getMinutes() === currentMinute
        )
      })

      // Only show slots in the future
      if (!isBooked && slotDateTime > new Date()) {
        slots.push(time)
      }

      currentMinute += availability.slotDuration
      if (currentMinute >= 60) {
        currentHour += Math.floor(currentMinute / 60)
        currentMinute = currentMinute % 60
      }
    }

    return NextResponse.json({
      success: true,
      availableSlots: slots
    })

  } catch (error) {
    console.error('Error fetching availability:', error)
    return NextResponse.json(
      { error: 'Failed to fetch availability' },
      { status: 500 }
    )
  }
}