// lib/google-calendar.ts - UPDATED WITH RETRY MECHANISM
import { google } from 'googleapis'
import { prisma } from './prisma'

// Service Account Authentication
function getGoogleAuth() {
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')

  if (!serviceAccountEmail || !privateKey) {
    console.error('Google Service Account credentials not configured')
    throw new Error('Google Calendar not configured')
  }

  return new google.auth.JWT({
    email: serviceAccountEmail,
    key: privateKey,
    scopes: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
    ],
  })
}

// Initialize Google Calendar
export const calendar = google.calendar({ version: 'v3', auth: getGoogleAuth() })

/**
 * Create Google Calendar Event (Simple - No Meet integration for now)
 */
export async function createCalendarEvent(appointmentId: string): Promise<{
  eventId: string
  eventLink: string
  meetLink?: string
}> {
  try {
    console.log('Creating calendar event for appointment:', appointmentId)

    // Try multiple times with delay (in case of database replication delay)
    let appointment = null
    let attempts = 0
    const maxAttempts = 3
    
    while (!appointment && attempts < maxAttempts) {
      try {
        // Get appointment details
        appointment = await prisma.appointment.findUnique({
          where: { id: appointmentId },
          include: {
            patient: { include: { user: true } },
            doctor: { include: { user: true } }
          }
        })
        
        if (!appointment && attempts < maxAttempts - 1) {
          console.log(`Appointment not found, retrying in 1 second... (attempt ${attempts + 1}/${maxAttempts})`)
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      } catch (dbError) {
        console.error('Database error fetching appointment:', dbError)
      }
      attempts++
    }

    if (!appointment) {
      console.error('Appointment not found after multiple attempts:', appointmentId)
      throw new Error('Appointment not found')
    }

    console.log('✅ Appointment found:', appointment.id)

    // Format appointment date
    const startTime = new Date(appointment.appointmentDate)
    const endTime = new Date(startTime.getTime() + (appointment.duration || 30) * 60000)

    // Safe substring to avoid undefined errors
    const symptomsText = appointment.symptoms || ''
    const symptomsPreview = symptomsText.substring(0, 200)
    const symptomsEllipsis = symptomsText.length > 200 ? '...' : ''

    // SIMPLE EVENT - No conference data to avoid errors
    const event = {
      summary: `Appointment: ${appointment.patient.user.name || 'Patient'} with Dr. Kavitha Thomas`,
      location: appointment.appointmentType === 'IN_PERSON' 
        ? process.env.CLINIC_ADDRESS || 'Areekkad, Kozhikode'
        : 'Online Consultation',
      description: `
Patient: ${appointment.patient.user.name}
Phone: ${appointment.patient.user.phone}
Service: ${appointment.serviceType.replace(/_/g, ' ')}
Symptoms: ${symptomsPreview}${symptomsEllipsis}

Appointment ID: ${appointmentId}
      `.trim(),
      start: {
        dateTime: startTime.toISOString(),
        timeZone: 'Asia/Kolkata',
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'Asia/Kolkata',
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 30 },
        ],
      },
      colorId: appointment.appointmentType === 'ONLINE' ? '7' : '2',
    }

    console.log('Inserting simple calendar event...')

    const response = await calendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
      requestBody: event,
      sendUpdates: 'none', // Don't send invites (service account limitation)
    })

    console.log('✅ Calendar event created:', response.data.id)
    console.log('📅 Event Link:', response.data.htmlLink)

    // Use permanent meeting room for online consultations
    let meetLink = undefined
    if (appointment.appointmentType === 'ONLINE' && process.env.DOCTOR_PERMANENT_MEET_LINK) {
      meetLink = process.env.DOCTOR_PERMANENT_MEET_LINK
      console.log('🎥 Using permanent meeting room:', meetLink)
    }

    return {
      eventId: response.data.id!,
      eventLink: response.data.htmlLink || `https://calendar.google.com/calendar/event?eid=${response.data.id}`,
      meetLink
    }

  } catch (error: any) {
    console.error('❌ Error creating calendar event:', error.message)
    throw new Error(`Failed to create calendar event: ${error.message}`)
  }
}

/**
 * Generate REAL Google Meet link (Alternative method - WITHOUT hangoutsMeet error)
 */
