// app/portal/page.tsx - FIXED SIGN OUT
'use client'

import { useSession, signOut } from 'next-auth/react' // Add signOut import
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Calendar, LogOut } from 'lucide-react' // Add LogOut icon

export default function PortalPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    // Redirect to login if not authenticated
    if (status === 'unauthenticated') {
      router.push('/portal/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null // Will redirect in useEffect
  }

  const handleSignOut = async () => {
    await signOut({ 
      callbackUrl: '/portal/login', // Redirect to login after sign out
      redirect: true 
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Card>
          <CardHeader className="text-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Welcome to Your Patient Portal</CardTitle>
            <CardDescription>
              Hello, {session.user?.name || session.user?.email}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-8">
              <p className="text-gray-600 mb-6">
                Manage your appointments and healthcare information
              </p>
              
              <div className="flex flex-col gap-3 max-w-xs mx-auto">
                <Button 
                  onClick={() => router.push('/book')}
                  className="w-full"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Book New Appointment
                </Button>
                
                <Button variant="outline" disabled className="w-full">
                  View Appointments (Coming Soon)
                </Button>
                
                <Button variant="outline" disabled className="w-full">
                  Medical Records (Coming Soon)
                </Button>
              </div>
            </div>
            
            <div className="border-t pt-6 text-center">
              <p className="text-sm text-gray-500 mb-4">
                Signed in as: {session.user?.email}
              </p>
              <Button
                variant="ghost"
                onClick={handleSignOut} // Use the function, not router.push
                className="text-gray-500"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}