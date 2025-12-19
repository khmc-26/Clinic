'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Calendar, Clock, User, Video, XCircle, AlertCircle, Loader2, ArrowLeft, Users } from 'lucide-react'

type Appointment = {
  id: string
  appointmentDate: string
  appointmentType: 'IN_PERSON' | 'ONLINE'
  serviceType: string
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
  symptoms?: string
  previousTreatment?: string
  duration: number
  googleMeetLink?: string
  diagnosis?: string
  treatmentPlan?: string
  familyMemberId?: string
  familyMember?: {
    id: string
    name: string
    relationship: string
    email?: string
  } | null
  doctor: {
    id: string
    name: string
    specialization: string
    consultationFee: number
  } | null
  createdAt: string
  updatedAt: string
  confirmedAt?: string
  completedAt?: string
  cancelledAt?: string
  // FIXED: Add missing properties for merge appointments
  originalPatientName?: string
  originalPatientEmail?: string
  originalPatientPhone?: string
  requiresMerge?: boolean
  bookedByUserId?: string
  bookedByPatientId?: string
}

export default function PatientAppointmentsPage() {
  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()
  
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([])
  const [pastAppointments, setPastAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/portal/login')
    }
    
    if (sessionStatus === 'authenticated') {
      fetchAppointments()
    }
  }, [sessionStatus, router])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/appointments/patient')
      
      if (!response.ok) {
        throw new Error('Failed to fetch appointments')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setAppointments(data.appointments)
        
        const now = new Date()
        const upcoming = data.appointments.filter((apt: Appointment) => {
          const aptDate = new Date(apt.appointmentDate)
          return aptDate >= now && apt.status !== 'CANCELLED'
        })
        
        const past = data.appointments.filter((apt: Appointment) => {
          const aptDate = new Date(apt.appointmentDate)
          return aptDate < now || apt.status === 'CANCELLED'
        })
        
        setUpcomingAppointments(upcoming)
        setPastAppointments(past)
      } else {
        setError(data.error || 'Failed to load appointments')
      }
    } catch (error: any) {
      console.error('Error fetching appointments:', error)
      setError(error.message || 'Failed to load appointments')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) {
      return
    }

    try {
      setCancellingId(appointmentId)
      
      const response = await fetch(`/api/appointments/${appointmentId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel appointment')
      }

      if (data.success) {
        await fetchAppointments()
        alert('Appointment cancelled successfully')
      }
    } catch (error: any) {
      console.error('Error cancelling appointment:', error)
      alert(error.message || 'Failed to cancel appointment')
    } finally {
      setCancellingId(null)
    }
  }

  const formatDateOnly = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata',
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatTimeOnly = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'warning'
      case 'CONFIRMED':
        return 'success'
      case 'COMPLETED':
        return 'default'
      case 'CANCELLED':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
  }

  // Helper to display who the appointment is for
  const getAppointmentForDisplay = (appointment: Appointment) => {
    // FIXED: Check for "Someone Else" bookings with originalPatientName
    if (appointment.originalPatientName && !appointment.familyMemberId) {
      // This is a "Someone Else" booking or merge appointment
      return (
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3 text-purple-600" />
            <span className="font-medium">{appointment.originalPatientName}</span>
          </div>
          <Badge variant="outline" className="mt-1 text-xs w-fit bg-purple-50 text-purple-700 border-purple-200">
            Someone Else
          </Badge>
        </div>
      )
    }
    
    if (appointment.familyMember) {
      return (
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3 text-green-600" />
            <span className="font-medium">{appointment.familyMember.name}</span>
          </div>
          <Badge variant="outline" className="mt-1 text-xs w-fit bg-green-50 text-green-700 border-green-200">
            {appointment.familyMember.relationship}
          </Badge>
        </div>
      )
    }
    
    return (
      <div className="flex items-center gap-1">
        <User className="h-3 w-3 text-blue-600" />
        <span className="font-medium">Yourself</span>
      </div>
    )
  }

  if (sessionStatus === 'loading') {
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
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => router.push('/portal')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Portal
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
              <p className="text-gray-600 mt-2">
                Manage appointments for yourself and your family members
              </p>
            </div>
            
            <Button onClick={() => router.push('/book')}>
              <Calendar className="mr-2 h-4 w-4" />
              Book New Appointment
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Upcoming</p>
                  <p className="text-2xl font-bold mt-1">{upcomingAppointments.length}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold mt-1">
                    {pastAppointments.filter(a => a.status === 'COMPLETED').length}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Cancelled</p>
                  <p className="text-2xl font-bold mt-1">
                    {pastAppointments.filter(a => a.status === 'CANCELLED').length}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Family Appointments</p>
                  <p className="text-2xl font-bold mt-1">
                    {appointments.filter(a => a.familyMember).length}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle>Appointment History</CardTitle>
            <CardDescription>
              View appointments for yourself and your family members
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                  <p className="mt-2 text-gray-600">Loading appointments...</p>
                </div>
              </div>
            ) : error ? (
              <div className="py-8 text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={fetchAppointments}>Try Again</Button>
              </div>
            ) : (
              <Tabs defaultValue="upcoming" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upcoming">
                    Upcoming ({upcomingAppointments.length})
                  </TabsTrigger>
                  <TabsTrigger value="past">
                    Past ({pastAppointments.length})
                  </TabsTrigger>
                </TabsList>
                
                {/* Upcoming Appointments Tab */}
                <TabsContent value="upcoming" className="mt-6">
                  {upcomingAppointments.length === 0 ? (
                    <div className="text-center py-12">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming appointments</h3>
                      <p className="text-gray-600 mb-6">You don't have any upcoming appointments scheduled.</p>
                      <Button onClick={() => router.push('/book')}>
                        Book New Appointment
                      </Button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date & Time</TableHead>
                            <TableHead>For</TableHead>
                            <TableHead>Doctor</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {upcomingAppointments.map((appointment) => (
                            <TableRow key={appointment.id}>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="font-medium">{formatDateOnly(appointment.appointmentDate)}</span>
                                  <span className="text-sm text-gray-500">{formatTimeOnly(appointment.appointmentDate)} IST</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                {getAppointmentForDisplay(appointment)}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-gray-500" />
                                  <span>{appointment.doctor?.name || 'Dr. Kavitha Thomas'}</span>
                                </div>
                                <span className="text-sm text-gray-500">{appointment.doctor?.specialization}</span>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="capitalize">
                                  {appointment.appointmentType.toLowerCase().replace('_', ' ')}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4 text-gray-500" />
                                  <span>{appointment.duration} min</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={getStatusBadgeVariant(appointment.status)}>
                                  {getStatusText(appointment.status)}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  {appointment.appointmentType === 'ONLINE' && appointment.googleMeetLink && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => window.open(appointment.googleMeetLink, '_blank')}
                                    >
                                      <Video className="mr-1 h-3 w-3" />
                                      Join
                                    </Button>
                                  )}
                                  
                                  {appointment.status !== 'CANCELLED' && (
                                    <Button
                                      size="sm"
                                      variant="error"
                                      onClick={() => handleCancelAppointment(appointment.id)}
                                      disabled={cancellingId === appointment.id}
                                    >
                                      {cancellingId === appointment.id ? (
                                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                      ) : (
                                        <XCircle className="mr-1 h-3 w-3" />
                                      )}
                                      Cancel
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </TabsContent>
                
                {/* Past Appointments Tab */}
                <TabsContent value="past" className="mt-6">
                  {pastAppointments.length === 0 ? (
                    <div className="text-center py-12">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No past appointments</h3>
                      <p className="text-gray-600">You don't have any past appointments yet.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date & Time</TableHead>
                            <TableHead>For</TableHead>
                            <TableHead>Doctor</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Notes</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pastAppointments.map((appointment) => (
                            <TableRow key={appointment.id}>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="font-medium">{formatDateOnly(appointment.appointmentDate)}</span>
                                  <span className="text-sm text-gray-500">{formatTimeOnly(appointment.appointmentDate)} IST</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                {getAppointmentForDisplay(appointment)}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-gray-500" />
                                  <span>{appointment.doctor?.name || 'Dr. Kavitha Thomas'}</span>
                                </div>
                                <span className="text-sm text-gray-500">{appointment.doctor?.specialization}</span>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="capitalize">
                                  {appointment.appointmentType.toLowerCase().replace('_', ' ')}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4 text-gray-500" />
                                  <span>{appointment.duration} min</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={getStatusBadgeVariant(appointment.status)}>
                                  {getStatusText(appointment.status)}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {appointment.diagnosis ? (
                                  <span className="text-sm text-gray-600 line-clamp-2">
                                    {appointment.diagnosis}
                                  </span>
                                ) : (
                                  <span className="text-sm text-gray-400">No notes</span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-700">
                <strong>Cancellation Policy:</strong> Appointments must be cancelled at least 24 hours in advance.
                Late cancellations may be subject to fees.
              </p>
              <p className="text-sm text-blue-700 mt-2">
                <strong>Family Appointments:</strong> You can view and manage appointments booked for your family members.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}