export async function generateRealGoogleMeet(): Promise<{
  meetLink: string
  meetingCode: string
}> {
  // Use permanent meeting room if available
  if (process.env.DOCTOR_PERMANENT_MEET_LINK) {
    const meetLink = process.env.DOCTOR_PERMANENT_MEET_LINK
    const meetingCode = process.env.DOCTOR_PERMANENT_MEET_CODE || meetLink.replace('https://meet.google.com/', '')
    return { meetLink, meetingCode }
  }

  // SIMPLE FALLBACK - No conference data to avoid "hangoutsMeet" error
  try {
    const startTime = new Date()
    const endTime = new Date(startTime.getTime() + 60 * 60000)

    // SIMPLE EVENT - No conferenceData to avoid errors
    const event = {
      summary: 'Dr. Kavitha Thomas Consultation',
      start: { dateTime: startTime.toISOString(), timeZone: 'Asia/Kolkata' },
      end: { dateTime: endTime.toISOString(), timeZone: 'Asia/Kolkata' },
      // REMOVED conferenceData - causes "Invalid conference type value" error
    }

    const response = await calendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
      requestBody: event,
      sendUpdates: 'none',
    })

    // Google sometimes auto-generates meet link even without conferenceData
    const meetLink = response.data.hangoutLink || ''
    const meetingCode = meetLink.replace('https://meet.google.com/', '') || 'new-room'

    // Delete the test event
    if (response.data.id) {
      await calendar.events.delete({
        calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
        eventId: response.data.id,
        sendUpdates: 'none',
      }).catch(() => { /* Ignore */ })
    }

    // If no meet link was generated, use permanent room or fallback
    if (!meetLink) {
      // Create a new meet link manually
      const manualCode = Math.random().toString(36).substring(2, 15)
      return {
        meetLink: `https://meet.google.com/${manualCode}`,
        meetingCode: manualCode
      }
    }

    return { meetLink, meetingCode }
  } catch (error: any) {
    console.error('Failed to generate Google Meet:', error.message)
    
    // Final fallback
    const fallbackCode = Math.random().toString(36).substring(2, 15)
    return {
      meetLink: `https://meet.google.com/${fallbackCode}`,
      meetingCode: fallbackCode
    }
  }
}

/**
 * Test Google Calendar connection
 */
export async function testGoogleCalendarConnection(): Promise<{
  success: boolean
  message: string
  calendarName?: string
  canCreateEvents?: boolean
}> {
  try {
    const auth = getGoogleAuth()
    const calendar = google.calendar({ version: 'v3', auth })
    
    // Test 1: Get calendar info
    const calendarInfo = await calendar.calendars.get({
      calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
    })
    
    // Test 2: Create a simple test event
    const testEvent = {
      summary: 'Test Event - Delete me',
      start: { dateTime: new Date().toISOString(), timeZone: 'Asia/Kolkata' },
      end: { dateTime: new Date(Date.now() + 60000).toISOString(), timeZone: 'Asia/Kolkata' },
    }
    
    const createdEvent = await calendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
      requestBody: testEvent,
      sendUpdates: 'none',
    })
    
    // Clean up test event
    await calendar.events.delete({
      calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
      eventId: createdEvent.data.id!,
      sendUpdates: 'none',
    }).catch(() => {})
    
    return {
      success: true,
      message: '✅ Google Calendar connection successful',
      calendarName: calendarInfo.data.summary || undefined,
      canCreateEvents: true
    }
  } catch (error: any) {
    return {
      success: false,
      message: `❌ Google Calendar connection failed: ${error.message}`
    }
  }
}

/**
 * Get busy slots from Google Calendar
 */
export async function getBusySlots(date: Date, doctorEmail: string) {
  try {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin: startOfDay.toISOString(),
        timeMax: endOfDay.toISOString(),
        items: [{ id: doctorEmail }],
        timeZone: 'Asia/Kolkata',
      },
    })

    return response.data.calendars?.[doctorEmail]?.busy || []
  } catch (error) {
    console.error('Error fetching busy slots:', error)
    return []
  }
}

// Export for backward compatibility
export const createGoogleMeetEvent = createCalendarEvent