'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LogOut, CheckCircle } from 'lucide-react'

export default function DoctorLogoutPage() {
  const router = useRouter()

  useEffect(() => {
    // Sign out from NextAuth
    signOut({ callbackUrl: '/' })
    
    // Clear doctor local storage
    localStorage.removeItem('doctor_token')
    localStorage.removeItem('doctor_email')
    localStorage.removeItem('doctor_name')
    localStorage.removeItem('doctor_login_time')
    
    // Clear cookie
    document.cookie = 'doctor_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    
    console.log('Doctor logged out successfully')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle>Logged Out Successfully</CardTitle>
          <CardDescription>
            You have been logged out from the doctor dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            You have been logged out from all sessions.
          </p>
          <Button
            onClick={() => router.push('/')}
            variant="outline"
            className="w-full"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Go to Homepage Now
          </Button>
          <Button
            onClick={() => router.push('/doctor/login')}
            className="w-full"
          >
            Login Again
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}