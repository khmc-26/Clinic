import { z } from 'zod'

// Create a base schema without agreeToTerms
const baseAppointmentSchema = z.object({
  // ADD DOCTOR ID FIELD
  doctorId: z.string().min(1, "Doctor selection is required"),
  
  appointmentType: z.enum(['IN_PERSON', 'ONLINE']),
  serviceType: z.enum([
    'GENERAL_CONSULTATION',
    'FOLLOW_UP',
    'ACUTE_TREATMENT',
    'CHRONIC_TREATMENT',
    'CHILD_CARE',
    'WOMENS_HEALTH',
    'SKIN_TREATMENT',
    'ALLERGY_TREATMENT',
    'ONLINE_CONSULTATION'
  ]),
  appointmentDate: z.string().refine((date) => {
    try {
      return !isNaN(Date.parse(date))
    } catch {
      return false
    }
  }, {
    message: "Invalid date format"
  }),
  patientName: z.string().min(2, "Name must be at least 2 characters"),
  patientEmail: z.string().email("Invalid email address"),
  patientPhone: z.string().regex(/^[0-9]{10}$/, "Phone must be 10 digits"),
  patientAge: z.coerce.number().min(0).max(120).optional(),
  patientGender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  symptoms: z.string().min(4, "Please describe your symptoms (min. 4 characters)").max(1000),
  previousTreatment: z.string().optional(),
})

// Extend with agreeToTerms
export const appointmentSchema = baseAppointmentSchema.extend({
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms and conditions"
  })
})

export type AppointmentFormData = z.infer<typeof appointmentSchema>