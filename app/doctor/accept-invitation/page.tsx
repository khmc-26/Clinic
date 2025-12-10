// app/doctor/accept-invitation/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, XCircle, Shield, User } from 'lucide-react'

export default function AcceptInvitationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  const [loading, setLoading] = useState(true)
  const [validating, setValidating] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [invitation, setInvitation] = useState<any>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    confirmPassword: ''
  })

  useEffect(() => {
    validateInvitation()
  }, [token])

  const validateInvitation = async () => {
    if (!token) {
      setError('Invalid invitation link. No token provided.')
      setLoading(false)
      return
    }

    setValidating(true)
    try {
      const response = await fetch(`/api/doctors/invitation/validate?token=${token}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Invalid invitation')
      }

      if (!data.valid) {
        if (data.status === 'EXPIRED') {
          setError('This invitation link has expired. Please request a new invitation.')
        } else if (data.status === 'ACCEPTED') {
          setError('This invitation has already been accepted.')
        } else {
          setError('Invalid invitation link.')
        }
        setInvitation(null)
      } else {
        setInvitation(data.invitation)
        setError('')
      }
    } catch (error: any) {
      setError(error.message || 'Failed to validate invitation')
      setInvitation(null)
    } finally {
      setLoading(false)
      setValidating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    // Validate password strength
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/doctors/invitation/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          name: formData.name,
          password: formData.password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to accept invitation')
      }

      setSuccess(true)
      
      // Redirect to doctor login after 3 seconds
      setTimeout(() => {
        router.push('/doctor/login?message=invitation_accepted')
      }, 3000)

    } catch (error: any) {
      setError(error.message || 'Failed to accept invitation')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
              <p className="mt-4 text-gray-600">Validating your invitation...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
              <h2 className="text-2xl font-bold mt-4">Account Created Successfully!</h2>
              <p className="text-gray-600 mt-2">
                Your doctor account has been created. You will be redirected to login shortly.
              </p>
              <div className="mt-6">
                <Link href="/doctor/login">
                  <Button>
                    Go to Login
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl mt-4">Doctor Invitation</CardTitle>
          <CardDescription>
            {invitation 
              ? `You've been invited as ${invitation.role === 'ADMIN' ? 'an Admin Doctor' : 'a Doctor'}`
              : 'Complete your account setup'
            }
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && !validating && (
            <Alert variant="destructive" className="mb-4">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {validating ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="mt-2 text-gray-600">Checking invitation validity...</p>
            </div>
          ) : invitation ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Invitation Email</Label>
                <Input
                  id="email"
                  value={invitation.email}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">
                  <User className="inline-block h-4 w-4 mr-2" />
                  Your Full Name *
                </Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  disabled={submitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Create Password *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                  disabled={submitting}
                />
                <p className="text-xs text-gray-500">
                  Must include uppercase, lowercase, number, and special character
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  required
                  disabled={submitting}
                />
              </div>

              <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-2">Important Information</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• You'll be able to set your availability after login</li>
                  <li>• Consultation fee will be set by admin</li>
                  <li>• You can update your profile details later</li>
                  <li>• Invitation expires in 2 hours from sending</li>
                </ul>
              </div>
            </form>
          ) : (
            <div className="text-center py-8">
              <XCircle className="h-12 w-12 mx-auto text-red-500" />
              <h3 className="text-lg font-semibold mt-4">Invalid Invitation</h3>
              <p className="text-gray-600 mt-2">
                This invitation link is invalid, expired, or has already been used.
              </p>
              <p className="text-sm text-gray-500 mt-4">
                Please contact the clinic administrator for a new invitation.
              </p>
            </div>
          )}
        </CardContent>

        {invitation && (
          <CardFooter>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Doctor Account'
              )}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}