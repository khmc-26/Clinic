'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { 
  Lock, 
  Smartphone, 
  Shield, 
  LogOut, 
  CheckCircle,
  XCircle,
  Globe,
  Clock
} from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function SecuritySettings() {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [loading, setLoading] = useState(false)

  const devices = [
    { id: 1, device: 'Chrome on Windows', location: 'Kerala, India', lastActive: '2 hours ago', current: true },
    { id: 2, device: 'Safari on iPhone', location: 'Kerala, India', lastActive: '1 day ago', current: false },
    { id: 3, device: 'Firefox on Mac', location: 'Bangalore, India', lastActive: '1 week ago', current: false }
  ]

  const loginHistory = [
    { id: 1, date: 'Today, 10:30 AM', device: 'Chrome on Windows', location: 'Kerala, India', status: 'success' },
    { id: 2, date: 'Yesterday, 2:15 PM', device: 'Safari on iPhone', location: 'Kerala, India', status: 'success' },
    { id: 3, date: 'Dec 20, 9:45 AM', device: 'Chrome on Windows', location: 'Kerala, India', status: 'success' },
    { id: 4, date: 'Dec 19, 11:20 PM', device: 'Unknown Device', location: 'Mumbai, India', status: 'failed' }
  ]

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordForm(prev => ({ ...prev, [field]: value }))
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match!')
      setLoading(false)
      return
    }
    
    try {
      // Implement password change API call here
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      alert('Password changed successfully!')
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      console.error('Error changing password:', error)
      alert('Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOutAll = () => {
    if (confirm('Are you sure you want to sign out from all devices?')) {
      // Implement sign out all API call here
      alert('Signed out from all devices')
    }
  }

  return (
    <div className="space-y-6">
      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Change Password
          </CardTitle>
          <CardDescription>
            Update your password regularly for better security
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                placeholder="Enter current password"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                  placeholder="Enter new password"
                  required
                  minLength={8}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                  placeholder="Confirm new password"
                  required
                />
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" disabled={loading}>
                {loading ? 'Changing Password...' : 'Change Password'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable 2FA</Label>
              <p className="text-sm text-gray-500">
                Requires authentication code from your phone when logging in
              </p>
            </div>
            <Switch
              checked={twoFactorEnabled}
              onCheckedChange={setTwoFactorEnabled}
            />
          </div>

          {twoFactorEnabled && (
            <div className="p-4 border rounded-lg bg-blue-50">
              <h4 className="font-semibold text-blue-800 mb-2">Setup Instructions</h4>
              <ol className="text-sm text-blue-700 space-y-2 list-decimal pl-4">
                <li>Download Google Authenticator or Authy on your phone</li>
                <li>Scan the QR code with the app</li>
                <li>Enter the 6-digit code shown in the app</li>
                <li>Save your recovery codes in a safe place</li>
              </ol>
              <div className="mt-4 flex space-x-3">
                <Button size="sm">Show QR Code</Button>
                <Button variant="outline" size="sm">View Recovery Codes</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Connected Devices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Connected Devices
          </CardTitle>
          <CardDescription>
            Devices that are currently logged into your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {devices.map((device) => (
              <div key={device.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <Globe className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <div className="font-medium">{device.device}</div>
                    <div className="text-sm text-gray-600">
                      {device.location} • Last active {device.lastActive}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {device.current && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Current Device
                    </Badge>
                  )}
                  {!device.current && (
                    <Button variant="ghost" size="sm">Sign Out</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t">
            <Button variant="outline" onClick={handleSignOutAll}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out From All Devices
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Login History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Login History
          </CardTitle>
          <CardDescription>
            Recent login attempts on your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loginHistory.map((login) => (
                  <TableRow key={login.id}>
                    <TableCell>{login.date}</TableCell>
                    <TableCell>{login.device}</TableCell>
                    <TableCell>{login.location}</TableCell>
                    <TableCell>
                      {login.status === 'success' ? (
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          <span>Success</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-red-600">
                          <XCircle className="h-4 w-4 mr-1" />
                          <span>Failed</span>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <div className="mt-4 text-center">
            <Button variant="ghost" size="sm">View All History</Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Security Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium">Use a strong password</p>
              <p className="text-sm text-gray-600">
                Combine letters, numbers, and special characters. Avoid using personal information.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium">Enable two-factor authentication</p>
              <p className="text-sm text-gray-600">
                Adds an extra layer of security to prevent unauthorized access.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium">Review login history regularly</p>
              <p className="text-sm text-gray-600">
                Check for any suspicious login attempts from unknown locations.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}