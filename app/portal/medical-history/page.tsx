// /app/portal/medical-history/page.tsx - UPDATED VERSION
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Calendar, 
  History, 
  Filter, 
  Search,
  FileText,
  AlertCircle,
  Clock,
  User
} from 'lucide-react'
import TimelineView from './components/timeline-view'
import TimelineFilters from './components/timeline-filters'
import { MedicalEvent, EventType } from './types'

export default function MedicalHistoryPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState<MedicalEvent[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'timeline' | 'list'>('timeline')
  const [filters, setFilters] = useState<{
    eventTypes: EventType[];
    dateRange?: { start: Date; end: Date };
    doctorId?: string;
  }>({
    eventTypes: [],
    dateRange: undefined
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/portal/login')
    } else if (status === 'authenticated') {
      fetchMedicalEvents()
    }
  }, [status, router])

  const fetchMedicalEvents = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/patient/medical-events')
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.events) {
          // Transform the API data to match our MedicalEvent type
          const formattedEvents: MedicalEvent[] = data.events.map((event: any) => ({
            id: event.id,
            patientId: event.patientId,
            doctorId: event.doctorId,
            eventType: event.eventType as EventType,
            title: event.title,
            description: event.description,
            metadata: event.metadata || {},
            createdAt: new Date(event.createdAt),
            doctor: event.doctor ? {
              id: event.doctor.id,
              user: event.doctor.user
            } : undefined
          }))
          setEvents(formattedEvents)
        }
      }
    } catch (error) {
      console.error('Error fetching medical events:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredEvents = events.filter(event => {
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        event.title.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query) ||
        event.eventType.toLowerCase().includes(query)
      )
    }

    // Apply type filters
    if (filters.eventTypes.length > 0 && !filters.eventTypes.includes(event.eventType)) {
      return false
    }

    // Apply date range filter
    if (filters.dateRange) {
      const eventDate = new Date(event.createdAt)
      return eventDate >= filters.dateRange.start && eventDate <= filters.dateRange.end
    }

    return true
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading medical history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <History className="h-8 w-8" />
          Medical History
        </h1>
        <p className="text-gray-600">
          View your complete medical timeline (Read-only)
        </p>
      </div>

      {/* Information Banner */}
      <Card className="mb-6 border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-blue-800">Read-Only Medical History</p>
              <p className="text-sm text-blue-700 mt-1">
                Your medical history is automatically created from doctor appointments and notes. 
                Only doctors can add or modify medical events to ensure accuracy and compliance.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controls Bar */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search medical events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <TimelineFilters
                filters={filters}
                onFilterChange={(newFilters) => setFilters(newFilters)}
              />
              
              <Tabs value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
                <TabsList>
                  <TabsTrigger value="timeline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Timeline
                  </TabsTrigger>
                  <TabsTrigger value="list">
                    <FileText className="h-4 w-4 mr-2" />
                    List
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{events.length}</p>
              <p className="text-sm text-gray-600">Total Events</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">
                {events.filter(e => e.eventType === 'APPOINTMENT').length}
              </p>
              <p className="text-sm text-gray-600">Appointments</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">
                {events.filter(e => e.eventType === 'DIAGNOSIS').length}
              </p>
              <p className="text-sm text-gray-600">Diagnoses</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">
                {new Set(events.map(e => e.doctor?.user?.name).filter(Boolean)).size}
              </p>
              <p className="text-sm text-gray-600">Doctors</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <TimelineView
        events={filteredEvents}
        filters={filters}
        loading={loading}
        onEventClick={(event) => {
          console.log('Event clicked:', event)
          // Show event details modal (read-only)
        }}
      />

      {/* Empty State */}
      {!loading && events.length === 0 && (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <History className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No medical history yet
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Your medical timeline will appear here after your appointments.
              Medical events are automatically created by doctors during consultations.
            </p>
            <div className="space-x-3">
              <Button onClick={() => router.push('/book')}>
                <Calendar className="h-4 w-4 mr-2" />
                Book Your First Appointment
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Footer Note */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>
          <Clock className="inline h-4 w-4 mr-1" />
          Events are automatically synced after each appointment
        </p>
        <p className="mt-1">
          <User className="inline h-4 w-4 mr-1" />
          For corrections or additions, please contact your doctor
        </p>
      </div>
    </div>
  )
}