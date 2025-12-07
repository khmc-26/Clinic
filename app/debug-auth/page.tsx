'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useEffect } from 'react'

export default function DebugAuthPage() {
  const { data: session, status } = useSession()

  useEffect(() => {
    console.log('🔐 Debug Auth - Status:', status)
    console.log('🔐 Debug Auth - Session:', session)
    console.log('🔐 Debug Auth - User role:', session?.user?.role)
  }, [session, status])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Authentication Debug</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Current Status</h3>
            <div className="bg-gray-100 p-4 rounded">
              <pre className="text-sm">
                Status: {status}
                {JSON.stringify(session, null, 2)}
              </pre>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">Test Login Methods</h3>
            
            <Button
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
              className="w-full"
            >
              Login with Google (Doctor)
            </Button>

            <Button
              onClick={() => signIn('google', { callbackUrl: '/portal' })}
              variant="outline"
              className="w-full"
            >
              Login with Google (Patient)
            </Button>

            <div className="pt-4">
              <h4 className="font-semibold mb-2">Test Email Login</h4>
              <form onSubmit={async (e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                const email = formData.get('email') as string
                
                const response = await fetch('/api/auth/magic-link', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email }),
                })
                
                const data = await response.json()
                alert(data.success ? 'Magic link sent!' : data.error)
              }}>
                <div className="flex gap-2">
                  <input
                    name="email"
                    type="email"
                    placeholder="Enter email"
                    className="flex-1 border rounded px-3 py-2"
                    defaultValue="drkavithahc@gmail.com"
                  />
                  <Button type="submit">Send Magic Link</Button>
                </div>
              </form>
            </div>
          </div>

          {session && (
            <div className="pt-4 border-t">
              <Button
                onClick={() => signOut({ callbackUrl: '/' })}
                variant="destructive"
              >
                Sign Out
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}