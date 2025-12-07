'use client'

import { useSession } from 'next-auth/react'
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
    console.log('🔐 Dashboard Layout - Session status:', status)
    console.log('🔐 Dashboard Layout - Session data:', session)
    
    if (status === 'loading') {
      return
    }
    
    if (!session) {
      console.log('🔐 No session, redirecting to /portal')
      router.push('/portal')
      return
    }
    
    if (session.user?.role !== 'DOCTOR') {
      console.log('🔐 User role is not DOCTOR. Role:', session.user?.role)
      console.log('🔐 User email:', session.user?.email)
      router.push('/portal')
      return
    }
    
    console.log('🔐 Access granted - User is doctor')
    setIsChecking(false)
  }, [session, status, router])

  if (status === 'loading' || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying doctor access...</p>
          <p className="text-sm text-gray-500 mt-2">
            Session status: {status}<br />
            Role: {session?.user?.role || 'none'}
          </p>
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