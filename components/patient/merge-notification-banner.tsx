// /components/patient/merge-notification-banner.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { AlertCircle, X } from 'lucide-react'

export default function MergeNotificationBanner() {
  const [mergeCount, setMergeCount] = useState(0)
  const [visible, setVisible] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchMergeCount = async () => {
      try {
        const response = await fetch('/api/appointments/merge/count')
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setMergeCount(data.count)
          }
        }
      } catch (error) {
        console.error('Error fetching merge count:', error)
      }
    }

    fetchMergeCount()
  }, [])

  if (mergeCount === 0 || !visible) {
    return null
  }

  return (
    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6">
      <div className="flex items-start">
        <AlertCircle className="h-5 w-5 text-amber-600 mr-3 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-amber-800">
                {mergeCount} appointment{mergeCount > 1 ? 's need' : ' needs'} merge resolution
              </h3>
              <div className="mt-1 text-sm text-amber-700">
                <p>
                  Some appointments have conflicting information. Please review and resolve them 
                  to prevent duplicate records.
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setVisible(false)}
              className="text-amber-600 hover:text-amber-800 hover:bg-amber-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-3 flex space-x-3">
            <Button
              size="sm"
              variant="outline"
              className="bg-white text-amber-700 border-amber-300 hover:bg-amber-50"
              onClick={() => router.push('/portal/merge')}
            >
              Resolve Now
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-amber-600 hover:text-amber-800"
              onClick={() => setVisible(false)}
            >
              Remind me later
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}