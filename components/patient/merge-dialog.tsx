// /components/patient/merge-dialog.tsx - SIMPLIFIED VERSION
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
import { Loader2, Merge, User, Users, UserPlus, X, Calendar } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface FamilyMember {
  id: string
  name: string
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
  
  // New family member form
  const [newFamilyMember, setNewFamilyMember] = useState({
    name: '',
    relationship: 'OTHER'
  })

  useEffect(() => {
    if (open && appointment) {
      fetchFamilyMembers()
      setResolutionType('')
      setSelectedFamilyMemberId('')
      setNewFamilyMember({
        name: appointment.originalPatientName || '',
        relationship: 'OTHER'
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
        setFamilyMembers(Array.isArray(data) ? data : [])
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
    
    if (resolutionType === 'MERGE_FAMILY' && !selectedFamilyMemberId) {
      setError('Please select a family member')
      return false
    }
    
    if (resolutionType === 'ADD_FAMILY' && !newFamilyMember.name.trim()) {
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
        case 'MERGE_SELF':
          payload = {
            resolutionType: 'SELF'
          }
          break
        
        case 'MERGE_FAMILY':
          payload = {
            resolutionType: 'FAMILY',
            familyMemberId: selectedFamilyMemberId
          }
          break
        
        case 'ADD_FAMILY':
          payload = {
            resolutionType: 'NEW',
            patientName: newFamilyMember.name,
            relationship: newFamilyMember.relationship
          }
          break
        
        case 'KEEP_SEPARATE':
          payload = {
            resolutionType: 'SELF',
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-lg">
            <Merge className="mr-2 h-5 w-5" />
            Resolve Appointment Conflict
          </DialogTitle>
          <DialogDescription>
            Choose how to handle this appointment booking
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Simplified Appointment Info */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                <span className="font-medium">{formatDate(appointment.appointmentDate)}</span>
              </div>
              <Badge variant="outline" className="text-xs">
                {appointment.serviceType.replace(/_/g, ' ')}
              </Badge>
            </div>
            <div className="text-sm">
              <div className="font-medium text-gray-900">{appointment.originalPatientName}</div>
              <div className="text-gray-600">{appointment.doctor?.user?.name}</div>
            </div>
          </div>

          {/* Conflict Notice */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <span className="font-semibold">Conflict:</span> This appointment uses your email but a different name.
            </p>
          </div>

          {/* Resolution Options - Simplified */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Select Action:</h4>
            
            <RadioGroup value={resolutionType} onValueChange={setResolutionType}>
              {/* Option 1: Merge to Self */}
              <div className="relative">
                <RadioGroupItem value="MERGE_SELF" id="self" className="peer sr-only" />
                <Label
                  htmlFor="self"
                  className="flex items-center justify-between rounded border border-gray-200 bg-white p-3 hover:bg-gray-50 hover:border-primary peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer"
                >
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Merge to Myself</p>
                      <p className="text-xs text-gray-600">Use my account details</p>
                    </div>
                  </div>
                  <div className={`h-4 w-4 rounded-full border ${resolutionType === 'MERGE_SELF' ? 'bg-primary border-primary' : 'border-gray-300'}`}></div>
                </Label>
              </div>

              {/* Option 2: Merge to Family Member */}
              <div className="relative">
                <RadioGroupItem value="MERGE_FAMILY" id="family" className="peer sr-only" />
                <Label
                  htmlFor="family"
                  className="flex items-center justify-between rounded border border-gray-200 bg-white p-3 hover:bg-gray-50 hover:border-primary peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer"
                >
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                      <Users className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Merge to Family Member</p>
                      
                      {resolutionType === 'MERGE_FAMILY' && (
                        <div className="mt-2">
                          <Select value={selectedFamilyMemberId} onValueChange={setSelectedFamilyMemberId}>
                            <SelectTrigger className="w-full text-xs h-8">
                              <SelectValue placeholder="Select family member" />
                            </SelectTrigger>
                            <SelectContent>
                              {familyMembers.map((member) => (
                                <SelectItem key={member.id} value={member.id} className="text-sm">
                                  {member.name} ({member.relationship})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={`h-4 w-4 rounded-full border ${resolutionType === 'MERGE_FAMILY' ? 'bg-primary border-primary' : 'border-gray-300'}`}></div>
                </Label>
              </div>

              {/* Option 3: Add as Family Member */}
              <div className="relative">
                <RadioGroupItem value="ADD_FAMILY" id="add-family" className="peer sr-only" />
                <Label
                  htmlFor="add-family"
                  className="flex items-center justify-between rounded border border-gray-200 bg-white p-3 hover:bg-gray-50 hover:border-primary peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer"
                >
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                      <UserPlus className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Add as New Family Member</p>
                      
                      {resolutionType === 'ADD_FAMILY' && (
                        <div className="mt-2 space-y-2">
                          <div>
                            <Label className="text-xs">Name</Label>
                            <Input
                              value={newFamilyMember.name}
                              onChange={(e) => setNewFamilyMember(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="Full name"
                              className="h-8 text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Relationship</Label>
                            <Select
                              value={newFamilyMember.relationship}
                              onValueChange={(value) => setNewFamilyMember(prev => ({ ...prev, relationship: value }))}
                            >
                              <SelectTrigger className="h-8 text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="SPOUSE" className="text-sm">Spouse</SelectItem>
                                <SelectItem value="CHILD" className="text-sm">Child</SelectItem>
                                <SelectItem value="PARENT" className="text-sm">Parent</SelectItem>
                                <SelectItem value="OTHER" className="text-sm">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={`h-4 w-4 rounded-full border ${resolutionType === 'ADD_FAMILY' ? 'bg-primary border-primary' : 'border-gray-300'}`}></div>
                </Label>
              </div>

              {/* Option 4: Keep Separate */}
              <div className="relative">
                <RadioGroupItem value="KEEP_SEPARATE" id="keep-separate" className="peer sr-only" />
                <Label
                  htmlFor="keep-separate"
                  className="flex items-center justify-between rounded border border-gray-200 bg-white p-3 hover:bg-gray-50 hover:border-primary peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer"
                >
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <X className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Keep as Separate</p>
                      <p className="text-xs text-gray-600">Maintain separate record</p>
                    </div>
                  </div>
                  <div className={`h-4 w-4 rounded-full border ${resolutionType === 'KEEP_SEPARATE' ? 'bg-primary border-primary' : 'border-gray-300'}`}></div>
                </Label>
              </div>
            </RadioGroup>

            {error && (
              <div className="p-2 bg-red-50 border border-red-200 rounded">
                <p className="text-xs text-red-700">{error}</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="h-9"
          >
            Cancel
          </Button>
          <Button 
            size="sm"
            onClick={handleResolve} 
            disabled={loading || !resolutionType}
            className="h-9"
          >
            {loading && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
            <Merge className="mr-2 h-3 w-3" />
            Resolve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}