// /app/portal/family/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Users, 
  UserPlus, 
  Edit, 
  Trash2, 
  Calendar, 
  Phone, 
  Mail, 
  Loader2,
  User,
  ChevronLeft,
  AlertCircle
} from 'lucide-react'
import FamilyMemberDialog from '@/components/patient/family-member-dialog'

interface FamilyMember {
  id: string
  name: string
  email: string | null
  phone: string | null
  relationship: string
  age: number | null
  gender: string | null
  medicalNotes: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count?: {
    appointments: number
  }
}

export default function FamilyPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/portal/login')
    }
    
    if (status === 'authenticated') {
      fetchFamilyMembers()
    }
  }, [status, router])

  const fetchFamilyMembers = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/patient/family-members')
      
      if (!response.ok) {
        throw new Error('Failed to fetch family members')
      }
      
      const data = await response.json()
      setFamilyMembers(Array.isArray(data) ? data : [])
    } catch (error: any) {
      console.error('Error fetching family members:', error)
      setError(error.message || 'Failed to load family members')
    } finally {
      setLoading(false)
    }
  }

  const handleAddMember = () => {
    setEditingMember(null)
    setDialogOpen(true)
  }

  const handleEditMember = (member: FamilyMember) => {
    setEditingMember(member)
    setDialogOpen(true)
  }

  const handleDeleteMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this family member? This will also remove their future appointments.')) {
      return
    }

    try {
      setDeletingId(memberId)
      
      const response = await fetch(`/api/patient/family-members?id=${memberId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete family member')
      }

      await fetchFamilyMembers()
      alert('Family member removed successfully')
    } catch (error: any) {
      console.error('Error deleting family member:', error)
      alert(error.message || 'Failed to delete family member')
    } finally {
      setDeletingId(null)
    }
  }

  const getRelationshipColor = (relationship: string) => {
    switch (relationship) {
      case 'SPOUSE':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'CHILD':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'PARENT':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getRelationshipText = (relationship: string) => {
    switch (relationship) {
      case 'SPOUSE':
        return 'Spouse'
      case 'CHILD':
        return 'Child'
      case 'PARENT':
        return 'Parent'
      default:
        return 'Other'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="mt-2 text-gray-600">Loading family members...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Button
            variant="ghost"
            className="mb-2"
            onClick={() => router.push('/portal')}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Portal
          </Button>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Family Members</h1>
            <p className="text-gray-600 mt-2">
              Manage family members for booking appointments
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button 
            onClick={handleAddMember}
            disabled={familyMembers.length >= 3}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Add Family Member
          </Button>
          <Button 
            variant="outline"
            onClick={() => router.push('/book')}
          >
            <Calendar className="mr-2 h-4 w-4" />
            Book Appointment
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Members</p>
                <p className="text-2xl font-bold mt-1">{familyMembers.length}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Available Slots</p>
                <p className="text-2xl font-bold mt-1">{3 - familyMembers.length}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <User className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Spouses</p>
                <p className="text-2xl font-bold mt-1">
                  {familyMembers.filter(fm => fm.relationship === 'SPOUSE').length}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                <User className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Children</p>
                <p className="text-2xl font-bold mt-1">
                  {familyMembers.filter(fm => fm.relationship === 'CHILD').length}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                <User className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle>Family Members List</CardTitle>
          <CardDescription>
            You can add up to 3 family members. Click on a member to edit or remove.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {error ? (
            <div className="py-8 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchFamilyMembers}>Try Again</Button>
            </div>
          ) : familyMembers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No family members added yet</h3>
              <p className="text-gray-600 mb-6">Add family members to book appointments for them.</p>
              <Button onClick={handleAddMember}>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Your First Family Member
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name & Relationship</TableHead>
                    <TableHead>Contact Information</TableHead>
                    <TableHead>Age & Gender</TableHead>
                    <TableHead>Appointments</TableHead>
                    <TableHead>Added On</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {familyMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold">{member.name}</p>
                            <Badge 
                              variant="outline" 
                              className={`mt-1 text-xs ${getRelationshipColor(member.relationship)}`}
                            >
                              {getRelationshipText(member.relationship)}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {member.email && (
                            <div className="flex items-center text-sm">
                              <Mail className="h-3 w-3 mr-2 text-gray-500" />
                              <span>{member.email}</span>
                            </div>
                          )}
                          {member.phone && (
                            <div className="flex items-center text-sm">
                              <Phone className="h-3 w-3 mr-2 text-gray-500" />
                              <span>{member.phone}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {member.age && (
                            <span className="text-sm">{member.age} years</span>
                          )}
                          {member.gender && (
                            <Badge variant="outline" className="text-xs">
                              {member.gender}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/portal/appointments?family=${member.id}`)}
                        >
                          <Calendar className="mr-1 h-3 w-3" />
                          View Appointments
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {new Date(member.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditMember(member)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="error"
                            onClick={() => handleDeleteMember(member.id)}
                            disabled={deletingId === member.id}
                          >
                            {deletingId === member.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Trash2 className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Box */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="text-sm text-blue-700">
              <strong>Family Member Limits:</strong> You can add up to 3 family members. 
              This includes spouse, children, or parents.
            </p>
            <p className="text-sm text-blue-700">
              <strong>Booking for Family:</strong> When booking appointments, you can select 
              any family member from this list.
            </p>
            <p className="text-sm text-blue-700">
              <strong>Medical Information:</strong> Add medical notes for each family member 
              to help doctors provide better care.
            </p>
          </div>
        </div>
      </div>

      {/* Family Member Dialog */}
      <FamilyMemberDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        member={editingMember}
        onSuccess={fetchFamilyMembers}
        existingMembersCount={familyMembers.length}
      />
    </div>
  )
}