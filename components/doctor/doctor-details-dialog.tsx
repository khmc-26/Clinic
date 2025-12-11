// components/doctor/doctor-details-dialog.tsx
'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Mail, Phone, Calendar, Users, DollarSign, Award, 
  Clock, Shield, Activity, BriefcaseMedical
} from 'lucide-react'
import { format } from 'date-fns'

// Update the Doctor interface (around line 25)
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
  bio: string | null        // ADD THIS
  qualifications: string[]  // ADD THIS
  achievements: string[]    // ADD THIS
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

interface DoctorDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  doctor: Doctor
}

export default function DoctorDetailsDialog({
  open,
  onOpenChange,
  doctor,
}: DoctorDetailsDialogProps) {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Doctor Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Doctor Header */}
          <div className="flex items-start space-x-4">
            <div 
              className="h-16 w-16 rounded-full flex items-center justify-center text-white text-xl font-bold"
              style={{ backgroundColor: doctor.colorCode }}
            >
              {doctor.user.name?.charAt(0) || doctor.user.email.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold">{doctor.user.name || 'No name'}</h3>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant={doctor.isAdmin ? "destructive" : "outline"}>
                  {doctor.isAdmin ? 'Admin Doctor' : 'Regular Doctor'}
                </Badge>
                <Badge variant={doctor.isActive ? "default" : "secondary"}>
                  {doctor.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center text-sm text-gray-500">
                <Mail className="h-4 w-4 mr-2" />
                Email
              </div>
              <p className="font-medium">{doctor.user.email}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center text-sm text-gray-500">
                <BriefcaseMedical className="h-4 w-4 mr-2" />
                Specialization
              </div>
              <p className="font-medium">{doctor.specialization}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-2" />
                Experience
              </div>
              <p className="font-medium">{doctor.experience} years</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center text-sm text-gray-500">
                <DollarSign className="h-4 w-4 mr-2" />
                Consultation Fee
              </div>
              <p className="font-medium">₹{doctor.consultationFee}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {doctor.patientAssignments?.length || 0}
              </div>
              <div className="text-sm text-gray-500 mt-1">Active Patients</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {doctor.appointments?.length || 0}
              </div>
              <div className="text-sm text-gray-500 mt-1">Total Appointments</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {format(new Date(doctor.createdAt), 'MMM d, yyyy')}
              </div>
              <div className="text-sm text-gray-500 mt-1">Joined On</div>
            </div>
          </div>

          {/* Qualifications */}
          {doctor.qualifications && doctor.qualifications.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2 flex items-center">
                <Award className="h-4 w-4 mr-2" />
                Qualifications
              </h4>
              <div className="flex flex-wrap gap-2">
                {doctor.qualifications.map((qual, index) => (
                  <Badge key={index} variant="secondary">
                    {qual}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Availability */}
          {doctor.availabilities && doctor.availabilities.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2 flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Availability
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {doctor.availabilities
                  .filter(avail => avail.isActive)
                  .map((avail, index) => (
                    <div key={index} className="bg-gray-50 rounded p-2 text-sm">
                      <div className="font-medium">{dayNames[avail.dayOfWeek]}</div>
                      <div className="text-gray-600">
                        {avail.startTime} - {avail.endTime}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Bio */}
          {doctor.bio && (
            <div>
              <h4 className="font-semibold mb-2">Bio</h4>
              <p className="text-gray-700 whitespace-pre-line">{doctor.bio}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}