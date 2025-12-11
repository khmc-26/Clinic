// app/dashboard/doctors/page.tsx - MOBILE RESPONSIVE VERSION
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
  Calendar, DollarSign, Award, Trash2, Archive, Filter,
  Smartphone, Monitor
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
      <div className="p-4 md:p-8">
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
    <div className="p-3 md:p-6 lg:p-8">
      {/* Mobile-friendly header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Doctor Management</h1>
          <p className="text-sm md:text-base text-gray-600">Manage all doctors in the system</p>
        </div>
        
        <div className="flex flex-wrap gap-2 md:gap-4">
          {session?.user?.isAdmin && (
            <>
              <Button 
                variant={showDeleted ? "default" : "outline"} 
                onClick={() => setShowDeleted(!showDeleted)}
                size="sm"
                className="flex-1 md:flex-none"
              >
                <Filter className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                <span className="hidden md:inline">
                  {showDeleted ? 'Hide Deleted' : 'Show Deleted'}
                </span>
                <span className="md:hidden">
                  {showDeleted ? 'Hide' : 'Deleted'}
                </span>
                {showDeleted && deletedDoctorsCount > 0 && (
                  <Badge variant="destructive" className="ml-1 md:ml-2 text-xs">
                    {deletedDoctorsCount}
                  </Badge>
                )}
              </Button>
              <Button 
                onClick={() => setShowInviteDialog(true)}
                size="sm"
                className="flex-1 md:flex-none"
              >
                <UserPlus className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                <span className="hidden md:inline">Invite Doctor</span>
                <span className="md:hidden">Invite</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Mobile-optimized stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-6">
        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="pt-4 md:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-500">Active Doctors</p>
                <p className="text-xl md:text-2xl font-bold text-green-600">{activeDoctorsCount}</p>
              </div>
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-green-100 flex items-center justify-center">
                <UserCheck className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="pt-4 md:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-500">Inactive Doctors</p>
                <p className="text-xl md:text-2xl font-bold text-red-600">{inactiveDoctorsCount}</p>
              </div>
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-red-100 flex items-center justify-center">
                <UserX className="h-4 w-4 md:h-5 md:w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-sm transition-shadow sm:col-span-2 lg:col-span-1">
          <CardContent className="pt-4 md:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-500">Deleted Doctors</p>
                <p className="text-xl md:text-2xl font-bold text-gray-600">{deletedDoctorsCount}</p>
              </div>
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-gray-100 flex items-center justify-center">
                <Archive className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Responsive table container */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
            <div>
              <CardTitle className="text-lg md:text-xl">
                {showDeleted ? 'All Doctors' : 'Active & Inactive Doctors'}
              </CardTitle>
              <CardDescription className="text-xs md:text-sm">
                {doctors.length} doctor{doctors.length !== 1 ? 's' : ''} found
                {showDeleted && deletedDoctorsCount > 0 && ` (${deletedDoctorsCount} deleted)`}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Smartphone className="h-3 w-3 md:hidden" />
              <Monitor className="h-3 w-3 hidden md:block" />
              <span className="hidden sm:inline">Scroll horizontally on mobile</span>
              <span className="sm:hidden">Scroll →</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 md:p-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[180px]">Doctor</TableHead>
                  <TableHead className="hidden md:table-cell min-w-[120px]">Specialization</TableHead>
                  <TableHead className="min-w-[80px]">Exp</TableHead>
                  <TableHead className="hidden sm:table-cell min-w-[80px]">Fee</TableHead>
                  <TableHead className="min-w-[80px]">Status</TableHead>
                  <TableHead className="min-w-[100px]">Toggle</TableHead>
                  <TableHead className="hidden lg:table-cell min-w-[80px]">Role</TableHead>
                  <TableHead className="hidden xl:table-cell min-w-[80px]">Patients</TableHead>
                  <TableHead className="hidden xl:table-cell min-w-[100px]">Appointments</TableHead>
                  <TableHead className="text-right min-w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {doctors.map((doctor) => {
                  const isDeleted = !!doctor.deletedAt
                  const isSelf = doctor.user.email === session?.user?.email
                  
                  return (
                    <TableRow key={doctor.id} className={isDeleted ? 'opacity-60 bg-gray-50 hover:bg-gray-100' : ''}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div 
                            className="h-8 w-8 md:h-10 md:w-10 rounded-full flex items-center justify-center text-white text-sm md:text-base"
                            style={{ backgroundColor: doctor.colorCode }}
                          >
                            {doctor.user.name?.charAt(0) || doctor.user.email.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-sm md:text-base truncate max-w-[150px] md:max-w-none flex items-center">
                              {doctor.user.name || 'No name'}
                              {isDeleted && (
                                <Badge variant="outline" className="ml-2 text-xs hidden sm:inline-flex">
                                  <Archive className="h-2 w-2 md:h-3 md:w-3 mr-1" />
                                  Deleted
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 truncate max-w-[150px] md:max-w-none">
                              {doctor.user.email}
                            </div>
                            {/* Mobile-only specialization */}
                            <div className="md:hidden text-xs text-gray-600 mt-1">
                              {doctor.specialization}
                              {doctor.isAdmin && (
                                <Badge variant="destructive" className="ml-2 text-xs">
                                  Admin
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {doctor.specialization}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{doctor.experience}y</span>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <span className="text-sm">₹{doctor.consultationFee}</span>
                      </TableCell>
                      <TableCell>
                        {isDeleted ? (
                          <Badge variant="outline" className="text-xs">
                            <span className="hidden sm:inline">Deleted</span>
                            <span className="sm:hidden">Del</span>
                          </Badge>
                        ) : (
                          <Badge 
                            variant={doctor.isActive ? "success" : "destructive"} 
                            className="text-xs"
                          >
                            <span className="hidden sm:inline">
                              {doctor.isActive ? 'Active' : 'Inactive'}
                            </span>
                            <span className="sm:hidden">
                              {doctor.isActive ? 'Act' : 'Inact'}
                            </span>
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
                            className="scale-90 md:scale-100"
                          />
                        )}
                        {doctor.isAdmin && !isDeleted && (
                          <span className="text-xs text-gray-500 hidden md:inline">Admin</span>
                        )}
                        {isSelf && !isDeleted && (
                          <span className="text-xs text-gray-500">Self</span>
                        )}
                        {isDeleted && (
                          <span className="text-xs text-gray-500">N/A</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge variant={doctor.isAdmin ? "destructive" : "outline"} className="text-xs">
                          {doctor.isAdmin ? 'Admin' : 'Doctor'}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        <div className="flex items-center">
                          <Users className="h-3 w-3 md:h-4 md:w-4 mr-1 text-gray-500" />
                          <span className="text-sm">{doctor.patientAssignments?.length || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 md:h-4 md:w-4 mr-1 text-gray-500" />
                          <span className="text-sm">{doctor.appointments?.length || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-8 w-8 md:h-9 md:w-9 p-0"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel className="text-xs">Actions</DropdownMenuLabel>
                            <DropdownMenuItem 
                              onClick={() => handleViewDetails(doctor)}
                              disabled={isDeleted}
                              className="text-xs md:text-sm"
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
                                  className="text-xs md:text-sm"
                                >
                                  {doctor.isActive ? (
                                    <>
                                      <UserX className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                                      Disable Doctor
                                    </>
                                  ) : (
                                    <>
                                      <UserCheck className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                                      Enable Doctor
                                    </>
                                  )}
                                </DropdownMenuItem>
                                {!doctor.isAdmin && (
                                  <DropdownMenuItem 
                                    className="text-red-600 text-xs md:text-sm"
                                    onClick={() => handleDeleteClick(doctor.id, doctor.user.name || doctor.user.email)}
                                  >
                                    <Trash2 className="mr-2 h-3 w-3 md:h-4 md:w-4" />
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
          </div>

          {doctors.length === 0 && (
            <div className="text-center py-8 md:py-12">
              <Users className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-3 md:mb-4 text-gray-400" />
              <h3 className="text-base md:text-lg font-medium mb-2">No doctors found</h3>
              <p className="text-xs md:text-sm text-gray-500 mb-3 md:mb-4">
                {showDeleted 
                  ? 'No deleted doctors found' 
                  : 'Invite doctors to join your clinic'}
              </p>
              {session?.user?.isAdmin && !showDeleted && (
                <Button 
                  onClick={() => setShowInviteDialog(true)}
                  size="sm"
                  className="text-xs md:text-sm"
                >
                  <UserPlus className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                  Invite First Doctor
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs - Ensure mobile-friendly */}
      {showInviteDialog && (
        <InviteDoctorDialog
          open={showInviteDialog}
          onOpenChange={setShowInviteDialog}
          onSuccess={handleInviteSuccess}
        />
      )}

      {/* Doctor Details Dialog - Make responsive */}
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