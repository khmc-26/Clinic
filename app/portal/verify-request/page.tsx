// app/portal/verify-request/page.tsx
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Home, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useSearchParams } from 'next/navigation'

export default function VerifyRequestPage() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
            <Mail className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            A sign in link has been sent to your email address
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-gray-600">
              We've sent a magic link to{' '}
              <strong>{email || 'your email address'}</strong>.
            </p>
            <p className="text-gray-600 mt-2">
              Click the link in the email to sign in to your account.
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-start p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex-shrink-0">
                <span className="text-blue-600">📧</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>Can't find the email?</strong> Check your spam folder or try again.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            <Button asChild variant="outline">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Go to Homepage
              </Link>
            </Button>
            
            <Button asChild>
              <Link href="/portal">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Another Email
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}