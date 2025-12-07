'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { appointmentSchema, AppointmentFormData } from '@/lib/validations/appointment'
import BookingWizard from '@/components/booking/booking-wizard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Clock, User, FileText } from 'lucide-react'

export default function BookPage() {
  const [step, setStep] = useState(1)

  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      appointmentType: 'IN_PERSON',
      serviceType: 'GENERAL_CONSULTATION',
      appointmentDate: '',
      patientName: '',
      patientEmail: '',
      patientPhone: '',
      patientAge: undefined,
      patientGender: undefined,
      symptoms: '',
      previousTreatment: '',
      agreeToTerms: false,
    },
  })

  const steps = [
    { number: 1, title: 'Service', icon: Clock },
    { number: 2, title: 'Date & Time', icon: Calendar },
    { number: 3, title: 'Patient Info', icon: User },
    { number: 4, title: 'Confirmation', icon: FileText },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Book an Appointment</h1>
          <p className="text-xl text-gray-600">
            Schedule your homoeopathic consultation with Dr. Kavitha Thomas
          </p>
        </div>

        {/* Steps Indicator */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2"></div>
            {steps.map((stepItem) => (
              <div key={stepItem.number} className="relative z-10">
                <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                  step >= stepItem.number ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  <stepItem.icon className="h-6 w-6" />
                </div>
                <p className="mt-2 text-sm font-medium">{stepItem.title}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Book Your Consultation</CardTitle>
              <CardDescription>
                Complete the following steps to book your appointment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BookingWizard step={step} setStep={setStep} form={form} />
            </CardContent>
          </Card>
        </div>

        {/* Quick Info */}
        <div className="max-w-4xl mx-auto mt-8 grid md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">Consultation Duration</h4>
                  <p className="text-gray-600">30-45 minutes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <h4 className="font-semibold">Working Hours</h4>
                  <p className="text-gray-600">Mon-Sat: 9AM - 5PM</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-accent-dark" />
                </div>
                <div>
                  <h4 className="font-semibold">Consultation Fee</h4>
                  <p className="text-gray-600">₹300 (First Visit)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )

  
}