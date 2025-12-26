'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Bell, Mail, Smartphone, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button' // ADD THIS IMPORT

export default function NotificationPreferences() {
  const [emailNotifications, setEmailNotifications] = useState({
    appointmentReminders: true,
    appointmentStatus: true,
    mergeRequests: true,
    prescriptionRefills: true,
    medicalUpdates: false,
    systemUpdates: true
  })

  const [smsNotifications, setSmsNotifications] = useState({
    appointmentReminders: false,
    urgentUpdates: true
  })

  const [preferences, setPreferences] = useState({
    reminderTime: '24',
    dailyDigest: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00'
  })

  const handleEmailToggle = (key: keyof typeof emailNotifications) => {
    setEmailNotifications(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSmsToggle = (key: keyof typeof smsNotifications) => {
    setSmsNotifications(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handlePreferenceChange = (key: string, value: string | boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Notifications
          </CardTitle>
          <CardDescription>
            Control what emails you receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Appointment Reminders</Label>
              <p className="text-sm text-gray-500">24 hours & 1 hour before appointments</p>
            </div>
            <Switch
              checked={emailNotifications.appointmentReminders}
              onCheckedChange={() => handleEmailToggle('appointmentReminders')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Appointment Status Changes</Label>
              <p className="text-sm text-gray-500">When appointments are confirmed, completed, or cancelled</p>
            </div>
            <Switch
              checked={emailNotifications.appointmentStatus}
              onCheckedChange={() => handleEmailToggle('appointmentStatus')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Merge Request Notifications</Label>
              <p className="text-sm text-gray-500">When appointments need merge resolution</p>
            </div>
            <Switch
              checked={emailNotifications.mergeRequests}
              onCheckedChange={() => handleEmailToggle('mergeRequests')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Prescription Refill Alerts</Label>
              <p className="text-sm text-gray-500">When medications need refilling</p>
            </div>
            <Switch
              checked={emailNotifications.prescriptionRefills}
              onCheckedChange={() => handleEmailToggle('prescriptionRefills')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Medical History Updates</Label>
              <p className="text-sm text-gray-500">When doctors add notes or diagnoses</p>
            </div>
            <Switch
              checked={emailNotifications.medicalUpdates}
              onCheckedChange={() => handleEmailToggle('medicalUpdates')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>System Updates</Label>
              <p className="text-sm text-gray-500">Important announcements and maintenance notices</p>
            </div>
            <Switch
              checked={emailNotifications.systemUpdates}
              onCheckedChange={() => handleEmailToggle('systemUpdates')}
            />
          </div>
        </CardContent>
      </Card>

      {/* SMS Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            SMS Notifications
          </CardTitle>
          <CardDescription>
            Receive text message alerts (if phone number is verified)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Appointment Reminders</Label>
              <p className="text-sm text-gray-500">Text message 2 hours before appointments</p>
            </div>
            <Switch
              checked={smsNotifications.appointmentReminders}
              onCheckedChange={() => handleSmsToggle('appointmentReminders')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Urgent Updates Only</Label>
              <p className="text-sm text-gray-500">Critical alerts like appointment cancellations</p>
            </div>
            <Switch
              checked={smsNotifications.urgentUpdates}
              onCheckedChange={() => handleSmsToggle('urgentUpdates')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Preferences
          </CardTitle>
          <CardDescription>
            Customize how and when you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reminderTime">Reminder Time</Label>
            <Select
              value={preferences.reminderTime}
              onValueChange={(value) => handlePreferenceChange('reminderTime', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select reminder time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 hour before</SelectItem>
                <SelectItem value="2">2 hours before</SelectItem>
                <SelectItem value="4">4 hours before</SelectItem>
                <SelectItem value="24">24 hours before</SelectItem>
                <SelectItem value="48">2 days before</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Daily Digest Email</Label>
              <p className="text-sm text-gray-500">Receive one email with all daily updates</p>
            </div>
            <Switch
              checked={preferences.dailyDigest}
              onCheckedChange={(checked) => handlePreferenceChange('dailyDigest', checked)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quietHoursStart">Quiet Hours Start</Label>
              <Select
                value={preferences.quietHoursStart}
                onValueChange={(value) => handlePreferenceChange('quietHoursStart', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }, (_, i) => {
                    const hour = i.toString().padStart(2, '0')
                    return `${hour}:00`
                  }).map(time => (
                    <SelectItem key={time} value={time}>{time}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quietHoursEnd">Quiet Hours End</Label>
              <Select
                value={preferences.quietHoursEnd}
                onValueChange={(value) => handlePreferenceChange('quietHoursEnd', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }, (_, i) => {
                    const hour = i.toString().padStart(2, '0')
                    return `${hour}:00`
                  }).map(time => (
                    <SelectItem key={time} value={time}>{time}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button>Save Notification Settings</Button>
      </div>
    </div>
  )
}