// /components/patient/family-member-dialog.tsx
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Loader2, UserPlus, User } from 'lucide-react'

interface FamilyMember {
  id: string
  name: string
  email: string | null
  phone: string | null
  relationship: string
  age: number | null
  gender: string | null
  medicalNotes: string | null
}

interface FamilyMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  member: FamilyMember | null
  onSuccess: () => void
  existingMembersCount: number
}

export default function FamilyMemberDialog({
  open,
  onOpenChange,
  member,
  onSuccess,
  existingMembersCount
}: FamilyMemberDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    relationship: 'SPOUSE',
    age: '',
    gender: '',
    medicalNotes: ''
  })

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name || '',
        email: member.email || '',
        phone: member.phone || '',
        relationship: member.relationship || 'SPOUSE',
        age: member.age?.toString() || '',
        gender: member.gender || '',
        medicalNotes: member.medicalNotes || ''
      })
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        relationship: 'SPOUSE',
        age: '',
        gender: '',
        medicalNotes: ''
      })
    }
    setError(null)
  }, [member, open])

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required')
      return false
    }
    
    // FIXED: Make email validation optional
    if (formData.email && formData.email.trim() !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address')
      return false
    }
    
    // FIXED: Make phone validation optional
    if (formData.phone && formData.phone.trim() !== '' && !/^\d{10}$/.test(formData.phone)) {
      setError('Phone number must be 10 digits')
      return false
    }
    
    if (formData.age && (parseInt(formData.age) < 0 || parseInt(formData.age) > 120)) {
      setError('Age must be between 0 and 120')
      return false
    }
    
    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    // Check max limit for new members
    if (!member && existingMembersCount >= 3) {
      setError('Maximum limit of 3 family members reached')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const url = '/api/patient/family-members'
      const method = member ? 'PUT' : 'POST'
      
      const payload = {
        ...(member && { id: member.id }),
        name: formData.name,
        email: formData.email?.trim() || null, // Can be null
        phone: formData.phone?.trim() || null, // Can be null
        relationship: formData.relationship,
        age: formData.age ? parseInt(formData.age) : null,
        gender: formData.gender || null,
        medicalNotes: formData.medicalNotes || null
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save family member')
      }

      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      console.error('Error saving family member:', error)
      setError(error.message || 'Failed to save family member')
    } finally {
      setLoading(false)
    }
  }

  const relationships = [
    { value: 'SPOUSE', label: 'Spouse' },
    { value: 'CHILD', label: 'Child' },
    { value: 'PARENT', label: 'Parent' },
    { value: 'OTHER', label: 'Other' }
  ]

  const genders = [
    { value: 'MALE', label: 'Male' },
    { value: 'FEMALE', label: 'Female' },
    { value: 'OTHER', label: 'Other' }
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            {member ? (
              <>
                <User className="mr-2 h-5 w-5" />
                Edit Family Member
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-5 w-5" />
                Add Family Member
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {member 
              ? 'Update the details of your family member.' 
              : 'Add a new family member to book appointments for them. Email and phone are optional - they will use your account email for notifications.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="Full name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="relationship">Relationship *</Label>
              <Select
                value={formData.relationship}
                onValueChange={(value) => handleChange('relationship', value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select relationship" />
                </SelectTrigger>
                <SelectContent>
                  {relationships.map((rel) => (
                    <SelectItem key={rel.value} value={rel.value}>
                      {rel.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email (Optional)</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-gray-500">Optional - uses your account email if not provided</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone (Optional)</Label>
              <Input
                id="phone"
                placeholder="10-digit number"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-gray-500">Optional - uses your account phone if not provided</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">Age (Optional)</Label>
              <Input
                id="age"
                type="number"
                placeholder="Age in years"
                min="0"
                max="120"
                value={formData.age}
                onChange={(e) => handleChange('age', e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender (Optional)</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => handleChange('gender', value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  {genders.map((gender) => (
                    <SelectItem key={gender.value} value={gender.value}>
                      {gender.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="medicalNotes">Medical Notes (Optional)</Label>
            <Textarea
              id="medicalNotes"
              placeholder="Any medical conditions, allergies, or notes for doctors..."
              rows={3}
              value={formData.medicalNotes}
              onChange={(e) => handleChange('medicalNotes', e.target.value)}
              disabled={loading}
            />
          </div>

          {!member && existingMembersCount >= 3 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-700">
                <strong>Limit Reached:</strong> You have reached the maximum limit of 3 family members. 
                Please remove an existing member before adding a new one.
              </p>
            </div>
          )}

          {!member && existingMembersCount < 3 && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> You can add {3 - existingMembersCount} more family member(s).
                Email and phone are optional - family members will use your account contact details.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {member ? 'Update Member' : 'Add Member'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}