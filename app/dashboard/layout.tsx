// app/dashboard/layout.tsx - IMPROVED VERSION
'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import DashboardNav from '@/components/dashboard/dashboard-nav'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    console.log('🔐 Dashboard Layout - Status:', status)
    console.log('🔐 Dashboard Layout - Session:', session)
    
    if (status === 'loading') {
      console.log('🔐 Still loading session...')
      return
    }

    if (!session?.user) {
      console.log('🔐 No session found, redirecting to doctor login')
      router.push('/doctor/login?error=no_session')
      return
    }

    // Check if it's the doctor
    const isDoctor = session.user.email === 'drkavithahc@gmail.com' || 
                    session.user.isDoctor || 
                    session.user.role === 'DOCTOR'
    
    console.log('🔐 Doctor check:', {
      email: session.user.email,
      isDoctorFlag: session.user.isDoctor,
      role: session.user.role,
      calculatedIsDoctor: isDoctor
    })

    if (!isDoctor) {
      console.log('🔐 Not a doctor, redirecting to doctor login')
      router.push('/doctor/login?error=doctor_access_required')
      return
    }

    console.log('🔐 Doctor verified, allowing access')
    setIsChecking(false)
  }, [session, status, router])

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying doctor access...</p>
          <p className="text-sm text-gray-500 mt-2">
            {status === 'loading' ? 'Loading session...' : 'Checking credentials...'}
          </p>
          {session?.user && (
            <p className="text-xs text-gray-400 mt-1">
              Email: {session.user.email}
              <br />
              Role: {session.user.role}
              <br />
              isDoctor: {String(session.user.isDoctor)}
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />
      <div className="pt-16 md:pt-28">
        <div className="container px-4 py-8">
          {children}
        </div>
      </div>
    </div>
  )
}