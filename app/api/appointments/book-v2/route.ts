// /app/api/appointments/book-v2/route.ts - FIXED VERSION
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { appointmentV2Schema } from '@/lib/validations/appointment-v2'
import { sendAppointmentConfirmationEmail } from '@/lib/email'
import { createCalendarEvent } from '@/lib/google-calendar'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function POST(request: NextRequest) {
  console.log('=== APPOINTMENT BOOKING V2 API CALLED ===')
  
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      console.log('No session found, returning 401')
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    console.log('User session email:', session.user.email)
    
    const body = await request.json()
    console.log('Request body:', JSON.stringify(body, null, 2))
    
    // Try to validate
    console.log('Attempting validation...')
    const validatedData = appointmentV2Schema.parse(body)
    console.log('✅ Validation passed:', validatedData)

    // Get logged in user
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { patient: true }
    })

    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Get doctor
    const doctor = await prisma.doctor.findFirst({
      where: { id: validatedData.doctorId, isActive: true },
      include: { user: true }
    })

    if (!doctor) {
      return NextResponse.json(
        { success: false, error: 'Selected doctor is not available' },
        { status: 404 }
      )
    }

    // ==================== CHECK TIME SLOT AVAILABILITY ====================
    const appointmentDateTime = new Date(validatedData.appointmentDate)
    const slotDateTime = new Date(appointmentDateTime)
    const minutes = slotDateTime.getMinutes()
    slotDateTime.setMinutes(minutes - (minutes % 30))
    slotDateTime.setSeconds(0, 0)

    const slotStart = new Date(slotDateTime)
    const slotEnd = new Date(slotDateTime.getTime() + 30 * 60 * 1000)

    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        doctorId: doctor.id,
        appointmentDate: { gte: slotStart, lt: slotEnd },
        status: { notIn: ['CANCELLED'] }
      }
    })

    if (existingAppointment) {
      return NextResponse.json(
        { success: false, error: 'This time slot is no longer available' },
        { status: 409 }
      )
    }

    // ==================== HANDLE DIFFERENT BOOKING TYPES ====================
    let patientId: string = ''
    let familyMemberId: string | null = null
    let requiresMerge = false
    let mergeNotes = ''
    let originalPatientName = ''
    let originalPatientEmail = ''
    let originalPatientPhone = ''

    // Start transaction for data consistency
    const appointmentResult = await prisma.$transaction(async (tx) => {
      switch (validatedData.bookingFor) {
        case 'MYSELF': {
          // Book for logged in user themselves
          if (!currentUser.patient) {
            // Create patient record if doesn't exist
            const patient = await tx.patient.create({
              data: { userId: currentUser.id }
            })
            patientId = patient.id
          } else {
            patientId = currentUser.patient.id
          }
          
          // Update user info if needed
          if (validatedData.patientName || validatedData.patientPhone) {
            const updateData: any = {}
            if (validatedData.patientName) updateData.name = validatedData.patientName
            if (validatedData.patientPhone) updateData.phone = validatedData.patientPhone
            
            await tx.user.update({
              where: { id: currentUser.id },
              data: updateData
            })
          }
          break
        }

        case 'FAMILY_MEMBER': {
          // Book for existing family member
          if (!validatedData.familyMemberId) {
            throw new Error('Family member ID is required')
          }

          const familyMember = await tx.familyMember.findUnique({
            where: { id: validatedData.familyMemberId }
          })

          if (!familyMember) {
            throw new Error('Family member not found')
          }

          patientId = familyMember.patientId // Use family member's patient record
          familyMemberId = familyMember.id
          break
        }

        case 'SOMEONE_ELSE': {
          // Book for new person (potential merge detection)
          originalPatientName = validatedData.patientName!
          originalPatientEmail = validatedData.patientEmail!
          originalPatientPhone = validatedData.patientPhone!

          // Check for existing user with same email
          const existingUser = await tx.user.findUnique({
            where: { email: validatedData.patientEmail! }
          })

          if (existingUser) {
            // User exists - check if they have patient record
            const existingPatient = await tx.patient.findUnique({
              where: { userId: existingUser.id }
            })

            if (existingPatient) {
              patientId = existingPatient.id
              requiresMerge = true
              mergeNotes = `Email matches existing user: ${existingUser.email}`
              
              // Check if it's the logged in user
              if (existingUser.id === currentUser.id) {
                mergeNotes += ' (Logged in user)'
              }
            } else {
              // User exists but no patient record
              const newPatient = await tx.patient.create({
                data: { userId: existingUser.id }
              })
              patientId = newPatient.id
              
              // Update user info
              const updateData: any = {}
              if (validatedData.patientName) updateData.name = validatedData.patientName
              if (validatedData.patientPhone) updateData.phone = validatedData.patientPhone
              
              await tx.user.update({
                where: { id: existingUser.id },
                data: updateData
              })
            }
          } else {
            // Create new user and patient
            const newUser = await tx.user.create({
              data: {
                email: validatedData.patientEmail!,
                name: validatedData.patientName!,
                phone: validatedData.patientPhone || null,
                role: 'PATIENT',
                emailVerified: new Date()
              }
            })

            const newPatient = await tx.patient.create({
              data: {
                userId: newUser.id
              }
            })
            
            patientId = newPatient.id
          }
          break
        }

        default:
          throw new Error('Invalid booking type')
      }

      // ==================== CREATE APPOINTMENT ====================
      const appointment = await tx.appointment.create({
        data: {
          patientId,
          doctorId: doctor.id,
          appointmentDate: appointmentDateTime,
          appointmentType: validatedData.appointmentType,
          serviceType: validatedData.serviceType,
          status: 'PENDING',
          symptoms: validatedData.symptoms,
          previousTreatment: validatedData.previousTreatment || null,
          duration: 30,
          
          // New fields for v2
          bookedByUserId: currentUser.id,
          bookedByPatientId: currentUser.patient?.id || null,
          familyMemberId,
          originalPatientName: originalPatientName || null,
          originalPatientEmail: originalPatientEmail || null,
          originalPatientPhone: originalPatientPhone || null,
          requiresMerge,
          mergeNotes: mergeNotes || null,
          bookingMethod: 'PORTAL'
        }
      })

      // Generate meet link for online consultations
      let googleMeetLink = null
      if (validatedData.appointmentType === 'ONLINE') {
        if (process.env.DOCTOR_PERMANENT_MEET_LINK) {
          googleMeetLink = process.env.DOCTOR_PERMANENT_MEET_LINK
        } else {
          googleMeetLink = `https://meet.google.com/${Math.random().toString(36).substring(2, 15)}`
        }
      }

      // Update appointment status to CONFIRMED
      const updatedAppointment = await tx.appointment.update({
        where: { id: appointment.id },
        data: {
          status: 'CONFIRMED',
          googleMeetLink
        },
        include: {
          patient: { include: { user: true } },
          doctor: { include: { user: true } }
        }
      })

      return { 
        appointment: updatedAppointment, 
        googleMeetLink 
      }
    })

    console.log('✅ Appointment created successfully:', appointmentResult.appointment.id)

