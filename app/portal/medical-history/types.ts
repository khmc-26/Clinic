// /app/portal/medical-history/types.ts - UPDATED
export type EventType = 
  | 'APPOINTMENT'
  | 'PRESCRIPTION'
  | 'DIAGNOSIS'
  | 'NOTE'
  | 'SYMPTOM'
  | 'MEASUREMENT'
  | 'LAB_RESULT'
  | 'VACCINATION'
  | 'SURGERY'
  | 'ALLERGY'

export interface MedicalEvent {
  id: string
  patientId: string
  doctorId: string
  eventType: EventType
  eventId?: string
  title: string
  description?: string
  metadata?: any
  createdAt: Date
  doctor?: {
    id: string
    user?: {
      name: string
    }
  }
  appointment?: {
    id: string
    serviceType?: string
  }
}

export interface MedicalEventFormData {
  eventType: EventType
  title: string
  description?: string
  eventDate?: string
  metadata?: Record<string, any>
}

export interface SymptomFormData extends MedicalEventFormData {
  severity: 'MILD' | 'MODERATE' | 'SEVERE'
  bodyPart?: string
  duration?: string
}

export interface MeasurementFormData extends MedicalEventFormData {
  measurementType: 'BLOOD_PRESSURE' | 'BLOOD_SUGAR' | 'WEIGHT' | 'TEMPERATURE'
  value: number
  unit: string
  timeOfDay?: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT'
}

export interface LabResultFormData extends MedicalEventFormData {
  testName: string
  value: number
  unit: string
  referenceRange: string
  labName?: string
}

export interface AllergyFormData extends MedicalEventFormData {
  allergen: string
  reaction: string
  severity: 'MILD' | 'MODERATE' | 'SEVERE'
  firstNoticed?: string
}

export interface TimelineGroup {
  year: number
  months: MonthGroup[]
}

export interface MonthGroup {
  month: number
  monthName: string
  events: MedicalEvent[]
}

export interface EventFilters {
  eventTypes: EventType[]
  dateRange?: {
    start: Date
    end: Date
  }
  doctorId?: string
}