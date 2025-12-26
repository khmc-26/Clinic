// /app/portal/page.tsx - UPDATED VERSION (No prescriptions)
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Calendar, 
  Users, 
  FileText, 
  History, 
  Settings, 
  User, 
  Clock, 
  AlertCircle,
  ShieldAlert,
  ArrowRight
} from 'lucide-react'

export default function PortalPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState({
    upcomingAppointments: 0,
    familyMembers: 0,
    mergeRequests: 0,
    medicalEvents: 0 // Changed from prescriptionRefills
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/portal/login')
    }
    
    if (status === 'authenticated') {
      fetchDashboardStats()
    }
  }, [status, router])

  const fetchDashboardStats = async () => {
    try {
      // Fetch upcoming appointments count
      const appointmentsRes = await fetch('/api/appointments/patient?count=true')
      let upcomingAppointments = 0
      if (appointmentsRes.ok) {
        const appointmentsData = await appointmentsRes.json()
        if (appointmentsData.success && appointmentsData.appointments) {
          const now = new Date()
          upcomingAppointments = appointmentsData.appointments.filter((apt: any) => {
            const aptDate = new Date(apt.appointmentDate)
            return aptDate >= now && apt.status !== 'CANCELLED'
          }).length
        }
      }
      
      // Fetch medical events count (instead of prescriptions)
      const medicalEventsRes = await fetch('/api/patient/medical-events?count=true')
      let medicalEvents = 0
      if (medicalEventsRes.ok) {
        const medicalEventsData = await medicalEventsRes.json()
        if (medicalEventsData.success && medicalEventsData.events) {
          medicalEvents = medicalEventsData.events.length
        }
      }

      // Fetch family members count
      const familyRes = await fetch('/api/patient/family-members')
      let familyMembers = 0
      if (familyRes.ok) {
        const familyData = await familyRes.json()
        familyMembers = Array.isArray(familyData) ? familyData.filter((fm: any) => fm.isActive).length : 0
      }

      // Fetch merge requests count
      const mergeRes = await fetch('/api/appointments/merge/count')
      let mergeRequests = 0
      if (mergeRes.ok) {
        const mergeData = await mergeRes.json()
        if (mergeData.success) {
          mergeRequests = mergeData.count
        }
      }

      setStats({
        upcomingAppointments,
        familyMembers,
        mergeRequests,
        medicalEvents
      })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your portal...</p>
        </div>
      </div>
    )
  }

  const quickActions = [
    {
      title: 'Book Appointment',
      description: 'Schedule a new consultation',
      icon: Calendar,
      color: 'bg-blue-100 text-blue-600',
      action: () => router.push('/book'),
      buttonText: 'Book Now'
    },
    {
      title: 'Manage Family',
      description: 'Add or edit family members',
      icon: Users,
      color: 'bg-green-100 text-green-600',
      action: () => router.push('/portal/family'),
      buttonText: 'Manage'
    },
    {
      title: 'View Appointments',
      description: 'See all upcoming and past appointments',
      icon: Clock,
      color: 'bg-purple-100 text-purple-600',
      action: () => router.push('/portal/appointments'),
      buttonText: 'View'
    },
    {
      title: 'Medical History',
      description: 'View your medical records',
      icon: History,
      color: 'bg-amber-100 text-amber-600',
      action: () => router.push('/portal/medical-history'),
      buttonText: 'View History'
    },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Welcome back, {session?.user?.name || 'Patient'}!
            </h1>
            <p className="mt-2 opacity-90">
              Manage your healthcare journey with our patient portal
            </p>
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>{stats.upcomingAppointments} upcoming appointments</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>{stats.familyMembers} family members</span>
              </div>
              {stats.mergeRequests > 0 && (
                <div className="flex items-center space-x-2 bg-white/20 px-3 py-1 rounded-full">
                  <ShieldAlert className="h-4 w-4" />
                  <span>{stats.mergeRequests} pending merge(s)</span>
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center">
              <User className="h-10 w-10 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col h-full">
                    <div className={`h-12 w-12 rounded-lg ${action.color} flex items-center justify-center mb-4`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold mb-2">{action.title}</h3>
                    <p className="text-sm text-gray-600 mb-4 flex-grow">{action.description}</p>
                    <Button onClick={action.action} variant="outline" className="w-full">
                      {action.buttonText}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Recent Activity & Stats */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Stats Cards */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold mb-4">Overview</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Upcoming Appointments</p>
                    <p className="text-3xl font-bold mt-1">{stats.upcomingAppointments}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Family Members</p>
                    <p className="text-3xl font-bold mt-1">{stats.familyMembers}/3</p>
                    <p className="text-xs text-gray-500 mt-1">Max 3 allowed</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Medical Records</p>
                    <p className="text-3xl font-bold mt-1">{stats.medicalEvents}</p>
                    <p className="text-xs text-gray-500 mt-1">Total events</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Pending Actions</p>
                    <p className="text-3xl font-bold mt-1">{stats.mergeRequests}</p>
                    <p className="text-xs text-gray-500 mt-1">Merge requests</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                    <ShieldAlert className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h2 className="text-xl font-bold mb-4">Quick Links</h2>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push('/portal/settings')}
              >
                <Settings className="mr-2 h-4 w-4" />
                Profile Settings
              </Button>
              
              {stats.mergeRequests > 0 && (
                <Button 
                  variant="outline" 
                  className="w-full justify-start bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
                  onClick={() => router.push('/portal/merge')}
                >
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Resolve Merge Requests ({stats.mergeRequests})
                </Button>
              )}
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push('/online')}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Start Online Consultation
              </Button>
              
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 mb-2">Need help?</p>
                <Button variant="ghost" className="w-full justify-start text-gray-500">
                  Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}