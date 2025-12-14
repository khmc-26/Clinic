// app/auth/magic/page.tsx - UPDATED
'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function MagicLinkPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const email = searchParams.get('email')

  useEffect(() => {
  const handleMagicLink = async () => {
    if (!token || !email) {
      router.push('/portal/login?error=invalid_link')
      return
    }

    try {
      // Verify magic link using POST
      const response = await fetch('/api/auth/magic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email })
      })
      
      if (response.ok) {
        const data = await response.json()
        
        if (data.success) {
          // Sign in with credentials (no password for magic link)
          const result = await signIn('credentials', {
            email: data.email,
            redirect: false, // Don't redirect automatically
            callbackUrl: data.isDoctor ? '/dashboard' : '/portal'
          })
          
          if (result?.error) {
            router.push('/portal/login?error=auth_failed')
          } else if (result?.url) {
            router.push(result.url)
          } else {
            router.push(data.isDoctor ? '/dashboard' : '/portal')
          }
        } else {
          router.push('/portal/login?error=invalid_link')
        }
      } else {
        router.push('/portal/login?error=invalid_link')
      }
    } catch (error) {
      console.error('Magic link error:', error)
      router.push('/portal/login?error=verification_failed')
    }
  }

  handleMagicLink()
}, [token, email, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Verifying Magic Link</CardTitle>
          <CardDescription>
            Please wait while we verify your magic link...
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        </CardContent>
      </Card>
    </div>
  )
}