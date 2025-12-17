// /components/ui/time-range-picker.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Clock } from 'lucide-react'

interface TimeRangePickerProps {
  startTime: string
  endTime: string
  onStartTimeChange: (time: string) => void
  onEndTimeChange: (time: string) => void
  className?: string
}

const timeOptions = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2)
  const minute = (i % 2) * 30
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
})

export default function TimeRangePicker({
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
  className = ''
}: TimeRangePickerProps) {
  const [localStart, setLocalStart] = useState(startTime)
  const [localEnd, setLocalEnd] = useState(endTime)

  // Filter end times to be after start time
  const filteredEndOptions = timeOptions.filter(time => time > localStart)

  const handleStartChange = (value: string) => {
    setLocalStart(value)
    onStartTimeChange(value)
    // If end time is now before start time, adjust it
    if (value >= localEnd) {
      const nextValidEnd = timeOptions.find(time => time > value)
      if (nextValidEnd) {
        setLocalEnd(nextValidEnd)
        onEndTimeChange(nextValidEnd)
      }
    }
  }

  const handleEndChange = (value: string) => {
    setLocalEnd(value)
    onEndTimeChange(value)
  }

  const quickPresets = [
    { label: 'Morning (9AM-1PM)', start: '09:00', end: '13:00' },
    { label: 'Afternoon (1PM-5PM)', start: '13:00', end: '17:00' },
    { label: 'Full Day (9AM-5PM)', start: '09:00', end: '17:00' },
    { label: 'Evening (4PM-8PM)', start: '16:00', end: '20:00' },
  ]

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <Label htmlFor="start-time" className="text-sm font-medium mb-2 block">
            Start Time
          </Label>
          <Select value={localStart} onValueChange={handleStartChange}>
            <SelectTrigger id="start-time" className="w-full">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-gray-500" />
                <SelectValue placeholder="Select start time" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {timeOptions.map((time) => (
                <SelectItem key={`start-${time}`} value={time}>
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <Label htmlFor="end-time" className="text-sm font-medium mb-2 block">
            End Time
          </Label>
          <Select 
            value={localEnd} 
            onValueChange={handleEndChange}
            disabled={filteredEndOptions.length === 0}
          >
            <SelectTrigger id="end-time" className="w-full">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-gray-500" />
                <SelectValue placeholder="Select end time" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {filteredEndOptions.map((time) => (
                <SelectItem key={`end-${time}`} value={time}>
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Quick Presets */}
      <div className="space-y-2">
        <Label className="text-sm text-gray-600">Quick Presets</Label>
        <div className="flex flex-wrap gap-2">
          {quickPresets.map((preset) => (
            <Button
              key={preset.label}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                handleStartChange(preset.start)
                handleEndChange(preset.end)
              }}
              className="text-xs"
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Visual Time Range */}
      <div className="pt-2">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
          <span>Selected: {localStart} - {localEnd}</span>
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
            {(() => {
              const [startHour, startMin] = localStart.split(':').map(Number)
              const [endHour, endMin] = localEnd.split(':').map(Number)
              const duration = (endHour * 60 + endMin) - (startHour * 60 + startMin)
              return `${duration} minutes`
            })()}
          </span>
        </div>
      </div>
    </div>
  )
}