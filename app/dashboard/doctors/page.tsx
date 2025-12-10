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
  Users, UserPlus, UserCheck, UserX, Mail, MoreVertical,
  Calendar, DollarSign, Award
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
  appointments: { id: string }[]
  patientAssignments: { id: string }[]
}

export default function DoctorsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session?.user?.isDoctor) {
      router.push('/doctor/login')
      return
    }

    fetchDoctors()
  }, [session, status, router])

  const fetchDoctors = async () => {
    try {
      const response = await fetch('/api/doctors')
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

  const handleToggleStatus = async (doctorId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/doctors/${doctorId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      })

      if (!response.ok) throw new Error('Failed to update status')
      
      // Update local state
      setDoctors(doctors.map(doctor => 
        doctor.id === doctorId 
          ? { ...doctor, isActive: !currentStatus }
          : doctor
      ))
    } catch (error) {
      console.error('Error updating doctor status:', error)
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

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Doctor Management</h1>
          <p className="text-gray-600">Manage all doctors in the system</p>
        </div>
        
        {session?.user?.isAdmin && (
          <Button onClick={() => setShowInviteDialog(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite New Doctor
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Doctors</CardTitle>
          <CardDescription>
            {doctors.length} doctor{doctors.length !== 1 ? 's' : ''} in the system
          </CardDescription>
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
                <TableHead>Role</TableHead>
                <TableHead>Patients</TableHead>
                <TableHead>Appointments</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {doctors.map((doctor) => (
                <TableRow key={doctor.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div 
                        className="h-10 w-10 rounded-full flex items-center justify-center text-white"
                        style={{ backgroundColor: doctor.colorCode }}
                      >
                        {doctor.user.name?.charAt(0) || doctor.user.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium">{doctor.user.name || 'No name'}</div>
                        <div className="text-sm text-gray-500">{doctor.user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{doctor.specialization}</TableCell>
                  <TableCell>{doctor.experience} years</TableCell>
                  <TableCell>₹{doctor.consultationFee}</TableCell>
                  <TableCell>
                    <Badge variant={doctor.isActive ? "default" : "secondary"}>
                      {doctor.isActive ? 'Active' : 'Inactive'}
                    </Badge>
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
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleViewDetails(doctor)}>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="mr-2 h-4 w-4" />
                          Send Message
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {session?.user?.isAdmin && (
                          <>
                            <DropdownMenuItem
                              onClick={() => handleToggleStatus(doctor.id, doctor.isActive)}
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
                              <DropdownMenuItem className="text-red-600">
                                Delete Doctor
                              </DropdownMenuItem>
                            )}
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {doctors.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">No doctors found</h3>
              <p className="text-gray-500 mb-4">Invite doctors to join your clinic</p>
              {session?.user?.isAdmin && (
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
    </div>
  )
}