// app/test/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestPage() {
  const [calendarTest, setCalendarTest] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testGoogleCalendar = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test/google-calendar')
      const data = await response.json()
      setCalendarTest(data)
    } catch (error) {
      setCalendarTest({ error: error.toString() })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Auto-test on page load
    testGoogleCalendar()
  }, [])

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">System Diagnostics</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Google Calendar Status</CardTitle>
            <CardDescription>Test connection to Google Calendar API</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testGoogleCalendar} disabled={loading}>
              {loading ? 'Testing...' : 'Test Google Calendar'}
            </Button>
            
            {calendarTest && (
              <div className={`p-4 rounded ${calendarTest.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <h3 className="font-semibold mb-2">Results:</h3>
                <pre className="text-sm whitespace-pre-wrap bg-gray-50 p-3 rounded">
                  {JSON.stringify(calendarTest, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li>
                <a href="/book" className="text-blue-600 hover:underline font-medium">
                  ↗️ Booking Page
                </a>
              </li>
              <li>
                <a href="/api/test/google-calendar" target="_blank" className="text-blue-600 hover:underline font-medium">
                  ↗️ Google Calendar API Test
                </a>
              </li>
              <li>
                <a href="/api/appointments/availability?date=2025-12-15" target="_blank" className="text-blue-600 hover:underline font-medium">
                  ↗️ Availability API
                </a>
              </li>
              <li>
                <a href="https://console.cloud.google.com/apis/credentials" target="_blank" className="text-blue-600 hover:underline font-medium">
                  ↗️ Google Cloud Console
                </a>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Permanent Meeting Room Setup</CardTitle>
            <CardDescription>Recommended for reliable meetings</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal pl-5 space-y-2 text-sm">
              <li>Go to <a href="https://meet.google.com" target="_blank" className="text-blue-600">Google Meet</a></li>
              <li>Click "New meeting" → "Create a meeting for later"</li>
              <li>Copy the meeting link (looks like: https://meet.google.com/abc-defg-hij)</li>
              <li>Add to <code className="bg-gray-100 px-1">.env.local</code>:</li>
            </ol>
            <pre className="mt-3 p-3 bg-gray-900 text-gray-100 rounded text-sm">
{`DOCTOR_PERMANENT_MEET_LINK=https://meet.google.com/your-code-here
DOCTOR_PERMANENT_MEET_CODE=your-code-here`}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}