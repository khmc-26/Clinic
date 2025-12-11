// components/doctor/invite-doctor-dialog.tsx - UPDATED WITH CONFLICT RESOLUTION
'use client'

import { useState, useEffect } from 'react'
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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Mail, 
  User, 
  Shield, 
  AlertTriangle, 
  CheckCircle,
  UserCheck,
  UserPlus
} from 'lucide-react'

interface InviteDoctorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

// Type for email check response
interface EmailCheckResponse {
  exists: boolean
  type?: 'PATIENT' | 'DOCTOR' | 'DELETED_DOCTOR'
  user?: {
    name: string | null
    email: string
  }
  doctor?: {
    isActive: boolean
    deletedAt: string | null
  }
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
  const [checkingEmail, setCheckingEmail] = useState(false)
  const [error, setError] = useState('')
  const [emailStatus, setEmailStatus] = useState<EmailCheckResponse | null>(null)

  // Check email when it changes
  useEffect(() => {
    const checkEmail = async () => {
      if (!email || !email.includes('@')) {
        setEmailStatus(null)
        return
      }

      setCheckingEmail(true)
      try {
        const response = await fetch(`/api/doctors/check-email?email=${encodeURIComponent(email)}`)
        if (response.ok) {
          const data = await response.json()
          setEmailStatus(data)
        } else {
          setEmailStatus(null)
        }
      } catch (error) {
        console.error('Error checking email:', error)
        setEmailStatus(null)
      } finally {
        setCheckingEmail(false)
      }
    }

    // Debounce the email check
    const timeoutId = setTimeout(checkEmail, 500)
    return () => clearTimeout(timeoutId)
  }, [email])

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
          specialization,
          
          restoreDeleted: emailStatus?.type === 'DELETED_DOCTOR'
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
    setEmailStatus(null)
  }

  const getEmailStatusMessage = () => {
    if (!emailStatus) return null

    switch (emailStatus.type) {
      case 'PATIENT':
        return {
          variant: 'warning' as const,
          icon: <UserCheck className="h-4 w-4" />,
          title: 'Patient Account Found',
          message: 'This email is registered as a patient. Would you like to convert them to a doctor?',
          action: 'Send Invitation' // Changed from 'Convert to Doctor'
        }
      case 'DOCTOR':
        return {
          variant: 'error' as const,
          icon: <AlertTriangle className="h-4 w-4" />,
          title: 'Doctor Account Exists',
          message: 'This email is already registered as a doctor.',
          action: 'Cannot invite existing doctor'
        }
      case 'DELETED_DOCTOR':
        return {
          variant: 'info' as const,
          icon: <UserPlus className="h-4 w-4" />,
          title: 'Deleted Doctor Found',
          message: 'This doctor was previously deleted. You can restore their account.',
          action: 'Restore Account'
        }
      default:
        return {
          variant: 'success' as const,
          icon: <CheckCircle className="h-4 w-4" />,
          title: 'Email Available',
          message: 'This email can be invited as a new doctor.',
          action: 'Send Invitation'
        }
    }
  }

  const statusInfo = getEmailStatusMessage()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
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
                className={checkingEmail ? 'animate-pulse' : ''}
              />
              {checkingEmail && (
                <p className="text-xs text-gray-500">Checking email availability...</p>
              )}
            </div>

            {/* Email Status Display */}
            {emailStatus && statusInfo && (
              <div className={`p-4 rounded-lg border ${
                statusInfo.variant === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                statusInfo.variant === 'error' ? 'bg-red-50 border-red-200' :
                statusInfo.variant === 'info' ? 'bg-blue-50 border-blue-200' :
                'bg-green-50 border-green-200'
              }`}>
                <div className="flex items-start space-x-3">
                  <div className={`mt-0.5 ${
                    statusInfo.variant === 'warning' ? 'text-yellow-600' :
                    statusInfo.variant === 'error' ? 'text-red-600' :
                    statusInfo.variant === 'info' ? 'text-blue-600' :
                    'text-green-600'
                  }`}>
                    {statusInfo.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-medium ${
                      statusInfo.variant === 'warning' ? 'text-yellow-800' :
                      statusInfo.variant === 'error' ? 'text-red-800' :
                      statusInfo.variant === 'info' ? 'text-blue-800' :
                      'text-green-800'
                    }`}>
                      {statusInfo.title}
                    </h4>
                    <p className={`text-sm mt-1 ${
                      statusInfo.variant === 'warning' ? 'text-yellow-700' :
                      statusInfo.variant === 'error' ? 'text-red-700' :
                      statusInfo.variant === 'info' ? 'text-blue-700' :
                      'text-green-700'
                    }`}>
                      {statusInfo.message}
                    </p>
                    {emailStatus.user && (
                      <div className="mt-2 text-xs bg-white/50 p-2 rounded">
                        <p><strong>Name:</strong> {emailStatus.user.name || 'Not set'}</p>
                        <p><strong>Email:</strong> {emailStatus.user.email}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>
                <Shield className="inline-block h-4 w-4 mr-2" />
                Role
              </Label>
              <RadioGroup
                value={role}
                onValueChange={(value: 'DOCTOR' | 'ADMIN') => setRole(value)}
                className="flex space-x-4"
                disabled={loading || emailStatus?.type === 'DOCTOR'}
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
                disabled={loading || emailStatus?.type === 'DOCTOR'}
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

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm()
                onOpenChange(false)
              }}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || emailStatus?.type === 'DOCTOR'}
              className={`w-full sm:w-auto ${
                emailStatus?.type === 'PATIENT' ? 'bg-yellow-600 hover:bg-yellow-700' :
                emailStatus?.type === 'DELETED_DOCTOR' ? 'bg-blue-600 hover:bg-blue-700' :
                ''
              }`}
            >
              {loading ? 'Processing...' : statusInfo?.action || 'Send Invitation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}