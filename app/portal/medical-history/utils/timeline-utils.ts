import { EventType } from '../types'

export function getEventTypeColor(eventType: EventType): string {
  const colors: Record<EventType, string> = {
    'APPOINTMENT': 'bg-blue-500',
    'PRESCRIPTION': 'bg-green-500',
    'DIAGNOSIS': 'bg-purple-500',
    'NOTE': 'bg-amber-500',
    'SYMPTOM': 'bg-orange-500',
    'MEASUREMENT': 'bg-cyan-500',
    'LAB_RESULT': 'bg-pink-500',
    'VACCINATION': 'bg-indigo-500',
    'SURGERY': 'bg-red-500',
    'ALLERGY': 'bg-rose-500'
  }
  return colors[eventType] || 'bg-gray-500'
}

export function groupEventsByMonth(events: any[]) {
  const grouped: Record<string, any[]> = {}
  
  events.forEach(event => {
    const date = new Date(event.createdAt)
    const year = date.getFullYear()
    const month = date.toLocaleDateString('en-US', { month: 'long' })
    const key = `${year}-${month}`
    
    if (!grouped[key]) {
      grouped[key] = []
    }
    grouped[key].push(event)
  })
  
  return grouped
}

export function formatEventDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function getEventTypeCount(events: any[], type: EventType): number {
  return events.filter(event => event.eventType === type).length
}