// In the Google Calendar section after the transaction:

// ==================== GOOGLE CALENDAR EVENT (AFTER TRANSACTION) ====================
let googleEventId = null
let googleEventHtmlLink = null // Changed variable name
    
try {
  console.log('Attempting to create calendar event for appointment:', appointmentResult.appointment.id)
  const calendarResult = await createCalendarEvent(appointmentResult.appointment.id)
  googleEventId = calendarResult.eventId
  googleEventHtmlLink = calendarResult.eventLink // Store as separate variable
  
  // Update appointment with calendar details
  await prisma.appointment.update({
    where: { id: appointmentResult.appointment.id },
    data: {
      googleEventId,
      // Only update googleMeetLink if calendar provided one (for online appointments)
      ...(calendarResult.meetLink && { googleMeetLink: calendarResult.meetLink })
    }
  })
  
  console.log('✅ Calendar event created successfully')
} catch (calendarError) {
  console.error('Calendar event creation failed:', calendarError)
  // Don't fail the booking - just log the error
  // The appointment is already created successfully
}
// ==================== SEND CONFIRMATION EMAIL ====================
try {
  console.log('Sending confirmation email...')
  
  // Get the correct patient info based on booking type
  let patientEmail = currentUser.email
  let patientName = appointmentResult.appointment.patient.user.name
  
  if (validatedData.bookingFor === 'FAMILY_MEMBER' && appointmentResult.appointment.familyMemberId) {
    // Get family member details
    const familyMember = await prisma.familyMember.findUnique({
      where: { id: appointmentResult.appointment.familyMemberId }
    })
    
    if (familyMember) {
      patientName = familyMember.name
      patientEmail = familyMember.email || currentUser.email
    }
  }
  
  await sendAppointmentConfirmationEmail(
  appointmentResult.appointment,
  appointmentResult.googleMeetLink ?? undefined, // Use nullish coalescing
  doctor.user.email,
  patientName
)
  console.log('✅ Confirmation email sent to:', patientEmail)
} catch (emailError) {
  console.error('Failed to send confirmation email:', emailError)
}

    return NextResponse.json({
      success: true,
      message: 'Appointment booked successfully!',
      appointmentId: appointmentResult.appointment.id,
      requiresMerge: appointmentResult.appointment.requiresMerge,
      appointment: {
        id: appointmentResult.appointment.id,
        date: appointmentResult.appointment.appointmentDate,
        type: appointmentResult.appointment.appointmentType,
        status: appointmentResult.appointment.status,
        googleMeetLink: appointmentResult.googleMeetLink,
        bookingFor: validatedData.bookingFor
      }
    })

  } catch (error: any) {
    console.error('Appointment booking v2 error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Validation failed',
          details: error.issues.map(e => ({
            path: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
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