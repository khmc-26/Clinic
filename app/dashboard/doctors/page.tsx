// app/dashboard/doctors/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { 
  Users, UserPlus, UserCheck, UserX, MoreVertical,
  Calendar, DollarSign, Award, Trash2, Archive, Filter
} from 'lucide-react'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import InviteDoctorDialog from '@/components/doctor/invite-doctor-dialog'
import DoctorDetailsDialog from '@/components/doctor/doctor-details-dialog'
import ToggleButton from '@/components/ui/toggle-button'
import StatusToggleConfirm from '@/components/doctor/status-toggle-confirm'
import DeleteDoctorConfirm from '@/components/doctor/delete-doctor-confirm'

interface Doctor {
  id: string
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
  specialization: string
  experience: number
  consultationFee: number
  isActive: boolean
  isAdmin: boolean
  colorCode: string
  createdAt: string
  deletedAt: string | null
  appointments: { id: string }[]
  patientAssignments: { id: string }[]
  availabilities: {
    dayOfWeek: number
    startTime: string
    endTime: string
    isActive: boolean
  }[]
}

export default function DoctorsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showDeleted, setShowDeleted] = useState(false)
  
  // State for status toggle confirmation
  const [statusToggleConfirm, setStatusToggleConfirm] = useState({
    open: false,
    doctorId: '',
    doctorName: '',
    currentStatus: false,
    isLoading: false,
  })

  // State for delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState({
    open: false,
    doctorId: '',
    doctorName: '',
    isLoading: false,
  })

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session?.user?.isDoctor) {
      router.push('/doctor/login')
      return
    }

    fetchDoctors()
  }, [session, status, router, showDeleted])

  const fetchDoctors = async () => {
    try {
      const url = showDeleted 
        ? '/api/doctors?showDeleted=true'
        : '/api/doctors'
      
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch doctors')
      const data = await response.json()
      setDoctors(data)
    } catch (error) {
      console.error('Error fetching doctors:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInviteSuccess = () => {
    setShowInviteDialog(false)
    fetchDoctors() // Refresh list
  }

  const handleToggleStatusClick = (doctorId: string, doctorName: string, currentStatus: boolean) => {
    setStatusToggleConfirm({
      open: true,
      doctorId,
      doctorName,
      currentStatus,
      isLoading: false,
    })
  }

  const handleConfirmToggleStatus = async () => {
    setStatusToggleConfirm(prev => ({ ...prev, isLoading: true }))
    
    try {
      const response = await fetch(`/api/doctors/${statusToggleConfirm.doctorId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !statusToggleConfirm.currentStatus })
      })

      if (!response.ok) throw new Error('Failed to update status')
      
      // Update local state
      setDoctors(doctors.map(doctor => 
        doctor.id === statusToggleConfirm.doctorId 
          ? { ...doctor, isActive: !statusToggleConfirm.currentStatus }
          : doctor
      ))
      
      // Close confirmation
      setStatusToggleConfirm(prev => ({ ...prev, open: false }))
    } catch (error) {
      console.error('Error updating doctor status:', error)
      setStatusToggleConfirm(prev => ({ ...prev, isLoading: false }))
    }
  }

  const handleDeleteClick = (doctorId: string, doctorName: string) => {
    setDeleteConfirm({
      open: true,
      doctorId,
      doctorName,
      isLoading: false,
    })
  }

  const handleConfirmDelete = async () => {
    setDeleteConfirm(prev => ({ ...prev, isLoading: true }))
    
    try {
      const response = await fetch(`/api/doctors/${deleteConfirm.doctorId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete doctor')
      }
      
      // Remove from local state if not showing deleted doctors
      if (!showDeleted) {
        setDoctors(doctors.filter(doctor => doctor.id !== deleteConfirm.doctorId))
      } else {
        // If showing deleted, refresh the list
        fetchDoctors()
      }
      
      // Close confirmation
      setDeleteConfirm(prev => ({ ...prev, open: false }))
    } catch (error: any) {
      console.error('Error deleting doctor:', error)
      alert(`Error: ${error.message}`)
      setDeleteConfirm(prev => ({ ...prev, isLoading: false }))
    }
  }

  const handleViewDetails = (doctor: Doctor) => {
    setSelectedDoctor(doctor)
    setShowDetailsDialog(true)
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  const activeDoctorsCount = doctors.filter(d => d.isActive && !d.deletedAt).length
  const inactiveDoctorsCount = doctors.filter(d => !d.isActive && !d.deletedAt).length
  const deletedDoctorsCount = doctors.filter(d => d.deletedAt).length

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Doctor Management</h1>
          <p className="text-gray-600">Manage all doctors in the system</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {session?.user?.isAdmin && (
            <>
              <Button 
                variant={showDeleted ? "default" : "outline"} 
                onClick={() => setShowDeleted(!showDeleted)}
                size="sm"
              >
                <Filter className="mr-2 h-4 w-4" />
                {showDeleted ? 'Hide Deleted' : 'Show Deleted'}
                {showDeleted && deletedDoctorsCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {deletedDoctorsCount}
                  </Badge>
                )}
              </Button>
              <Button onClick={() => setShowInviteDialog(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Invite New Doctor
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Doctors</p>
                <p className="text-2xl font-bold text-green-600">{activeDoctorsCount}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <UserCheck className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Inactive Doctors</p>
                <p className="text-2xl font-bold text-red-600">{inactiveDoctorsCount}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <UserX className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Deleted Doctors</p>
                <p className="text-2xl font-bold text-gray-600">{deletedDoctorsCount}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                <Archive className="h-5 w-5 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{showDeleted ? 'All Doctors (Including Deleted)' : 'Active & Inactive Doctors'}</CardTitle>
              <CardDescription>
                {doctors.length} doctor{doctors.length !== 1 ? 's' : ''} found
                {showDeleted && deletedDoctorsCount > 0 && ` (${deletedDoctorsCount} deleted)`}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Doctor</TableHead>
                <TableHead>Specialization</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Toggle</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Patients</TableHead>
                <TableHead>Appointments</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {doctors.map((doctor) => {
                const isDeleted = !!doctor.deletedAt
                const isSelf = doctor.user.email === session?.user?.email
                
                return (
                  <TableRow key={doctor.id} className={isDeleted ? 'opacity-60 bg-gray-50' : ''}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div 
                          className="h-10 w-10 rounded-full flex items-center justify-center text-white"
                          style={{ backgroundColor: doctor.colorCode }}
                        >
                          {doctor.user.name?.charAt(0) || doctor.user.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium flex items-center">
                            {doctor.user.name || 'No name'}
                            {isDeleted && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                <Archive className="h-3 w-3 mr-1" />
                                Deleted
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">{doctor.user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{doctor.specialization}</TableCell>
                    <TableCell>{doctor.experience} years</TableCell>
                    <TableCell>₹{doctor.consultationFee}</TableCell>
                    <TableCell>
                      {isDeleted ? (
                        <Badge variant="outline">
                          Deleted
                        </Badge>
                      ) : (
                        <Badge variant={doctor.isActive ? "success" : "destructive"}>
                          {doctor.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {!isDeleted && session?.user?.isAdmin && !doctor.isAdmin && (
                        <ToggleButton
                          checked={doctor.isActive}
                          onCheckedChange={() => 
                            handleToggleStatusClick(
                              doctor.id, 
                              doctor.user.name || doctor.user.email, 
                              doctor.isActive
                            )
                          }
                          disabled={isSelf}
                          size="sm"
                        />
                      )}
                      {doctor.isAdmin && !isDeleted && (
                        <span className="text-sm text-gray-500">Admin</span>
                      )}
                      {isSelf && !isDeleted && (
                        <span className="text-sm text-gray-500">Self</span>
                      )}
                      {isDeleted && (
                        <span className="text-sm text-gray-500">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={doctor.isAdmin ? "destructive" : "outline"}>
                        {doctor.isAdmin ? 'Admin' : 'Doctor'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1 text-gray-500" />
                        {doctor.patientAssignments?.length || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                        {doctor.appointments?.length || 0}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" disabled={isDeleted}>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem 
                            onClick={() => handleViewDetails(doctor)}
                            disabled={isDeleted}
                          >
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {session?.user?.isAdmin && !isDeleted && (
                            <>
                              <DropdownMenuItem
                                onClick={() => 
                                  handleToggleStatusClick(
                                    doctor.id, 
                                    doctor.user.name || doctor.user.email, 
                                    doctor.isActive
                                  )
                                }
                                disabled={isSelf || doctor.isAdmin}
                              >
                                {doctor.isActive ? (
                                  <>
                                    <UserX className="mr-2 h-4 w-4" />
                                    Disable Doctor
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="mr-2 h-4 w-4" />
                                    Enable Doctor
                                  </>
                                )}
                              </DropdownMenuItem>
                              {!doctor.isAdmin && (
                                <DropdownMenuItem 
                                  className="text-red-600"
                                  onClick={() => handleDeleteClick(doctor.id, doctor.user.name || doctor.user.email)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Doctor
                                </DropdownMenuItem>
                              )}
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          {doctors.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">No doctors found</h3>
              <p className="text-gray-500 mb-4">
                {showDeleted 
                  ? 'No deleted doctors found' 
                  : 'Invite doctors to join your clinic'}
              </p>
              {session?.user?.isAdmin && !showDeleted && (
                <Button onClick={() => setShowInviteDialog(true)}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Invite First Doctor
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invite Doctor Dialog */}
      {showInviteDialog && (
        <InviteDoctorDialog
          open={showInviteDialog}
          onOpenChange={setShowInviteDialog}
          onSuccess={handleInviteSuccess}
        />
      )}

      {/* Doctor Details Dialog */}
      {showDetailsDialog && selectedDoctor && (
        <DoctorDetailsDialog
          open={showDetailsDialog}
          onOpenChange={setShowDetailsDialog}
          doctor={selectedDoctor}
        />
      )}

      {/* Status Toggle Confirmation Dialog */}
      <StatusToggleConfirm
        open={statusToggleConfirm.open}
        onOpenChange={(open) => setStatusToggleConfirm(prev => ({ ...prev, open }))}
        doctorName={statusToggleConfirm.doctorName}
        currentStatus={statusToggleConfirm.currentStatus}
        onConfirm={handleConfirmToggleStatus}
        isLoading={statusToggleConfirm.isLoading}
      />

      {/* Delete Doctor Confirmation Dialog */}
      <DeleteDoctorConfirm
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm(prev => ({ ...prev, open }))}
        doctorName={deleteConfirm.doctorName}
        onConfirm={handleConfirmDelete}
        isLoading={deleteConfirm.isLoading}
      />
    </div>
  )
}