// /components/doctor/availability-editor.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Clock, Save, RotateCcw } from 'lucide-react'
import TimeRangePicker from '@/components/ui/time-range-picker'

interface DayAvailability {
  id?: string
  dayOfWeek: number
  name: string
  shortName: string
  isActive: boolean
  startTime: string
  endTime: string
  slotDuration: number
  maxPatients: number
}

interface AvailabilityEditorProps {
  doctorId?: string
  onSave?: () => void
}

const daysOfWeek = [
  { id: 0, name: 'Sunday', shortName: 'Sun' },
  { id: 1, name: 'Monday', shortName: 'Mon' },
  { id: 2, name: 'Tuesday', shortName: 'Tue' },
  { id: 3, name: 'Wednesday', shortName: 'Wed' },
  { id: 4, name: 'Thursday', shortName: 'Thu' },
  { id: 5, name: 'Friday', shortName: 'Fri' },
  { id: 6, name: 'Saturday', shortName: 'Sat' },
]

const slotDurationOptions = [
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '60 minutes' },
]

export default function AvailabilityEditor({ doctorId, onSave }: AvailabilityEditorProps) {
  const { data: session } = useSession()
  const [availability, setAvailability] = useState<DayAvailability[]>([])
  const [initialized, setInitialized] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load availability on mount
  useEffect(() => {
    const loadAvailabilityData = async () => {
      try {
        setLoading(true)
        
        if (doctorId) {
          await loadAvailability(doctorId)
        } else if (session?.user?.isDoctor) {
          await loadCurrentDoctorAvailability()
        } else {
          // If no doctor, show defaults but don't set as initialized
          const defaultAvailability = createDefaultAvailability()
          setAvailability(defaultAvailability)
        }
        
        setInitialized(true)
      } catch (error) {
        console.error('Error loading availability:', error)
        // Show defaults on error
        const defaultAvailability = createDefaultAvailability()
        setAvailability(defaultAvailability)
        setInitialized(true)
      } finally {
        setLoading(false)
      }
    }

    if (!initialized) {
      loadAvailabilityData()
    }
  }, [doctorId, session, initialized])

  const createDefaultAvailability = () => {
    return daysOfWeek.map(day => ({
      dayOfWeek: day.id,
      name: day.name,
      shortName: day.shortName,
      isActive: day.id !== 0, // Sunday inactive by default
      startTime: '09:00',
      endTime: '17:00',
      slotDuration: 30,
      maxPatients: 1
    }))
  }

  const loadCurrentDoctorAvailability = async () => {
    try {
      const response = await fetch('/api/doctors/me/availability')
      if (response.ok) {
        const data = await response.json()
        console.log('🔍 API Response:', data)
        
        if (data && data.length > 0) {
          // Sort data by dayOfWeek to ensure correct order
          const sortedData = [...data].sort((a, b) => a.dayOfWeek - b.dayOfWeek)
          console.log('🔍 Sorted data:', sortedData)
          
          // Merge with daysOfWeek structure
          const merged = daysOfWeek.map(day => {
            const existing = sortedData.find((d: any) => d.dayOfWeek === day.id)
            console.log(`🔍 Matching day ${day.id} (${day.name}):`, existing)
            
            if (existing) {
              return {
                id: existing.id,
                dayOfWeek: day.id,
                name: day.name,
                shortName: day.shortName,
                isActive: existing.isActive,
                startTime: existing.startTime,
                endTime: existing.endTime,
                slotDuration: existing.slotDuration,
                maxPatients: existing.maxPatients
              }
            } else {
              // No data for this day, use defaults
              return {
                dayOfWeek: day.id,
                name: day.name,
                shortName: day.shortName,
                isActive: day.id !== 0,
                startTime: '09:00',
                endTime: '17:00',
                slotDuration: 30,
                maxPatients: 1
              }
            }
          })
          
          console.log('🔍 Merged availability:', merged)
          setAvailability(merged)
        } else {
          // No data from API, use defaults
          console.log('🔍 No data from API, using defaults')
          const defaultAvailability = createDefaultAvailability()
          setAvailability(defaultAvailability)
        }
      } else {
        console.error('🔍 API Error status:', response.status)
        const defaultAvailability = createDefaultAvailability()
        setAvailability(defaultAvailability)
      }
    } catch (error) {
      console.error('🔍 Error loading availability:', error)
      const defaultAvailability = createDefaultAvailability()
      setAvailability(defaultAvailability)
    }
  }

  const loadAvailability = async (id: string) => {
    try {
      const response = await fetch(`/api/doctors/${id}/availability`)
      if (response.ok) {
        const data = await response.json()
        if (data && data.length > 0) {
          const sortedData = [...data].sort((a, b) => a.dayOfWeek - b.dayOfWeek)
          const merged = daysOfWeek.map(day => {
            const existing = sortedData.find((d: any) => d.dayOfWeek === day.id)
            return existing ? {
              id: existing.id,
              dayOfWeek: day.id,
              name: day.name,
              shortName: day.shortName,
              isActive: existing.isActive,
              startTime: existing.startTime,
              endTime: existing.endTime,
              slotDuration: existing.slotDuration,
              maxPatients: existing.maxPatients
            } : {
              dayOfWeek: day.id,
              name: day.name,
              shortName: day.shortName,
              isActive: day.id !== 0,
              startTime: '09:00',
              endTime: '17:00',
              slotDuration: 30,
              maxPatients: 1
            }
          })
          setAvailability(merged)
        }
      }
    } catch (error) {
      console.error('Error loading availability:', error)
    }
  }

  const updateDay = (dayId: number, updates: Partial<DayAvailability>) => {
    setAvailability(prev => 
      prev.map(day => day.dayOfWeek === dayId ? { ...day, ...updates } : day)
    )
  }

  const applyToAllWeekdays = () => {
    const firstActiveDay = availability.find(day => day.dayOfWeek !== 0 && day.isActive)
    if (!firstActiveDay) return
    
    setAvailability(prev => 
      prev.map(day => 
        day.dayOfWeek !== 0 // Apply to all weekdays (Mon-Sat)
          ? { 
              ...day, 
              isActive: firstActiveDay.isActive,
              startTime: firstActiveDay.startTime,
              endTime: firstActiveDay.endTime,
              slotDuration: firstActiveDay.slotDuration,
              maxPatients: firstActiveDay.maxPatients
            }
          : day
      )
    )
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      
      const targetDoctorId = doctorId || (await getCurrentDoctorId())
      if (!targetDoctorId) {
        setError('Doctor ID not found')
        return
      }
     
      console.log('Sending availability data:', JSON.stringify(availability, null, 2))

      const response = await fetch(`/api/doctors/${targetDoctorId}/availability`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availability })
      })

      const result = await response.json()
      
      if (!response.ok) {
        setError(result.error || 'Failed to save availability')
        return
      }

      if (onSave) onSave()
      alert('✅ Availability schedule saved successfully!')
    } catch (error) {
      console.error('Error saving availability:', error)
      setError('Failed to save availability')
    } finally {
      setSaving(false)
    }
  }

  const getCurrentDoctorId = async (): Promise<string | null> => {
    if (!session?.user?.email) return null
    try {
      const response = await fetch('/api/doctors/me')
      if (response.ok) {
        const doctor = await response.json()
        return doctor.id
      }
    } catch (error) {
      console.error('Error getting doctor ID:', error)
    }
    return null
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading availability schedule...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Weekly Availability Schedule
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={applyToAllWeekdays}
            className="text-xs"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Apply to All Weekdays
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {availability.map((day) => (
            <div 
              key={day.dayOfWeek} 
              className={`p-4 border rounded-lg transition-all ${day.isActive ? 'border-gray-200' : 'border-gray-100 bg-gray-50'}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Switch 
                    checked={day.isActive} 
                    onCheckedChange={(checked) => updateDay(day.dayOfWeek, { isActive: checked })}
                  />
                  <div className="w-28">
                    <Label className={`font-medium ${!day.isActive ? 'text-gray-400' : ''}`}>
                      {day.name}
                    </Label>
                  </div>
                </div>
                
                {!day.isActive && (
                  <span className="text-sm text-gray-500 px-3 py-1 bg-gray-100 rounded-full">
                    Unavailable
                  </span>
                )}
              </div>

              {day.isActive && (
                <div className="space-y-6 pl-11">
                  {/* Time Range */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      Working Hours
                    </Label>
                    <TimeRangePicker
                      startTime={day.startTime}
                      endTime={day.endTime}
                      onStartTimeChange={(time) => updateDay(day.dayOfWeek, { startTime: time })}
                      onEndTimeChange={(time) => updateDay(day.dayOfWeek, { endTime: time })}
                    />
                  </div>

                  {/* Slot Settings */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`slot-duration-${day.dayOfWeek}`} className="text-sm font-medium mb-2 block">
                        Appointment Duration
                      </Label>
                      <Select 
                        value={day.slotDuration.toString()} 
                        onValueChange={(v) => updateDay(day.dayOfWeek, { slotDuration: parseInt(v) })}
                      >
                        <SelectTrigger id={`slot-duration-${day.dayOfWeek}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {slotDurationOptions.map(option => (
                            <SelectItem key={option.value} value={option.value.toString()}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor={`max-patients-${day.dayOfWeek}`} className="text-sm font-medium mb-2 block">
                        Max Patients per Slot
                      </Label>
                      <Select 
                        value={day.maxPatients.toString()} 
                        onValueChange={(v) => updateDay(day.dayOfWeek, { maxPatients: parseInt(v) })}
                      >
                        <SelectTrigger id={`max-patients-${day.dayOfWeek}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 patient</SelectItem>
                          <SelectItem value="2">2 patients</SelectItem>
                          <SelectItem value="3">3 patients</SelectItem>
                          <SelectItem value="4">4 patients</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Schedule Summary */}
                  <div className="bg-blue-50 p-3 rounded-md">
                    <div className="flex justify-between text-sm">
                      <div>
                        <span className="text-gray-600">Slots from </span>
                        <span className="font-medium">{day.startTime}</span>
                        <span className="text-gray-600"> to </span>
                        <span className="font-medium">{day.endTime}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-gray-600">Duration: </span>
                        <span className="font-medium">{day.slotDuration}min</span>
                        <span className="text-gray-600 mx-2">•</span>
                        <span className="text-gray-600">Max: </span>
                        <span className="font-medium">{day.maxPatients}/slot</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {availability.filter(d => d.isActive).length} of 7 days active
              </div>
              <Button 
                onClick={handleSave} 
                disabled={saving}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Availability Schedule'}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}