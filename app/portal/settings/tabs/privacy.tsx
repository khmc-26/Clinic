// /app/portal/settings/tabs/privacy.tsx - UPDATED VERSION (NO EXPORT)
'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Lock, 
  Users, 
  Trash2, 
  AlertTriangle,
  FileText,
  Shield,
  Bell,
  Database,
  Download
} from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export default function PrivacyControls() {
  const [privacySettings, setPrivacySettings] = useState({
    shareWithFamily: true,
    allowDoctorFullAccess: true,
    anonymizedResearch: false,
    marketingCommunications: false,
    showProfileToOthers: false,
    allowDoctorReviews: true,
    shareWithResearchInstitutions: false
  })

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteReason, setDeleteReason] = useState('')

  const handleToggle = (key: keyof typeof privacySettings) => {
    setPrivacySettings(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleDeleteAccount = () => {
    if (!deleteReason.trim()) {
      alert('Please provide a reason for deleting your account')
      return
    }
    
    // Implement account deletion API call here
    console.log('Deleting account with reason:', deleteReason)
    setShowDeleteDialog(false)
    alert('Account deletion request submitted. You will receive an email confirmation.')
  }

  const privacyOptions = [
    {
      key: 'shareWithFamily',
      label: 'Share with Family Members',
      description: 'Allow family members you manage to view your medical information',
      icon: Users
    },
    {
      key: 'allowDoctorFullAccess',
      label: 'Allow Full Doctor Access',
      description: 'Allow doctors to view your complete medical history during consultations',
      icon: Shield
    },
    {
      key: 'showProfileToOthers',
      label: 'Show Profile to Other Patients',
      description: 'Allow other patients to see your public profile (anonymous)',
      icon: Lock,
      warning: true
    },
    {
      key: 'allowDoctorReviews',
      label: 'Allow Doctor Reviews',
      description: 'Allow doctors to leave reviews about your treatment progress',
      icon: FileText
    },
    {
      key: 'anonymizedResearch',
      label: 'Anonymized Research Participation',
      description: 'Allow your anonymized data to be used for medical research',
      icon: Database,
      warning: true
    },
    {
      key: 'marketingCommunications',
      label: 'Marketing Communications',
      description: 'Receive promotional emails and updates from the clinic',
      icon: Bell
    },
    {
      key: 'shareWithResearchInstitutions',
      label: 'Share with Research Institutions',
      description: 'Allow approved research institutions to access anonymized data',
      icon: Database,
      warning: true
    }
  ]

  return (
    <div className="space-y-6">
      {/* Data Sharing Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Data Sharing Preferences
          </CardTitle>
          <CardDescription>
            Control how your medical data is shared with doctors, family members, and researchers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {privacyOptions.map((option) => {
            const Icon = option.icon
            return (
              <div key={option.key} className="flex items-center justify-between">
                <div className="flex items-start space-x-3">
                  <div className={`mt-1 ${option.warning ? 'text-amber-600' : 'text-gray-600'}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor={option.key} className="font-medium">
                        {option.label}
                      </Label>
                      {option.warning && (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                          <AlertTriangle className="h-3 w-3" />
                          Warning
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {option.description}
                    </p>
                  </div>
                </div>
                <Switch
                  id={option.key}
                  checked={privacySettings[option.key as keyof typeof privacySettings]}
                  onCheckedChange={() => handleToggle(option.key as keyof typeof privacySettings)}
                />
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Data Export (REMOVED - Coming Soon) */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <Download className="h-5 w-5" />
            Data Export (Coming Soon)
          </CardTitle>
          <CardDescription className="text-blue-600">
            Export functionality will be available in a future update
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">What's Coming:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Export medical records in PDF format</li>
                <li>• Download appointment history</li>
                <li>• Share records with other healthcare providers</li>
                <li>• Generate comprehensive health reports</li>
              </ul>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-blue-600">
                <strong>Note:</strong> For immediate record access needs, please contact the clinic directly.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Deletion */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <Trash2 className="h-5 w-5" />
            Delete Account
          </CardTitle>
          <CardDescription className="text-red-600">
            Permanently delete your account and all associated data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg border border-red-200">
              <h4 className="font-medium text-red-700 mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Warning: This action cannot be undone
              </h4>
              <p className="text-sm text-gray-700 mb-3">
                Deleting your account will:
              </p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Permanently delete all your medical records</li>
                <li>• Cancel all upcoming appointments</li>
                <li>• Remove access for family members</li>
                <li>• Delete your profile and personal information</li>
                <li>• Cannot be recovered once completed</li>
              </ul>
            </div>
            
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full border-red-300 text-red-700 hover:bg-red-100 hover:text-red-800"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete My Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-red-700">
                    Are you absolutely sure?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your account
                    and remove all your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="delete-reason" className="text-red-700">
                      Reason for deletion (required)
                    </Label>
                    <Textarea
                      id="delete-reason"
                      placeholder="Please tell us why you're deleting your account..."
                      value={deleteReason}
                      onChange={(e) => setDeleteReason(e.target.value)}
                      className="mt-1 min-h-[100px] border-red-300"
                    />
                  </div>
                  
                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <p className="text-sm text-amber-800">
                      <strong>Important:</strong> Your account will be deactivated immediately, 
                      but we retain the right to keep anonymized medical data for legal 
                      and research purposes as required by healthcare regulations.
                    </p>
                  </div>
                </div>
                
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-red-600 text-white hover:bg-red-700"
                    disabled={!deleteReason.trim()}
                  >
                    Yes, delete my account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            <p className="text-xs text-gray-500 text-center">
              Account deletion requests require 30 days for complete processing
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Rights */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <Shield className="h-5 w-5" />
            Your Privacy Rights
          </CardTitle>
          <CardDescription className="text-blue-600">
            Understand your rights under healthcare privacy laws
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-white rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-1">Right to Access</h4>
              <p className="text-sm text-gray-700">
                You have the right to access and obtain a copy of your health information.
              </p>
            </div>
            
            <div className="p-3 bg-white rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-1">Right to Correct</h4>
              <p className="text-sm text-gray-700">
                You may request corrections to inaccurate or incomplete health information.
              </p>
            </div>
            
            <div className="p-3 bg-white rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-1">Right to Restrict</h4>
              <p className="text-sm text-gray-700">
                You can request restrictions on certain uses and disclosures of your information.
              </p>
            </div>
            
            <Button variant="outline" className="w-full border-blue-300 text-blue-700">
              <FileText className="mr-2 h-4 w-4" />
              View Complete Privacy Policy
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}