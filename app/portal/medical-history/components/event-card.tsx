// /app/portal/medical-history/components/event-card.tsx - UPDATED VERSION
'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  Pill, 
  FileText, 
  Activity, 
  Stethoscope,
  Thermometer,
  Beaker,
  Syringe,
  Scale,
  AlertTriangle,
  Eye
} from 'lucide-react'
import { format } from 'date-fns'
import { MedicalEvent } from '../types'

const eventTypeConfig: Record<string, { icon: React.ComponentType<any>, color: string, bgColor: string }> = {
  APPOINTMENT: { icon: Calendar, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  PRESCRIPTION: { icon: Pill, color: 'text-green-600', bgColor: 'bg-green-100' },
  DIAGNOSIS: { icon: Stethoscope, color: 'text-purple-600', bgColor: 'bg-purple-100' },
  NOTE: { icon: FileText, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  SYMPTOM: { icon: Activity, color: 'text-orange-600', bgColor: 'bg-orange-100' },
  MEASUREMENT: { icon: Thermometer, color: 'text-cyan-600', bgColor: 'bg-cyan-100' },
  LAB_RESULT: { icon: Beaker, color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
  VACCINATION: { icon: Syringe, color: 'text-teal-600', bgColor: 'bg-teal-100' },
  SURGERY: { icon: Scale, color: 'text-red-600', bgColor: 'bg-red-100' },
  ALLERGY: { icon: AlertTriangle, color: 'text-amber-600', bgColor: 'bg-amber-100' }
}

interface EventCardProps {
  event: MedicalEvent
}

export default function EventCard({ event }: EventCardProps) {
  const { icon: Icon, color, bgColor } = eventTypeConfig[event.eventType] || 
    { icon: FileText, color: 'text-gray-600', bgColor: 'bg-gray-100' }

  const eventDate = new Date(event.createdAt)
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4 flex-1">
            <div className={`h-12 w-12 rounded-lg ${bgColor} ${color} flex items-center justify-center mt-1`}>
              <Icon className="h-6 w-6" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold">{event.title}</h3>
                <Badge 
                  variant="outline" 
                  className={`capitalize ${
                    event.eventType === 'APPOINTMENT' ? 'border-blue-200 text-blue-700' :
                    event.eventType === 'DIAGNOSIS' ? 'border-purple-200 text-purple-700' :
                    event.eventType === 'NOTE' ? 'border-yellow-200 text-yellow-700' :
                    'border-gray-200 text-gray-700'
                  }`}
                >
                  {event.eventType.toLowerCase()}
                </Badge>
              </div>
              
              <p className="text-sm text-gray-600 mb-2">
                {format(eventDate, 'MMM dd, yyyy • hh:mm a')}
              </p>
              
              {event.description && (
                <p className="text-sm text-gray-700 mb-3">
                  {event.description}
                </p>
              )}
              
              {event.doctor?.user?.name && (
                <p className="text-xs text-gray-500">
                  By: Dr. {event.doctor.user.name}
                </p>
              )}
              
              {event.metadata && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {event.metadata.severity && (
                    <Badge variant="secondary" className="text-xs">
                      Severity: {event.metadata.severity}
                    </Badge>
                  )}
                  {event.metadata.value && (
                    <Badge variant="secondary" className="text-xs">
                      Value: {event.metadata.value} {event.metadata.unit || ''}
                    </Badge>
                  )}
                  {event.metadata.status && (
                    <Badge 
                      variant={event.metadata.status === 'ACTIVE' ? 'default' : 'outline'}
                      className="text-xs"
                    >
                      {event.metadata.status}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* REMOVED: Action buttons (Edit, Delete, Download) */}
        </div>
      </CardContent>
    </Card>
  )
}