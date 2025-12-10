// components/doctor/invite-doctor-dialog.tsx
'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Mail, User, Shield } from 'lucide-react'

interface InviteDoctorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export default function InviteDoctorDialog({
  open,
  onOpenChange,
  onSuccess,
}: InviteDoctorDialogProps) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'DOCTOR' | 'ADMIN'>('DOCTOR')
  const [specialization, setSpecialization] = useState('Homoeopathy')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/doctors/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          role,
          specialization
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send invitation')
      }

      onSuccess()
      resetForm()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setEmail('')
    setRole('DOCTOR')
    setSpecialization('Homoeopathy')
    setError('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Invite New Doctor</DialogTitle>
            <DialogDescription>
              Send an invitation email to a new doctor. They'll have 2 hours to accept.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">
                <Mail className="inline-block h-4 w-4 mr-2" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="doctor@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label>
                <Shield className="inline-block h-4 w-4 mr-2" />
                Role
              </Label>
              <RadioGroup
                value={role}
                onValueChange={(value: 'DOCTOR' | 'ADMIN') => setRole(value)}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="DOCTOR" id="role-doctor" />
                  <Label htmlFor="role-doctor" className="cursor-pointer">
                    Regular Doctor
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ADMIN" id="role-admin" />
                  <Label htmlFor="role-admin" className="cursor-pointer">
                    Admin Doctor
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialization">
                <User className="inline-block h-4 w-4 mr-2" />
                Specialization
              </Label>
              <Select
                value={specialization}
                onValueChange={setSpecialization}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select specialization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Homoeopathy">Homoeopathy</SelectItem>
                  <SelectItem value="General Physician">General Physician</SelectItem>
                  <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                  <SelectItem value="Dermatology">Dermatology</SelectItem>
                  <SelectItem value="Psychiatry">Psychiatry</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">Invitation Process</h4>
              <ol className="text-sm text-blue-700 list-decimal list-inside space-y-1">
                <li>Doctor receives email with invitation link</li>
                <li>Link expires in 2 hours for security</li>
                <li>Doctor sets up password and availability</li>
                <li>Account becomes active immediately</li>
              </ol>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm()
                onOpenChange(false)
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Sending Invitation...' : 'Send Invitation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}