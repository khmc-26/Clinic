// /app/portal/prescriptions/page.tsx - COMING SOON VERSION
'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Pill, 
  Clock, 
  Calendar,
  AlertCircle,
  Construction,
  ArrowLeft
} from 'lucide-react'

export default function PrescriptionsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  if (status === 'unauthenticated') {
    router.push('/portal/login')
    return null
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Coming Soon Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-amber-100 mb-4">
          <Construction className="h-10 w-10 text-amber-600" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Prescriptions</h1>
        <p className="text-gray-600 text-lg">
          Coming Soon - Feature Under Development
        </p>
      </div>

      {/* Main Coming Soon Card */}
      <Card className="border-amber-200">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-amber-700">
            <Pill className="h-6 w-6" />
            Prescription Management
          </CardTitle>
          <CardDescription className="text-lg">
            We're building a comprehensive prescription management system
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-6">
            {/* What to Expect */}
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                What to Expect in This Feature:
              </h3>
              <ul className="space-y-3 text-blue-700">
                <li className="flex items-start gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                  <span><strong>View Active Prescriptions</strong> - See all your current medications</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                  <span><strong>Refill Requests</strong> - Request prescription renewals online</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                  <span><strong>Medication History</strong> - Track past prescriptions</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                  <span><strong>Dosage Reminders</strong> - Set up medication reminders</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                  <span><strong>Doctor Communication</strong> - Message your doctor about prescriptions</span>
                </li>
              </ul>
            </div>

            {/* Current Status */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                    <Clock className="h-6 w-6 text-gray-600" />
                  </div>
                  <h4 className="font-semibold">Estimated Launch</h4>
                  <p className="text-sm text-gray-600 mt-1">Q1 2025</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                    <Calendar className="h-6 w-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold">Current Alternative</h4>
                  <p className="text-sm text-gray-600 mt-1">Contact clinic directly</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                    <AlertCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold">Urgent Needs</h4>
                  <p className="text-sm text-gray-600 mt-1">Call clinic: (555) 123-4567</p>
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-6">
              <Button 
                variant="outline" 
                onClick={() => router.push('/portal')}
                className="flex-1 sm:flex-none"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
              
              <Button 
                onClick={() => router.push('/book')}
                className="flex-1 sm:flex-none"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Book Appointment
              </Button>
              
              <Button 
                variant="secondary"
                onClick={() => router.push('/portal/medical-history')}
                className="flex-1 sm:flex-none"
              >
                View Medical History
              </Button>
            </div>

            {/* Note */}
            <div className="text-center text-sm text-gray-500 pt-4 border-t">
              <p>
                For prescription needs, please contact the clinic directly or discuss with your doctor during appointments.
              </p>
              <p className="mt-2">
                <strong>Clinic Phone:</strong> (555) 123-4567 • <strong>Hours:</strong> Mon-Fri 9AM-5PM
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}