// app/auth/error/page.tsx
'use client'

import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Home } from 'lucide-react'
import Link from 'next/link'

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  
  const errorMessages: Record<string, string> = {
    'doctor_access_required': 'Doctor access is required for this page',
    'invalid_credentials': 'Invalid email or password',
    'google_auth_failed': 'Google authentication failed',
    'expired_link': 'Magic link has expired',
    'invalid_link': 'Invalid magic link',
    'default': 'An authentication error occurred'
  }

  const errorMessage = errorMessages[error || ''] || errorMessages.default

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle>Authentication Error</CardTitle>
          <CardDescription>
            {errorMessage}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-gray-600">
              Please try again or contact support if the problem persists.
            </p>
          </div>
          
          <div className="flex flex-col gap-3">
            <Button asChild variant="outline">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Go to Homepage
              </Link>
            </Button>
            
            <Button asChild>
              <Link href="/portal/login">
                Go to Patient Login
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}