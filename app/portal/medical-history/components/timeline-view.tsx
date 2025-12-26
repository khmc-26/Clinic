// /app/portal/medical-history/components/timeline-view.tsx
'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, Calendar, Filter } from 'lucide-react'
import EventCard from './event-card'
import { MedicalEvent, TimelineGroup, EventFilters } from '../types'
import { format } from 'date-fns'

interface TimelineViewProps {
  events: MedicalEvent[]
  filters?: EventFilters
  onEventClick?: (event: MedicalEvent) => void
  loading?: boolean
}

export default function TimelineView({ 
  events, 
  filters, 
  onEventClick,
  loading = false 
}: TimelineViewProps) {
  const [expandedYears, setExpandedYears] = useState<number[]>([])
  const [expandedMonths, setExpandedMonths] = useState<string[]>([])

  // Group events by year and month
  const groupedEvents: TimelineGroup[] = events.reduce((acc: TimelineGroup[], event) => {
    const eventDate = new Date(event.createdAt)
    const year = eventDate.getFullYear()
    const month = eventDate.getMonth()
    
    let yearGroup = acc.find(g => g.year === year)
    if (!yearGroup) {
      yearGroup = { year, months: [] }
      acc.push(yearGroup)
    }
    
    let monthGroup = yearGroup.months.find(m => m.month === month)
    if (!monthGroup) {
      monthGroup = {
        month,
        monthName: format(eventDate, 'MMMM'),
        events: []
      }
      yearGroup.months.push(monthGroup)
    }
    
    monthGroup.events.push(event)
    return acc
  }, [])

  // Sort years descending
  groupedEvents.sort((a, b) => b.year - a.year)
  
  // Sort months descending within each year
  groupedEvents.forEach(year => {
    year.months.sort((a, b) => b.month - a.month)
    // Sort events by date within each month (newest first)
    year.months.forEach(month => {
      month.events.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    })
  })

  const toggleYear = (year: number) => {
    setExpandedYears(prev => 
      prev.includes(year) 
        ? prev.filter(y => y !== year)
        : [...prev, year]
    )
  }

  const toggleMonth = (year: number, month: number) => {
    const key = `${year}-${month}`
    setExpandedMonths(prev => 
      prev.includes(key)
        ? prev.filter(k => k !== key)
        : [...prev, key]
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="pt-6">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                <div className="h-24 bg-gray-200 rounded"></div>
                <div className="h-24 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No medical events found</h3>
          <p className="text-gray-600 mb-6">
            Your medical timeline will appear here once you have appointments or add medical events.
          </p>
          <Button onClick={() => onEventClick?.(null as any)}>
            Add Your First Medical Event
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      {groupedEvents.map((yearGroup) => {
        const isYearExpanded = expandedYears.includes(yearGroup.year) || expandedYears.length === 0
        
        return (
          <div key={yearGroup.year} className="relative">
            {/* Year Header */}
            <div className="sticky top-0 z-10 bg-white py-4 mb-4 border-b">
              <button
                onClick={() => toggleYear(yearGroup.year)}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {yearGroup.year}
                  </h2>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {yearGroup.months.reduce((total, month) => total + month.events.length, 0)} events
                  </span>
                </div>
                <div className="text-gray-400">
                  {isYearExpanded ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </div>
              </button>
            </div>

            {/* Months (only show if year is expanded) */}
            {isYearExpanded && (
              <div className="space-y-6 ml-6 border-l pl-6">
                {yearGroup.months.map((monthGroup) => {
                  const monthKey = `${yearGroup.year}-${monthGroup.month}`
                  const isMonthExpanded = expandedMonths.includes(monthKey) || expandedMonths.length === 0
                  
                  return (
                    <div key={monthKey} className="relative">
                      {/* Month Header */}
                      <div className="flex items-center justify-between mb-4">
                        <button
                          onClick={() => toggleMonth(yearGroup.year, monthGroup.month)}
                          className="flex items-center gap-3"
                        >
                          <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            {monthGroup.monthName}
                          </h3>
                          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {monthGroup.events.length} events
                          </span>
                        </button>
                        <div className="text-gray-400">
                          {isMonthExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </div>
                      </div>

                      {/* Events (only show if month is expanded) */}
                      {isMonthExpanded && (
                        <div className="space-y-4">
                          {monthGroup.events.map((event) => (
                            <EventCard
                              key={event.id}
                              event={event}
                              onViewDetails={onEventClick}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}