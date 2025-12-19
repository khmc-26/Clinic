// UPDATE the entire component with correct options
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Merge, User, Users, UserPlus, AlertCircle, X } from 'lucide-react'
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
  const [selectedMergeOption, setSelectedMergeOption] = useState<string>('')
  const [selectedFamilyMemberId, setSelectedFamilyMemberId] = useState<string>('')
  
  // New family member form
  const [newFamilyMember, setNewFamilyMember] = useState({
    name: '',
    relationship: 'OTHER',
    age: '',
    gender: '',
    medicalNotes: ''
  })

  useEffect(() => {
    if (open && appointment) {
      fetchFamilyMembers()
      setResolutionType('')
      setSelectedMergeOption('')
      setSelectedFamilyMemberId('')
      setNewFamilyMember({
        name: appointment.originalPatientName || '',
        relationship: 'OTHER',
        age: '',
        gender: '',
        medicalNotes: appointment.symptoms || ''
      })
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
    
    if (resolutionType === 'MERGE' && !selectedMergeOption) {
      setError('Please select who to merge with')
      return false
    }
    
    if (resolutionType === 'MERGE' && selectedMergeOption === 'FAMILY' && !selectedFamilyMemberId) {
      setError('Please select a family member')
      return false
    }
    
    if (resolutionType === 'ADD_AS_FAMILY' && !newFamilyMember.name.trim()) {
      setError('Please enter a name for the new family member')
      return false
    }
    
    return true
  }

  const handleResolve = async () => {
    if (!validateSelection()) return

    setLoading(true)
    setError(null)

    try {
      let payload: any = {}

      switch (resolutionType) {
        case 'MERGE':
          if (selectedMergeOption === 'SELF') {
            payload = {
              resolutionType: 'SELF'
            }
          } else if (selectedMergeOption === 'FAMILY') {
            payload = {
              resolutionType: 'FAMILY',
              familyMemberId: selectedFamilyMemberId
            }
          }
          break
        
        case 'ADD_AS_FAMILY':
          payload = {
            resolutionType: 'NEW',
            patientName: newFamilyMember.name,
            relationship: newFamilyMember.relationship,
            age: newFamilyMember.age ? parseInt(newFamilyMember.age) : undefined,
            gender: newFamilyMember.gender || undefined
          }
          break
        
        case 'KEEP_SEPARATE':
          payload = {
            resolutionType: 'SELF', // Use SELF but don't actually merge, just mark as resolved
            keepSeparate: true
          }
          break
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
      onOpenChange(false)
    } catch (error: any) {
      console.error('Error resolving merge:', error)
      setError(error.message || 'Failed to resolve merge')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
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
              
              <div className="space-y-2">
                <div className="flex items-center">
                  <User className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="font-medium">{appointment.originalPatientName}</span>
                </div>
                {appointment.originalPatientEmail && (
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm">{appointment.originalPatientEmail}</span>
                  </div>
                )}
                {appointment.originalPatientPhone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm">{appointment.originalPatientPhone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Resolution Options */}
          <div className="space-y-4">
            <h4 className="font-semibold">Select Resolution Option</h4>
            
            <RadioGroup value={resolutionType} onValueChange={setResolutionType}>
              {/* Option 1: Merge */}
              <div className="relative">
                <RadioGroupItem value="MERGE" id="merge" className="peer sr-only" />
                <Label
                  htmlFor="merge"
                  className="flex items-start justify-between rounded-lg border-2 border-gray-200 bg-white p-4 hover:bg-gray-50 hover:border-primary peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer"
                >
                  <div className="flex items-start space-x-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Merge className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">Merge to Existing Person</p>
                      
                      {resolutionType === 'MERGE' && (
                        <div className="mt-3 space-y-3">
                          <div className="space-y-2">
                            <Label>Merge with:</Label>
                            <Select value={selectedMergeOption} onValueChange={setSelectedMergeOption}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select person" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="SELF">Myself</SelectItem>
                                <SelectItem value="FAMILY">Family Member</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          {selectedMergeOption === 'FAMILY' && (
                            <div className="space-y-2">
                              <Label>Select Family Member:</Label>
                              <Select value={selectedFamilyMemberId} onValueChange={setSelectedFamilyMemberId}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select family member" />
                                </SelectTrigger>
                                <SelectContent>
                                  {familyMembers.map((member) => (
                                    <SelectItem key={member.id} value={member.id}>
                                      {member.name} ({member.relationship})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="mt-2 text-sm text-gray-600">
                        <p>Update this appointment to match an existing person in your account.</p>
                      </div>
                    </div>
                  </div>
                  <div className={`h-5 w-5 rounded-full border-2 ${resolutionType === 'MERGE' ? 'bg-primary border-primary' : 'border-gray-300'} mt-1`}></div>
                </Label>
              </div>

              {/* Option 2: Add as Family Member */}
              <div className="relative">
                <RadioGroupItem value="ADD_AS_FAMILY" id="add-family" className="peer sr-only" />
                <Label
                  htmlFor="add-family"
                  className="flex items-start justify-between rounded-lg border-2 border-gray-200 bg-white p-4 hover:bg-gray-50 hover:border-primary peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer"
                >
                  <div className="flex items-start space-x-3">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                      <UserPlus className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">Add as Family Member</p>
                      
                      {resolutionType === 'ADD_AS_FAMILY' && (
                        <div className="mt-3 space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label>Name *</Label>
                              <Input
                                value={newFamilyMember.name}
                                onChange={(e) => setNewFamilyMember(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Full name"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Relationship</Label>
                              <Select
                                value={newFamilyMember.relationship}
                                onValueChange={(value) => setNewFamilyMember(prev => ({ ...prev, relationship: value }))}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="SPOUSE">Spouse</SelectItem>
                                  <SelectItem value="CHILD">Child</SelectItem>
                                  <SelectItem value="PARENT">Parent</SelectItem>
                                  <SelectItem value="OTHER">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label>Age</Label>
                              <Input
                                type="number"
                                value={newFamilyMember.age}
                                onChange={(e) => setNewFamilyMember(prev => ({ ...prev, age: e.target.value }))}
                                placeholder="Age"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Gender</Label>
                              <Select
                                value={newFamilyMember.gender}
                                onValueChange={(value) => setNewFamilyMember(prev => ({ ...prev, gender: value }))}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="MALE">Male</SelectItem>
                                  <SelectItem value="FEMALE">Female</SelectItem>
                                  <SelectItem value="OTHER">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Medical Notes</Label>
                            <Textarea
                              value={newFamilyMember.medicalNotes}
                              onChange={(e) => setNewFamilyMember(prev => ({ ...prev, medicalNotes: e.target.value }))}
                              placeholder="Any medical notes..."
                              rows={2}
                            />
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-2 text-sm text-gray-600">
                        <p>Create a new family member and link this appointment to them.</p>
                      </div>
                    </div>
                  </div>
                  <div className={`h-5 w-5 rounded-full border-2 ${resolutionType === 'ADD_AS_FAMILY' ? 'bg-primary border-primary' : 'border-gray-300'} mt-1`}></div>
                </Label>
              </div>

              {/* Option 3: Keep Separate */}
              <div className="relative">
                <RadioGroupItem value="KEEP_SEPARATE" id="keep-separate" className="peer sr-only" />
                <Label
                  htmlFor="keep-separate"
                  className="flex items-start justify-between rounded-lg border-2 border-gray-200 bg-white p-4 hover:bg-gray-50 hover:border-primary peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer"
                >
                  <div className="flex items-start space-x-3">
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <X className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-semibold">Keep as Separate</p>
                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        <p>Keep this appointment as a separate record with the original information.</p>
                        <p className="text-amber-600 mt-2">
                          Note: This will keep the appointment separate from your family members.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className={`h-5 w-5 rounded-full border-2 ${resolutionType === 'KEEP_SEPARATE' ? 'bg-primary border-primary' : 'border-gray-300'} mt-1`}></div>
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
            disabled={loading || !resolutionType}
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

// Add missing imports
import { Mail, Phone } from 'lucide-react'