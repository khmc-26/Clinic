// /app/portal/medical-history/components/timeline-filters.tsx - SIMPLIFIED VERSION
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { 
  Filter, 
  Calendar as CalendarIcon,
  X
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { EventType } from '../types'

export interface TimelineFiltersProps {
  filters: {
    eventTypes: EventType[]
    dateRange?: {
      start: Date
      end: Date
    }
    doctorId?: string
  }
  onFilterChange: (filters: {
    eventTypes: EventType[]
    dateRange?: {
      start: Date
      end: Date
    }
    doctorId?: string
  }) => void
}

const eventTypes: { value: EventType; label: string }[] = [
  { value: 'APPOINTMENT', label: 'Appointments' },
  { value: 'PRESCRIPTION', label: 'Prescriptions' },
  { value: 'DIAGNOSIS', label: 'Diagnoses' },
  { value: 'NOTE', label: 'Notes' },
  { value: 'SYMPTOM', label: 'Symptoms' },
  { value: 'MEASUREMENT', label: 'Measurements' },
  { value: 'LAB_RESULT', label: 'Lab Results' },
  { value: 'ALLERGY', label: 'Allergies' },
  { value: 'VACCINATION', label: 'Vaccinations' },
  { value: 'SURGERY', label: 'Surgeries' }
]

export default function TimelineFilters({ filters, onFilterChange }: TimelineFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [localFilters, setLocalFilters] = useState(filters)
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')

  const handleEventTypeChange = (eventType: EventType, checked: boolean) => {
    const newEventTypes = checked
      ? [...localFilters.eventTypes, eventType]
      : localFilters.eventTypes.filter(et => et !== eventType)
    
    const newFilters = { ...localFilters, eventTypes: newEventTypes }
    setLocalFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleDateRangeApply = () => {
    if (startDate && endDate) {
      const newFilters = {
        ...localFilters,
        dateRange: {
          start: new Date(startDate),
          end: new Date(endDate)
        }
      }
      setLocalFilters(newFilters)
      onFilterChange(newFilters)
    }
  }

  const handleClearDateRange = () => {
    setStartDate('')
    setEndDate('')
    const newFilters = {
      ...localFilters,
      dateRange: undefined
    }
    setLocalFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleClearFilters = () => {
    const newFilters = {
      eventTypes: [],
      dateRange: undefined,
      doctorId: undefined
    }
    setLocalFilters(newFilters)
    setStartDate('')
    setEndDate('')
    onFilterChange(newFilters)
  }

  const hasActiveFilters = 
    localFilters.eventTypes.length > 0 || 
    localFilters.dateRange !== undefined ||
    localFilters.doctorId !== undefined

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="relative">
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {hasActiveFilters && (
            <span className="ml-2 h-2 w-2 rounded-full bg-primary"></span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Filter Events</h3>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="h-8 text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Clear All
              </Button>
            )}
          </div>

          {/* Event Type Filters */}
          <div>
            <Label className="mb-2 block">Event Type</Label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border rounded">
              {eventTypes.map((type) => (
                <div key={type.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`filter-${type.value}`}
                    checked={localFilters.eventTypes.includes(type.value)}
                    onCheckedChange={(checked) => 
                      handleEventTypeChange(type.value, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={`filter-${type.value}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {type.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Date Range Filter (Simplified) */}
          <div>
            <Label className="mb-2 block">Date Range</Label>
            <div className="space-y-2">
              <div>
                <Label htmlFor="start-date" className="text-sm">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="end-date" className="text-sm">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  onClick={handleDateRangeApply}
                  disabled={!startDate || !endDate}
                >
                  Apply Date Range
                </Button>
                {(startDate || endDate) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearDateRange}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
            {localFilters.dateRange && (
              <div className="mt-2 text-sm text-gray-600">
                {format(localFilters.dateRange.start, 'MMM dd, yyyy')} -{' '}
                {format(localFilters.dateRange.end, 'MMM dd, yyyy')}
              </div>
            )}
          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="pt-4 border-t">
              <Label className="mb-2 block">Active Filters</Label>
              <div className="space-y-2">
                {localFilters.eventTypes.length > 0 && (
                  <div className="text-sm">
                    <span className="font-medium">Types: </span>
                    <span className="text-gray-600">
                      {localFilters.eventTypes.length} selected
                    </span>
                  </div>
                )}
                {localFilters.dateRange && (
                  <div className="text-sm">
                    <span className="font-medium">Date Range: </span>
                    <span className="text-gray-600">
                      {format(localFilters.dateRange.start, 'MMM dd')} -{' '}
                      {format(localFilters.dateRange.end, 'MMM dd, yyyy')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              Close
            </Button>
            <Button
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}