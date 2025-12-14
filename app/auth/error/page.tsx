// app/auth/error/page.tsx - UPDATED
'use client'

import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Home, Mail, Lock } from 'lucide-react'
import Link from 'next/link'

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  
  const errorMessages: Record<string, { title: string; description: string; action?: string }> = {
    'OAuthAccountNotLinked': {
      title: 'Account Not Linked',
      description: 'This Google account is not linked to your patient account. If you already have an account, please sign in with your email and password first.',
      action: 'Try magic link instead'
    },
    'doctor_access_required': {
      title: 'Doctor Access Required',
      description: 'Doctor access is required for this page. Please use the doctor login page.'
    },
    'invalid_credentials': {
      title: 'Invalid Credentials',
      description: 'Invalid email or password. Please try again.'
    },
    'google_auth_failed': {
      title: 'Google Authentication Failed',
      description: 'Google authentication failed. Please try again or use another method.'
    },
    'expired_link': {
      title: 'Link Expired',
      description: 'Magic link has expired. Please request a new one.'
    },
    'invalid_link': {
      title: 'Invalid Link',
      description: 'Invalid magic link. Please request a new one.'
    },
    'default': {
      title: 'Authentication Error',
      description: 'An authentication error occurred. Please try again or contact support if the problem persists.'
    }
  }

  const errorInfo = errorMessages[error || ''] || errorMessages.default

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle>{errorInfo.title}</CardTitle>
          <CardDescription>
            {errorInfo.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error === 'OAuthAccountNotLinked' && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700 mb-3">
                This usually happens when:
              </p>
              <ul className="text-sm text-blue-700 space-y-1 list-disc pl-5">
                <li>You already have an account with this email</li>
                <li>You previously signed up with a different method</li>
                <li>Your Google account is not linked to your patient account</li>
              </ul>
            </div>
          )}
          
          <div className="flex flex-col gap-3">
            <Button asChild variant="outline">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Go to Homepage
              </Link>
            </Button>
            
            {error === 'OAuthAccountNotLinked' && errorInfo.action && (
              <Button asChild>
                <Link href="/portal/login">
                  <Mail className="mr-2 h-4 w-4" />
                  {errorInfo.action}
                </Link>
              </Button>
            )}
            
            <Button asChild>
              <Link href="/portal/login">
                <Lock className="mr-2 h-4 w-4" />
                Go to Patient Login
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}