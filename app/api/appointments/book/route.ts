// app/api/appointments/book/route.ts - UPDATED
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { appointmentSchema } from '@/lib/validations/appointment'
import { sendAppointmentConfirmationEmail } from '@/lib/email'
import { createCalendarEvent, generateRealGoogleMeet } from '@/lib/google-calendar'
import { z } from 'zod'

export async function POST(request: NextRequest) {
  console.log('=== APPOINTMENT BOOKING API CALLED ===')
  
  try {
    const body = await request.json()
    console.log('Request body:', body)
    
    const validatedData = appointmentSchema.parse(body)
    console.log('Validated data:', validatedData)

    // Get SPECIFIC doctor from the request
    const doctor = await prisma.doctor.findFirst({
      where: {
        id: validatedData.doctorId,  // USE SELECTED DOCTOR ID
        isActive: true,
      },
      include: { user: true }
    })

    if (!doctor) {
      console.error('Doctor not found or not active:', validatedData.doctorId)
      return NextResponse.json(
        { 
          success: false,
          error: 'Selected doctor is not available. Please choose another doctor.' 
        },
        { status: 404 }
      )
    }

    console.log('Found doctor:', doctor.id, doctor.user.name)


    // CRITICAL: Check if time slot is available
    const appointmentDateTime = new Date(validatedData.appointmentDate)
    
    // Round to nearest 30 minutes for slot checking
    const slotDateTime = new Date(appointmentDateTime)
    const minutes = slotDateTime.getMinutes()
    slotDateTime.setMinutes(minutes - (minutes % 30))
    slotDateTime.setSeconds(0, 0)

    // Get start and end of the slot (30 minutes duration)
    const slotStart = new Date(slotDateTime)
    const slotEnd = new Date(slotDateTime.getTime() + 30 * 60 * 1000)

    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        doctorId: doctor.id,
        appointmentDate: {
          gte: slotStart,
          lt: slotEnd,
        },
        status: {
          notIn: ['CANCELLED']
        }
      }
    })

    if (existingAppointment) {
      console.error('Time slot already booked:', slotDateTime)
      return NextResponse.json(
        { 
          success: false,
          error: 'This time slot is no longer available. Please select another time.' 
        },
        { status: 409 }
      )
    }

    // ==================== FIXED: GET OR CREATE USER/PATIENT ====================
    console.log('Processing patient for email:', validatedData.patientEmail)
    
    // 1. First, find user (whether they have patient record or not)
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.patientEmail },
      include: { patient: true }
    })

    console.log('Found user:', existingUser?.id, 'Has patient record:', !!existingUser?.patient)

    let patient;
    if (existingUser && existingUser.patient) {
      // CASE 1: User exists AND has patient record
      console.log('Updating existing patient info...')
      
      // Update user info
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          name: validatedData.patientName,
          phone: validatedData.patientPhone,
        }
      })
      
      // Update patient info
      await prisma.patient.update({
        where: { id: existingUser.patient.id },
        data: {
          age: validatedData.patientAge,
          gender: validatedData.patientGender,
        }
      })
      
      // Get updated patient
      patient = await prisma.patient.findUnique({
        where: { id: existingUser.patient.id },
        include: { user: true }
      })
      
      console.log('Updated patient:', patient?.id)
      
    } else if (existingUser && !existingUser.patient) {
      // CASE 2: User exists but NO patient record (shouldn't happen but handle it)
      console.log('User exists but no patient record, creating patient...')
      
      // Create patient record for existing user
      patient = await prisma.patient.create({
        data: {
          userId: existingUser.id,
          age: validatedData.patientAge,
          gender: validatedData.patientGender,
        },
        include: { user: true }
      })
      
      // Update user info
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          name: validatedData.patientName,
          phone: validatedData.patientPhone,
        }
      })
      
      console.log('Created patient for existing user:', patient.id)
      
    } else {
      // CASE 3: No user exists - create both user and patient
      console.log('Creating new user and patient...')
      
      // Create user first
      const newUser = await prisma.user.create({
        data: {
          email: validatedData.patientEmail,
          name: validatedData.patientName,
          phone: validatedData.patientPhone,
          role: 'PATIENT',
          emailVerified: new Date(),
        }
      })
      
      console.log('Created user:', newUser.id)
      
      // Create patient
      patient = await prisma.patient.create({
        data: {
          userId: newUser.id,
          age: validatedData.patientAge,
          gender: validatedData.patientGender,
        },
        include: { user: true }
      })
      
      console.log('Created patient:', patient.id)
    }

    if (!patient) {
      throw new Error('Failed to create or find patient')
    }

    console.log('Final patient object:', {
      id: patient.id,
      userId: patient.userId,
      email: patient.user?.email,
      name: patient.user?.name
    })

    // ==================== CREATE APPOINTMENT ====================
    const appointment = await prisma.appointment.create({
      data: {
        patientId: patient.id,
        doctorId: doctor.id,
        appointmentDate: appointmentDateTime,
        appointmentType: validatedData.appointmentType,
        serviceType: validatedData.serviceType,
        status: 'PENDING',
        symptoms: validatedData.symptoms,
        previousTreatment: validatedData.previousTreatment,
        duration: parseInt(process.env.APPOINTMENT_DURATION || '30'),
      },
    })

    console.log('Created appointment:', appointment.id)

    // ==================== GOOGLE CALENDAR EVENT CREATION ====================
    let googleEventId = null
    let googleEventLink = null
    let googleMeetLink = null
    
    // ALWAYS create calendar event for BOTH online and in-person appointments
    try {
      console.log('Creating Google Calendar event...')
      const calendarResult = await createCalendarEvent(appointment.id)
      googleEventId = calendarResult.eventId
      googleEventLink = calendarResult.eventLink
      googleMeetLink = calendarResult.meetLink || googleMeetLink
      console.log('✅ Calendar event created:', googleEventId)
    } catch (calendarError: any) {
      console.error('❌ Calendar event creation failed:', calendarError.message)
      // Continue without calendar event - appointment still booked
    }

    // ==================== ADDITIONAL MEET LINK FOR ONLINE CONSULTATIONS ====================
    if (validatedData.appointmentType === 'ONLINE' && !googleMeetLink) {
      try {
        console.log('Generating Google Meet link for online consultation...')
        const meetResult = await generateRealGoogleMeet()
        googleMeetLink = meetResult.meetLink
        console.log('✅ Google Meet link generated:', googleMeetLink)
      } catch (meetError: any) {
        console.error('❌ Google Meet generation failed:', meetError.message)
        
        // Use permanent meeting room if configured
        if (process.env.DOCTOR_PERMANENT_MEET_LINK) {
          googleMeetLink = process.env.DOCTOR_PERMANENT_MEET_LINK
          console.log('⚠️ Using permanent meeting room:', googleMeetLink)
        } else {
          // Final fallback
          const fallbackMeetId = Math.random().toString(36).substring(2, 15)
          googleMeetLink = `https://meet.google.com/${fallbackMeetId}`
          console.log('⚠️ Using fallback meet link:', googleMeetLink)
        }
      }
    }

    // ==================== UPDATE APPOINTMENT WITH DETAILS ====================
    await prisma.appointment.update({
      where: { id: appointment.id },
      data: {
        status: 'CONFIRMED',
        googleMeetLink,
        googleEventId,
      }
    })

    // ==================== GET FULL APPOINTMENT FOR EMAIL ====================
    const fullAppointment = await prisma.appointment.findUnique({
      where: { id: appointment.id },
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

    if (!fullAppointment) {
      throw new Error('Failed to retrieve created appointment')
    }

    // ==================== SEND CONFIRMATION EMAIL ====================
try {
  // Get doctor's email for BCC
  const doctorEmail = fullAppointment.doctor?.user?.email
  
  // Pass doctor's email to the email function
  await sendAppointmentConfirmationEmail(fullAppointment, googleMeetLink, doctorEmail)
  console.log('✅ Confirmation email sent to:', {
    patient: fullAppointment.patient.user.email,
    doctor: doctorEmail,
    clinic: process.env.CLINIC_EMAIL
  })
} catch (emailError) {
  console.error('Failed to send confirmation email:', emailError)
  // Continue even if email fails
}

    // ==================== PREPARE RESPONSE ====================
    let successMessage = 'Appointment booked successfully'
    if (validatedData.appointmentType === 'ONLINE') {
      if (googleMeetLink?.includes('https://meet.google.com/')) {
        successMessage += '. Check your email for Google Meet link.'
      } else {
        successMessage += '. The clinic will share the meeting link with you.'
      }
    }

    if (googleEventId) {
      successMessage += ' Calendar event created.'
    }

    return NextResponse.json({
      success: true,
      message: successMessage,
      appointmentId: appointment.id,
      appointment: {
        id: appointment.id,
        date: appointment.appointmentDate,
        type: appointment.appointmentType,
        status: 'CONFIRMED',
        googleMeetLink,
        googleEventId,
        googleEventLink
      }
    })

  } catch (error: any) {
    console.error('Appointment booking error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Validation failed', 
          details: error.issues.map((e: any) => ({
            path: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      )
    }

    // Handle Prisma unique constraint error specifically
    if (error.code === 'P2002') {
      console.error('Duplicate email error - user already exists')
      return NextResponse.json(
        { 
          success: false,
          error: 'An account with this email already exists. Please use a different email or contact support.' 
        },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to book appointment' 
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Appointment booking API is running',
    method: 'Use POST to book appointment'
  })
}