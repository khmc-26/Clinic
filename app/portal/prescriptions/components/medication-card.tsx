'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Pill, Clock, AlertCircle, Calendar } from 'lucide-react'

interface MedicationCardProps {
  prescription: {
    id: string
    medicationName: string
    dosage: string
    frequency: string
    duration: string
    instructions: string | null
    prescribedBy: string
    prescribedDate: string
    refillsRemaining: number
    nextRefillDate: string | null
    status: string
  }
  onRefillRequest: () => void
}

export default function MedicationCard({ prescription, onRefillRequest }: MedicationCardProps) {
  const getRefillStatus = () => {
    if (!prescription.nextRefillDate) return null
    
    const nextDate = new Date(prescription.nextRefillDate)
    const today = new Date()
    const diffDays = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 3600 * 24))
    
    if (diffDays <= 0) return { text: 'Refill Due', color: 'bg-red-100 text-red-800 border-red-200' }
    if (diffDays <= 7) return { text: 'Due Soon', color: 'bg-amber-100 text-amber-800 border-amber-200' }
    if (diffDays <= 30) return { text: 'Upcoming', color: 'bg-blue-100 text-blue-800 border-blue-200' }
    return null
  }

  const refillStatus = getRefillStatus()

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Pill className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{prescription.medicationName}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {prescription.dosage}
                    </Badge>
                    <span className="text-sm text-gray-600">{prescription.frequency}</span>
                    <span className="text-sm text-gray-600">•</span>
                    <span className="text-sm text-gray-600">{prescription.duration}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-2">
                {refillStatus && (
                  <Badge variant="outline" className={refillStatus.color}>
                    {refillStatus.text}
                  </Badge>
                )}
                <Badge variant={prescription.status === 'ACTIVE' ? 'default' : 'outline'}>
                  {prescription.status}
                </Badge>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-2" />
                  Prescribed On
                </div>
                <p className="font-medium">
                  {new Date(prescription.prescribedDate).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </p>
                <p className="text-sm text-gray-600">by {prescription.prescribedBy}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center text-sm text-gray-500">
                  <Pill className="h-4 w-4 mr-2" />
                  Refills Remaining
                </div>
                <p className="font-medium">{prescription.refillsRemaining}</p>
                {prescription.nextRefillDate && (
                  <p className="text-sm text-gray-600">
                    Next: {new Date(prescription.nextRefillDate).toLocaleDateString()}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-2" />
                  Instructions
                </div>
                <p className="font-medium">
                  {prescription.instructions || 'Take as directed'}
                </p>
              </div>
            </div>

            {prescription.instructions && prescription.instructions.length > 50 && (
              <p className="mt-3 text-sm text-gray-700">
                {prescription.instructions}
              </p>
            )}
          </div>

          <div className="flex flex-col space-y-2 min-w-[120px]">
            <Button 
              onClick={onRefillRequest}
              disabled={prescription.refillsRemaining === 0}
              size="sm"
            >
              Request Refill
            </Button>
            <Button variant="outline" size="sm">
              View Details
            </Button>
            {refillStatus?.text === 'Refill Due' && (
              <Button variant="error" size="sm">
                <AlertCircle className="h-3 w-3 mr-1" />
                Urgent
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}