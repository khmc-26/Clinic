// app/doctor/login/page.tsx - UPDATED FOR SECURITY
'use client'

import { useState, useEffect } from 'react'
import { signIn, useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock, User, Eye, EyeOff, AlertCircle, LogOut } from 'lucide-react'

export default function DoctorLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { data: session } = useSession()

  useEffect(() => {
    // If already logged in as doctor, redirect to dashboard
    if (session?.user?.isDoctor) {
      router.push('/dashboard')
    }
  }, [session, router])

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError('')
    
    try {
      // Force a clean sign out first
      await signOut({ redirect: false })
      
      // Sign in with Google with EXPLICIT callbackUrl
      await signIn('google', {
        callbackUrl: '/dashboard',
        redirect: true
      })
    } catch (error) {
      console.error('Google login error:', error)
      setError('Failed to sign in with Google')
      setLoading(false)
    }
  }

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Basic validation
    if (!email || !password) {
      setError('Please enter both email and password')
      setLoading(false)
      return
    }

    try {
      const result = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
        callbackUrl: '/dashboard'
      })

      if (result?.error) {
        // Parse error messages for better UX
        if (result.error.includes('locked')) {
          setError('Account locked. Please try again in 15 minutes.')
        } else if (result.error.includes('restricted')) {
          setError('Only registered doctors can access this portal.')
        } else {
          setError('Invalid email or password')
        }
      } else if (result?.ok && result?.url) {
        router.push(result.url)
      } else {
        setError('Login failed. Please try again.')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut({ 
      callbackUrl: '/',
      redirect: true 
    })
  }

  // If already logged in as patient, show warning
  const isPatientSession = session?.user && !session.user.isDoctor && session.user.email !== 'drkavithahc@gmail.com'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle>Doctor Login</CardTitle>
          <CardDescription>
            Secure access to doctor dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isPatientSession && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-yellow-700">
                    You're signed in as a patient. Please sign out first to access doctor login.
                  </p>
                  <Button
                    onClick={handleSignOut}
                    variant="outline"
                    size="sm"
                    className="mt-2"
                  >
                    <LogOut className="mr-2 h-3 w-3" />
                    Sign Out Patient
                  </Button>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <Button
              onClick={handleGoogleLogin}
              disabled={loading || isPatientSession}
              className="w-full"
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign in with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or use password</span>
              </div>
            </div>

            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <Label htmlFor="doctor-email">Doctor Email</Label>
                <Input
                  id="doctor-email"
                  type="email"
                  placeholder="Enter registered doctor email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading || isPatientSession}
                  autoComplete="username"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <Label htmlFor="doctor-password">Password</Label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-xs text-gray-500 hover:text-gray-700"
                    disabled={loading || isPatientSession}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <Input
                  id="doctor-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading || isPatientSession}
                  autoComplete="current-password"
                />
              </div>

              <Button
                type="submit"
                disabled={loading || isPatientSession}
                className="w-full"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Sign in with Password
                  </>
                )}
              </Button>
            </form>
          </div>

          <div className="text-center text-sm text-gray-500 pt-4 border-t">
            <p className="mb-2">
              <span className="font-semibold">Note:</span> Only registered doctors can access this portal
            </p>
            <p>
              Patients: Please use the{' '}
              <a href="/portal/login" className="text-primary hover:underline">
                Patient Portal
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}