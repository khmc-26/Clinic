// /app/portal/settings/tabs/profile.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Shield,
  Save,
  Upload
} from 'lucide-react'

export default function ProfileControls() {
  const { data: session } = useSession()
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    emergencyContact: '',
    age: '',
    gender: '',
    bloodGroup: '',
    allergies: '',
    medicalHistory: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchProfileData()
  }, [])

  const fetchProfileData = async () => {
    try {
      const response = await fetch('/api/patient/profile')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.patient) {
          setProfileData({
            name: data.patient.name || session?.user?.name || '',
            email: session?.user?.email || '',
            phone: data.patient.phone || '',
            address: data.patient.address || '',
            emergencyContact: data.patient.emergencyContact || '',
            age: data.patient.age?.toString() || '',
            gender: data.patient.gender || '',
            bloodGroup: data.patient.bloodGroup || '',
            allergies: data.patient.allergies || '',
            medicalHistory: data.patient.medicalHistory || ''
          })
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const response = await fetch('/api/patient/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: profileData.phone,
          address: profileData.address,
          emergencyContact: profileData.emergencyContact,
          age: profileData.age ? parseInt(profileData.age) : null,
          gender: profileData.gender,
          bloodGroup: profileData.bloodGroup,
          allergies: profileData.allergies,
          medicalHistory: profileData.medicalHistory
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          alert('Profile updated successfully!')
        } else {
          alert(`Failed to update profile: ${data.error}`)
        }
      } else {
        const error = await response.json()
        alert(`Failed to update profile: ${error.error}`)
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Failed to update profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: keyof typeof profileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading profile...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
          <CardDescription>
            Update your personal details and contact information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={profileData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter your full name"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email Address</Label>
              <div className="flex items-center gap-2 mt-1">
                <Mail className="h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  value={profileData.email}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>
            
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <div className="flex items-center gap-2 mt-1">
                <Phone className="h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  value={profileData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="Enter your phone number"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={profileData.age}
                onChange={(e) => handleChange('age', e.target.value)}
                placeholder="Enter your age"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="gender">Gender</Label>
              <Input
                id="gender"
                value={profileData.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
                placeholder="Male/Female/Other"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="bloodGroup">Blood Group</Label>
              <Input
                id="bloodGroup"
                value={profileData.bloodGroup}
                onChange={(e) => handleChange('bloodGroup', e.target.value)}
                placeholder="e.g., O+"
                className="mt-1"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="address">Address</Label>
            <div className="flex items-start gap-2 mt-1">
              <MapPin className="h-4 w-4 text-gray-400 mt-3" />
              <Textarea
                id="address"
                value={profileData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Enter your complete address"
                rows={3}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="emergencyContact">Emergency Contact</Label>
            <Input
              id="emergencyContact"
              value={profileData.emergencyContact}
              onChange={(e) => handleChange('emergencyContact', e.target.value)}
              placeholder="Name and phone of emergency contact"
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Medical Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Medical Information
          </CardTitle>
          <CardDescription>
            Your medical details for better healthcare
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="allergies">Allergies</Label>
            <Textarea
              id="allergies"
              value={profileData.allergies}
              onChange={(e) => handleChange('allergies', e.target.value)}
              placeholder="List any allergies (e.g., Penicillin, Peanuts)"
              rows={2}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="medicalHistory">Medical History</Label>
            <Textarea
              id="medicalHistory"
              value={profileData.medicalHistory}
              onChange={(e) => handleChange('medicalHistory', e.target.value)}
              placeholder="Chronic conditions, past surgeries, family medical history"
              rows={4}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Read-only Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Account Information
          </CardTitle>
          <CardDescription>
            System information about your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-500">Patient ID</Label>
              <p className="font-medium">PT-{session?.user?.id?.slice(-8) || 'N/A'}</p>
            </div>
            
            <div>
              <Label className="text-gray-500">Account Type</Label>
              <p className="font-medium">Patient</p>
            </div>
            
            <div>
              <Label className="text-gray-500">Join Date</Label>
              <p className="font-medium">
                {new Date().toLocaleDateString()} {/* Replace with actual data if available */}
              </p>
            </div>
            
            <div>
              <Label className="text-gray-500">Status</Label>
              <p className="font-medium text-green-600">Active</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => fetchProfileData()}
        >
          Reset
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  )
}