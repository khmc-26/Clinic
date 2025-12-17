// /app/book/page.tsx - UPDATED TO USE BOOKING WIZARD V2
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {appointmentV2SchemaWithConditional , AppointmentV2FormData } from '@/lib/validations/appointment-v2'
import BookingWizardV2 from '@/components/booking/booking-wizard-v2'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, UserIcon, Clock, User, FileText, Loader2, Users, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function BookPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(true)

  // Check authentication
  useEffect(() => {
    if (status === 'unauthenticated') {
      const returnUrl = searchParams.get('returnUrl') || '/book'
      router.push(`/portal/login?returnUrl=${encodeURIComponent(returnUrl)}`)
    } else if (status === 'authenticated') {
      setLoading(false)
    }
  }, [status, router, searchParams])

  const form = useForm<AppointmentV2FormData>({
    resolver: zodResolver(appointmentV2SchemaWithConditional),
    defaultValues: {
      doctorId: '',
      appointmentType: 'IN_PERSON',
      serviceType: 'GENERAL_CONSULTATION',
      appointmentDate: '',
      bookingFor: 'MYSELF',
      familyMemberId: undefined,
      patientName: '',
      patientEmail: '',
      patientPhone: '',
      symptoms: '',
      previousTreatment: '',
      agreeToTerms: false,
    },
  })

  const steps = [
    { number: 1, title: 'Doctor', icon: UserIcon },
    { number: 2, title: 'Service', icon: Clock },
    { number: 3, title: 'Date & Time', icon: Calendar },
    { number: 4, title: 'Who & Info', icon: Users }, // Updated icon
    { number: 5, title: 'Confirmation', icon: FileText },
  ]

  // Show loading while checking auth
  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Show not authenticated message (though redirect should happen)
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md p-6">
          <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <User className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-6">You need to log in to book an appointment.</p>
          <Button onClick={() => router.push('/portal/login')}>
            Go to Login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-4xl font-bold">Book an Appointment</h1>
          </div>
          <p className="text-xl text-gray-600">
            Welcome back, {session.user?.name}! Schedule your homoeopathic consultation
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Logged in as: {session.user?.email}
          </p>
          
          {/* Family Booking Notice */}
          <div className="mt-4 max-w-2xl mx-auto bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <p className="text-blue-800 font-medium">
                Now you can book appointments for yourself and your family members!
              </p>
            </div>
            <p className="text-blue-700 text-sm mt-1">
              Step 4 lets you choose: Yourself, Family Member, or Someone Else
            </p>
          </div>
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
                Complete the following 5 steps to book your appointment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BookingWizardV2 
                step={step} 
                setStep={setStep} 
                form={form} 
              />
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
                  <UserPlus className="h-6 w-6 text-accent-dark" />
                </div>
                <div>
                  <h4 className="font-semibold">Family Booking</h4>
                  <p className="text-gray-600">Book for up to 3 family members</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}