// /app/portal/merge/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  AlertCircle, 
  User, 
  Users, 
  Merge, 
  Calendar, 
  Loader2,
  ChevronLeft,
  CheckCircle
} from 'lucide-react'
import MergeDialog from '@/components/patient/merge-dialog'

interface MergeAppointment {
  id: string
  appointmentDate: string
  appointmentType: string
  serviceType: string
  status: string
  originalPatientName: string | null
  originalPatientEmail: string | null
  requiresMerge: boolean
  mergeNotes: string | null
  mergeResolvedAt: string | null
  mergedToPatientId: string | null
  mergedToFamilyMemberId: string | null
  
  // Related entities
  patient: {
    id: string
    user: {
      id: string
      name: string | null
      email: string
    }
  }
  
  familyMember: {
    id: string
    name: string
    relationship: string
  } | null
  
  doctor: {
    id: string
    user: {
      name: string | null
    }
    specialization: string
  }
  
  createdAt: string
}

export default function MergePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [appointments, setAppointments] = useState<MergeAppointment[]>([])
  const [pendingAppointments, setPendingAppointments] = useState<MergeAppointment[]>([])
  const [resolvedAppointments, setResolvedAppointments] = useState<MergeAppointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedAppointment, setSelectedAppointment] = useState<MergeAppointment | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [resolvingId, setResolvingId] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/portal/login')
    }
    
    if (status === 'authenticated') {
      fetchMergeAppointments()
    }
  }, [status, router])

  const fetchMergeAppointments = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/appointments/merge')
      
      if (!response.ok) {
        throw new Error('Failed to fetch merge appointments')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setAppointments(data.appointments)
        
        const pending = data.appointments.filter((apt: MergeAppointment) => 
          apt.requiresMerge && !apt.mergeResolvedAt
        )
        const resolved = data.appointments.filter((apt: MergeAppointment) => 
          apt.mergeResolvedAt
        )
        
        setPendingAppointments(pending)
        setResolvedAppointments(resolved)
      } else {
        setError(data.error || 'Failed to load merge appointments')
      }
    } catch (error: any) {
      console.error('Error fetching merge appointments:', error)
      setError(error.message || 'Failed to load merge appointments')
    } finally {
      setLoading(false)
    }
  }

  const handleResolveMerge = (appointment: MergeAppointment) => {
    setSelectedAppointment(appointment)
    setDialogOpen(true)
  }

  const handleResolveSuccess = () => {
    setDialogOpen(false)
    setSelectedAppointment(null)
    fetchMergeAppointments()
  }

  const getMergeType = (appointment: MergeAppointment) => {
    if (appointment.originalPatientEmail === session?.user?.email) {
      return 'SELF_MATCH'
    }
    
    if (appointment.mergeNotes?.includes('family member')) {
      return 'FAMILY_MATCH'
    }
    
    if (appointment.mergeNotes?.includes('existing patient')) {
      return 'EXISTING_PATIENT'
    }
    
    return 'NAME_VARIATION'
  }

  const getMergeTypeColor = (type: string) => {
    switch (type) {
      case 'SELF_MATCH':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'FAMILY_MATCH':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'EXISTING_PATIENT':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200'
    }
  }

  const getMergeTypeText = (type: string) => {
    switch (type) {
      case 'SELF_MATCH':
        return 'Your Account'
      case 'FAMILY_MATCH':
        return 'Family Member'
      case 'EXISTING_PATIENT':
        return 'Existing Patient'
      default:
        return 'Name Variation'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="mt-2 text-gray-600">Loading merge requests...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header - Mobile Responsive */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Button
            variant="ghost"
            className="mb-2"
            onClick={() => router.push('/portal')}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Back to Portal</span>
            <span className="sm:hidden">Back</span>
          </Button>
          
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Merge Requests</h1>
            <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">
              Resolve appointment booking conflicts
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-base md:text-lg px-3 md:px-4 py-1">
            {pendingAppointments.length} Pending
          </Badge>
          <Button 
            variant="outline"
            onClick={() => router.push('/portal/appointments')}
            className="h-9 md:h-10"
          >
            <Calendar className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden md:inline">View Appointments</span>
            <span className="md:hidden">Appointments</span>
          </Button>
        </div>
      </div>

      {/* Stats - Mobile Responsive */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card className="col-span-1">
          <CardContent className="pt-4 md:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-600">Pending</p>
                <p className="text-xl md:text-2xl font-bold mt-1">{pendingAppointments.length}</p>
              </div>
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardContent className="pt-4 md:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-600">Resolved</p>
                <p className="text-xl md:text-2xl font-bold mt-1">{resolvedAppointments.length}</p>
              </div>
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardContent className="pt-4 md:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-600">Self Matches</p>
                <p className="text-xl md:text-2xl font-bold mt-1">
                  {pendingAppointments.filter(a => getMergeType(a) === 'SELF_MATCH').length}
                </p>
              </div>
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardContent className="pt-4 md:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-600">Family Matches</p>
                <p className="text-xl md:text-2xl font-bold mt-1">
                  {pendingAppointments.filter(a => getMergeType(a) === 'FAMILY_MATCH').length}
                </p>
              </div>
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-green-100 flex items-center justify-center">
                <Users className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Merge Resolution</CardTitle>
          <CardDescription className="text-sm md:text-base">
            Review and resolve appointment booking conflicts
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {error ? (
            <div className="py-8 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchMergeAppointments}>Try Again</Button>
            </div>
          ) : pendingAppointments.length === 0 && resolvedAppointments.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No merge requests</h3>
              <p className="text-gray-600 mb-6">All appointments are properly associated.</p>
              <Button onClick={() => router.push('/book')}>
                <Calendar className="mr-2 h-4 w-4" />
                Book Appointment
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Pending Merges Section - Simplified */}
              {pendingAppointments.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg md:text-xl font-semibold">Pending Requests</h3>
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                      {pendingAppointments.length} to resolve
                    </Badge>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-1/3">Appointment</TableHead>
                          <TableHead className="w-1/4">Original Name</TableHead>
                          <TableHead className="w-1/4">Detected As</TableHead>
                          <TableHead className="w-1/6 text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingAppointments.map((appointment) => {
                          const mergeType = getMergeType(appointment)
                          return (
                            <TableRow key={appointment.id} className="bg-amber-50/50">
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="font-medium text-sm">
                                    {formatDate(appointment.appointmentDate)}
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    {formatTime(appointment.appointmentDate)} • {appointment.doctor.user.name}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="font-medium text-sm">{appointment.originalPatientName}</div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className={getMergeTypeColor(mergeType)}>
                                  {getMergeTypeText(mergeType)}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  size="sm"
                                  onClick={() => handleResolveMerge(appointment)}
                                  disabled={resolvingId === appointment.id}
                                  className="h-8 text-xs"
                                >
                                  {resolvingId === appointment.id ? (
                                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                  ) : (
                                    <Merge className="mr-1 h-3 w-3" />
                                  )}
                                  Resolve
                                </Button>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Resolved Merges Section - Simplified */}
              {resolvedAppointments.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg md:text-xl font-semibold">Resolved Merges</h3>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {resolvedAppointments.length} resolved
                    </Badge>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Appointment</TableHead>
                          <TableHead>Original Name</TableHead>
                          <TableHead>Merged To</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {resolvedAppointments.map((appointment) => (
                          <TableRow key={appointment.id}>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-medium text-sm">
                                  {formatDate(appointment.appointmentDate)}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm font-medium">{appointment.originalPatientName}</div>
                            </TableCell>
                            <TableCell>
                              {appointment.mergedToPatientId && (
                                <div className="flex items-center text-sm">
                                  <User className="h-3 w-3 mr-1 text-green-600" />
                                  <span>Your Account</span>
                                </div>
                              )}
                              {appointment.mergedToFamilyMemberId && appointment.familyMember && (
                                <div className="flex items-center text-sm">
                                  <Users className="h-3 w-3 mr-1 text-green-600" />
                                  <span>{appointment.familyMember.name}</span>
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                Resolved
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Simplified Info Box */}
      <div className="p-3 md:p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start">
          <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs md:text-sm text-blue-700">
              <strong>Why merge requests occur:</strong> When booking with your email but a different name, 
              the system creates a merge request to prevent duplicate records.
            </p>
          </div>
        </div>
      </div>

      {/* Merge Dialog */}
      {selectedAppointment && (
        <MergeDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          appointment={selectedAppointment}
          onSuccess={handleResolveSuccess}
        />
      )}
    </div>
  )
}