// /app/dashboard/settings/availability/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import AvailabilityEditor from '@/components/doctor/availability-editor'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, Clock, AlertCircle, CheckCircle } from 'lucide-react'

export default function AvailabilitySettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [doctorId, setDoctorId] = useState<string | null>(null)
  const [hasAvailability, setHasAvailability] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/doctor/login')
    } else if (status === 'authenticated' && !session.user.isDoctor) {
      router.push('/portal')
    } else if (status === 'authenticated' && session.user.isDoctor) {
      loadDoctorInfo()
    }
  }, [status, session, router])

  const loadDoctorInfo = async () => {
    try {
      const response = await fetch('/api/doctors/me')
      if (response.ok) {
        const doctor = await response.json()
        setDoctorId(doctor.id)
        
        // Check if doctor has any availability set
        const availResponse = await fetch('/api/doctors/me/availability')
        if (availResponse.ok) {
          const availability = await availResponse.json()
          setHasAvailability(availability.length > 0)
        }
      }
    } catch (error) {
      console.error('Error loading doctor info:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSuccess = () => {
    setSaveSuccess(true)
    setHasAvailability(true)
    
    // Hide success message after 5 seconds
    setTimeout(() => {
      setSaveSuccess(false)
    }, 5000)
  }

  if (loading || status === 'loading') {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!session?.user?.isDoctor) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            This page is only accessible to doctors. Please log in with a doctor account.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Availability Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage your weekly schedule for patient appointments
        </p>
      </div>

      {/* Success Alert */}
      {saveSuccess && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Success!</AlertTitle>
          <AlertDescription className="text-green-700">
            Your availability schedule has been saved successfully. Patients can now book appointments during these times.
          </AlertDescription>
        </Alert>
      )}

      {/* Warning if no availability */}
      {!hasAvailability && !saveSuccess && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Availability Set</AlertTitle>
          <AlertDescription>
            You haven't set your availability schedule yet. Patients cannot book appointments until you set your working hours.
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs defaultValue="schedule" className="space-y-6">
        <TabsList>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Weekly Schedule
          </TabsTrigger>
          <TabsTrigger value="guidelines" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Guidelines
          </TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="space-y-6">
          {/* Availability Editor */}
          <AvailabilityEditor 
            doctorId={doctorId || undefined}
            onSave={handleSaveSuccess}
          />

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Next 7 Days
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {hasAvailability ? 'Available' : 'Not Set'}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {hasAvailability 
                    ? 'Patients can book appointments'
                    : 'Set your schedule to start accepting bookings'
                  }
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Booking Window
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">90 Days</div>
                <p className="text-xs text-gray-500 mt-1">
                  Patients can book up to 3 months in advance
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Cancellation Policy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24 Hours</div>
                <p className="text-xs text-gray-500 mt-1">
                  Patients must cancel at least 24 hours in advance
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="guidelines">
          <Card>
            <CardHeader>
              <CardTitle>Availability Guidelines</CardTitle>
              <CardDescription>
                Best practices for setting your schedule
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h3 className="font-semibold">📅 Weekly Schedule</h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-600">
                  <li>Set consistent hours to build patient trust</li>
                  <li>Consider leaving buffer time between appointments</li>
                  <li>Update your schedule regularly for holidays/vacations</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">⏱️ Appointment Duration</h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-600">
                  <li><strong>30 minutes</strong>: Standard for new patients</li>
                  <li><strong>15 minutes</strong>: Quick follow-ups</li>
                  <li><strong>45-60 minutes</strong>: Complex cases or procedures</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">👥 Multiple Patients per Slot</h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-600">
                  <li><strong>1 patient</strong>: Recommended for personalized care</li>
                  <li><strong>2-3 patients</strong>: Group consultations or workshops</li>
                  <li><strong>4 patients</strong>: Maximum for maintaining quality</li>
                </ul>
              </div>

              <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">💡 Pro Tip</h4>
                <p className="text-blue-700 text-sm">
                  Use the "Apply to All Weekdays" button to quickly set a consistent Monday-Friday schedule, 
                  then adjust weekends individually if needed.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t">
        <Button 
          variant="outline" 
          onClick={() => router.push('/dashboard/settings')}
        >
          Back to Settings
        </Button>
        <div className="flex gap-3">
          <Button 
            variant="outline"
            onClick={() => router.push('/dashboard/appointments')}
          >
            View Appointments
          </Button>
          <Button 
            onClick={() => window.location.reload()}
          >
            Refresh Schedule
          </Button>
        </div>
      </div>
    </div>
  )
}