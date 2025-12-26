// /app/portal/settings/page.tsx - FIXED VERSION
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Bell, Shield, Lock, ArrowLeft } from 'lucide-react'
import ProfileControls from './tabs/profile'
import NotificationControls from './tabs/notifications'
import SecurityControls from './tabs/security'
import PrivacyControls from './tabs/privacy'

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('profile')
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/portal/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    )
  }

  const handleExportData = async () => {
    setIsExporting(true)
    try {
      const response = await fetch('/api/patient/export-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ format: 'JSON' })
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.downloadUrl) {
          // Create a temporary link to download the file
          const link = document.createElement('a')
          link.href = data.downloadUrl
          link.download = data.filename || 'medical-records.json'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(data.downloadUrl)
        }
      } else {
        alert('Failed to export data. Please try again.')
      }
    } catch (error) {
      console.error('Export error:', error)
      alert('Failed to export data. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/portal')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Portal
        </Button>
        
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-gray-600">
          Manage your account preferences, security, and privacy settings
        </p>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-1">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'profile'
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'notifications'
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Bell className="h-4 w-4" />
                    <span>Notifications</span>
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveTab('security')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'security'
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Shield className="h-4 w-4" />
                    <span>Security</span>
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveTab('privacy')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'privacy'
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Lock className="h-4 w-4" />
                    <span>Privacy</span>
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>
          
          {/* Quick Actions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleExportData}
                disabled={isExporting}
              >
                {isExporting ? 'Exporting...' : 'Export All Data'}
              </Button>
              <Button variant="ghost" className="w-full text-gray-600">
                View Privacy Policy
              </Button>
              <Button variant="ghost" className="w-full text-gray-600">
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="pt-6">
              {activeTab === 'profile' && <ProfileControls />}
              {activeTab === 'notifications' && <NotificationControls />}
              {activeTab === 'security' && <SecurityControls />}
              {activeTab === 'privacy' && <PrivacyControls onExportData={handleExportData} />}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}