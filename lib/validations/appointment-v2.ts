import { z } from 'zod'

// Booking for options
export const BookingForType = {
  MYSELF: 'MYSELF',
  FAMILY_MEMBER: 'FAMILY_MEMBER',
  SOMEONE_ELSE: 'SOMEONE_ELSE'
} as const

// Base schema without conditional validation
export const appointmentV2Schema = z.object({
  // Step 1: Doctor
  doctorId: z.string().min(1, "Doctor selection is required"),
  
  // Step 2: Service
  appointmentType: z.enum(['IN_PERSON', 'ONLINE']),
  serviceType: z.enum([
    'GENERAL_CONSULTATION',
    'FOLLOW_UP',
    'ACUTE_TREATMENT',
    'CHRONIC_TREATMENT',
    'CHILD_CARE',
    'WOMENS_HEALTH',
    'SKIN_TREATMENT',
    'ALLERGY_TREATMENT'
  ]),
  
  // Step 3: Date & Time
  appointmentDate: z.string().refine((date) => {
    try {
      return !isNaN(Date.parse(date))
    } catch {
      return false
    }
  }, { message: "Invalid date format" }),
  
  // Step 4: Who & Patient Info
  bookingFor: z.enum(['MYSELF', 'FAMILY_MEMBER', 'SOMEONE_ELSE']),
  familyMemberId: z.string().optional(),
  
  // Patient info (optional for all, will be handled in API)
  patientName: z.string().min(2, "Name must be at least 2 characters").optional().or(z.literal('')),
  patientEmail: z.string().email("Invalid email address").optional().or(z.literal('')),
  patientPhone: z.string().regex(/^[0-9]{10}$/, "Phone must be 10 digits").optional().or(z.literal('')),
  
  // Medical info
  symptoms: z.string().min(4, "Please describe your symptoms").max(1000),
  previousTreatment: z.string().optional(),
  
  // Terms
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms"
  })
})

// Conditional validation schema
export const appointmentV2SchemaWithConditional = appointmentV2Schema
  .refine(
    (data) => {
      if (data.bookingFor === 'SOMEONE_ELSE') {
        return !!data.patientName && !!data.patientEmail && !!data.patientPhone
      }
      return true
    },
    {
      message: "Patient information is required when booking for someone else",
      path: ["patientName"]
    }
  )
  .refine(
    (data) => {
      if (data.bookingFor === 'FAMILY_MEMBER') {
        return !!data.familyMemberId
      }
      return true
    },
    {
      message: "Please select a family member",
      path: ["familyMemberId"]
    }
  )

export type AppointmentV2FormData = z.infer<typeof appointmentV2SchemaWithConditional>