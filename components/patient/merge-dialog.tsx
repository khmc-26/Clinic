// /components/patient/merge-dialog.tsx
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Loader2, Merge, User, Users, UserPlus, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface FamilyMember {
  id: string
  name: string
  email: string | null
  relationship: string
}

interface MergeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointment: any
  onSuccess: () => void
}

export default function MergeDialog({
  open,
  onOpenChange,
  appointment,
  onSuccess
}: MergeDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])
  const [resolutionType, setResolutionType] = useState<string>('')
  const [selectedFamilyMemberId, setSelectedFamilyMemberId] = useState<string>('')

  useEffect(() => {
    if (open && appointment) {
      fetchFamilyMembers()
      // Auto-select based on merge type
      if (appointment.mergeNotes?.includes('logged-in user') || 
          appointment.originalPatientEmail === appointment.bookedByPatient?.user.email) {
        setResolutionType('SELF')
      } else if (appointment.mergeNotes?.includes('family member')) {
        setResolutionType('FAMILY')
      }
    } else {
      setResolutionType('')
      setSelectedFamilyMemberId('')
      setError(null)
    }
  }, [open, appointment])

  const fetchFamilyMembers = async () => {
    try {
      const response = await fetch('/api/patient/family-members')
      if (response.ok) {
        const data = await response.json()
        setFamilyMembers(Array.isArray(data) ? data.filter((fm: any) => fm.isActive) : [])
      }
    } catch (error) {
      console.error('Error fetching family members:', error)
    }
  }

  const validateSelection = () => {
    if (!resolutionType) {
      setError('Please select a resolution option')
      return false
    }
    
    if (resolutionType === 'FAMILY' && !selectedFamilyMemberId) {
      setError('Please select a family member')
      return false
    }
    
    return true
  }

  const handleResolve = async () => {
    if (!validateSelection()) return

    setLoading(true)
    setError(null)

    try {
      const payload = {
        resolutionType,
        ...(resolutionType === 'FAMILY' && { familyMemberId: selectedFamilyMemberId }),
        ...(resolutionType === 'NEW' && { 
          keepSeparate: true,
          patientName: appointment.originalPatientName,
          patientEmail: appointment.originalPatientEmail
        })
      }

      const response = await fetch(`/api/appointments/${appointment.id}/merge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resolve merge')
      }

      onSuccess()
    } catch (error: any) {
      console.error('Error resolving merge:', error)
      setError(error.message || 'Failed to resolve merge')
    } finally {
      setLoading(false)
    }
  }

  const getMergeDescription = () => {
    if (appointment.mergeNotes?.includes('logged-in user')) {
      return 'This appointment was booked with your email but a different name.'
    }
    if (appointment.mergeNotes?.includes('family member')) {
      return 'This appointment matches an existing family member in your account.'
    }
    if (appointment.mergeNotes?.includes('existing patient')) {
      return 'This email already exists in our system as a different patient.'
    }
    return 'There is a conflict between the provided information and existing records.'
  }

  const getSuggestedOption = () => {
    if (appointment.mergeNotes?.includes('logged-in user')) {
      return 'SELF'
    }
    if (appointment.mergeNotes?.includes('family member')) {
      return 'FAMILY'
    }
    return ''
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Merge className="mr-2 h-5 w-5" />
            Resolve Merge Request
          </DialogTitle>
          <DialogDescription>
            Choose how to resolve this appointment booking conflict
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Appointment Summary */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold">Appointment Details</h4>
                  <p className="text-sm text-gray-600">
                    {new Date(appointment.appointmentDate).toLocaleDateString('en-IN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <Badge variant="outline">{appointment.serviceType}</Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Doctor</p>
                  <p className="font-medium">{appointment.doctor.user.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Booked By</p>
                  <p className="font-medium">{appointment.bookedByPatient?.user.name || 'You'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Conflict Information */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-amber-600 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-900">Conflict Detected</h4>
                <p className="text-sm text-amber-800 mt-1">{getMergeDescription()}</p>
                {appointment.mergeNotes && (
                  <p className="text-xs text-amber-700 mt-2 italic">"{appointment.mergeNotes}"</p>
                )}
              </div>
            </div>
          </div>

          {/* Resolution Options */}
          <div className="space-y-4">
            <h4 className="font-semibold">Select Resolution</h4>
            
            <RadioGroup value={resolutionType} onValueChange={setResolutionType}>
              {/* Option 1: Merge to Self */}
              <div className="relative">
                <RadioGroupItem value="SELF" id="self" className="peer sr-only" />
                <Label
                  htmlFor="self"
                  className="flex items-start justify-between rounded-lg border-2 border-gray-200 bg-white p-4 hover:bg-gray-50 hover:border-primary peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer"
                >
                  <div className="flex items-start space-x-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-semibold">Merge to Myself</p>
                        {getSuggestedOption() === 'SELF' && (
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200">Suggested</Badge>
                        )}
                      </div>
                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        <p>Associate this appointment with your account</p>
                        <p>Update name to: <strong>{appointment.bookedByPatient?.user.name}</strong></p>
                        <p>Use your email: <strong>{appointment.bookedByPatient?.user.email}</strong></p>
                      </div>
                    </div>
                  </div>
                  <div className={`h-5 w-5 rounded-full border-2 ${resolutionType === 'SELF' ? 'bg-primary border-primary' : 'border-gray-300'} mt-1`}></div>
                </Label>
              </div>

              {/* Option 2: Merge to Family Member */}
              <div className="relative">
                <RadioGroupItem value="FAMILY" id="family" className="peer sr-only" />
                <Label
                  htmlFor="family"
                  className="flex items-start justify-between rounded-lg border-2 border-gray-200 bg-white p-4 hover:bg-gray-50 hover:border-primary peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer"
                >
                  <div className="flex items-start space-x-3">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                      <Users className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-semibold">Merge to Family Member</p>
                        {getSuggestedOption() === 'FAMILY' && (
                          <Badge className="bg-green-100 text-green-800 border-green-200">Suggested</Badge>
                        )}
                      </div>
                      <div className="mt-2 space-y-2 text-sm text-gray-600">
                        <p>Associate this appointment with a family member</p>
                        
                        {familyMembers.length > 0 ? (
                          <div className="space-y-2">
                            <p className="font-medium">Select family member:</p>
                            <div className="grid grid-cols-2 gap-2">
                              {familyMembers.map((member) => (
                                <div
                                  key={member.id}
                                  className={`p-2 border rounded cursor-pointer transition-colors ${
                                    selectedFamilyMemberId === member.id
                                      ? 'border-primary bg-primary/5'
                                      : 'border-gray-200 hover:border-primary'
                                  }`}
                                  onClick={() => {
                                    setResolutionType('FAMILY')
                                    setSelectedFamilyMemberId(member.id)
                                  }}
                                >
                                  <div className="flex items-center space-x-2">
                                    <div className={`h-3 w-3 rounded-full border ${
                                      selectedFamilyMemberId === member.id
                                        ? 'border-primary bg-primary'
                                        : 'border-gray-300'
                                    }`}></div>
                                    <div>
                                      <p className="font-medium">{member.name}</p>
                                      <p className="text-xs text-gray-500 capitalize">{member.relationship}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <p className="text-amber-600">No family members found. Add family members first.</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={`h-5 w-5 rounded-full border-2 ${resolutionType === 'FAMILY' ? 'bg-primary border-primary' : 'border-gray-300'} mt-1`}></div>
                </Label>
              </div>

              {/* Option 3: Keep as Separate */}
              <div className="relative">
                <RadioGroupItem value="NEW" id="new" className="peer sr-only" />
                <Label
                  htmlFor="new"
                  className="flex items-start justify-between rounded-lg border-2 border-gray-200 bg-white p-4 hover:bg-gray-50 hover:border-primary peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer"
                >
                  <div className="flex items-start space-x-3">
                    <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <UserPlus className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold">Keep as Separate Patient</p>
                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        <p>Create a new patient record with the provided information</p>
                        <p>Name: <strong>{appointment.originalPatientName}</strong></p>
                        <p>Email: <strong>{appointment.originalPatientEmail}</strong></p>
                        <p>Phone: <strong>{appointment.originalPatientPhone}</strong></p>
                        <p className="text-amber-600 mt-2">
                          Note: This will create a duplicate record in the system
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className={`h-5 w-5 rounded-full border-2 ${resolutionType === 'NEW' ? 'bg-primary border-primary' : 'border-gray-300'} mt-1`}></div>
                </Label>
              </div>
            </RadioGroup>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleResolve} 
            disabled={loading || !resolutionType || (resolutionType === 'FAMILY' && !selectedFamilyMemberId)}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Merge className="mr-2 h-4 w-4" />
            Resolve Merge
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}