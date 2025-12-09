// app/auth/magic/page.tsx
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
        // Verify magic link
        const response = await fetch(`/api/auth/magic?token=${token}&email=${encodeURIComponent(email)}`)
        
        if (response.ok) {
          // Create session using NextAuth
          await signIn('credentials', {
            email,
            callbackUrl: '/portal',
            redirect: true
          })
        } else {
          router.push('/portal/login?error=invalid_link')
        }
      } catch (error) {
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