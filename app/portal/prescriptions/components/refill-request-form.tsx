'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Loader2, AlertCircle, Pill } from 'lucide-react'

interface RefillRequestFormProps {
  medicationName: string
  onClose: () => void
  onSubmit: (data: any) => Promise<void>
  medications: string[]
}

export default function RefillRequestForm({ 
  medicationName, 
  onClose, 
  onSubmit,
  medications 
}: RefillRequestFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    medicationName: medicationName || '',
    urgency: 'NORMAL',
    reason: '',
    pharmacy: '',
    pickupDate: new Date().toISOString().split('T')[0]
  })

  const handleSubmit = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!formData.medicationName.trim()) {
        setError('Please select a medication')
        return
      }

      await onSubmit(formData)
      onClose()
    } catch (error: any) {
      setError(error.message || 'Failed to submit refill request')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Pill className="mr-2 h-5 w-5" />
            Request Medication Refill
          </DialogTitle>
          <DialogDescription>
            Submit a request for medication refill. Doctor approval required.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="medicationName">Medication *</Label>
            <Select 
              value={formData.medicationName} 
              onValueChange={(value) => handleChange('medicationName', value)}
              disabled={!!medicationName}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select medication" />
              </SelectTrigger>
              <SelectContent>
                {medications.map((med) => (
                  <SelectItem key={med} value={med}>
                    {med}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {medicationName && (
              <p className="text-xs text-gray-500">
                Pre-selected from your medication list
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="urgency">Urgency *</Label>
            <Select 
              value={formData.urgency} 
              onValueChange={(value) => handleChange('urgency', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select urgency level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NORMAL">
                  <div className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                    Normal (3-5 business days)
                  </div>
                </SelectItem>
                <SelectItem value="URGENT">
                  <div className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-amber-500 mr-2"></div>
                    Urgent (1-2 business days)
                  </div>
                </SelectItem>
                <SelectItem value="EMERGENCY">
                  <div className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-red-500 mr-2"></div>
                    Emergency (Same day)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Refill *</Label>
            <Textarea
              id="reason"
              placeholder="Explain why you need a refill (e.g., running low, lost medication, dosage change...)"
              rows={3}
              value={formData.reason}
              onChange={(e) => handleChange('reason', e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pharmacy">Preferred Pharmacy (Optional)</Label>
              <Input
                id="pharmacy"
                placeholder="Pharmacy name"
                value={formData.pharmacy}
                onChange={(e) => handleChange('pharmacy', e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pickupDate">Preferred Pickup Date</Label>
              <Input
                id="pickupDate"
                type="date"
                value={formData.pickupDate}
                onChange={(e) => handleChange('pickupDate', e.target.value)}
                disabled={loading}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          {formData.urgency === 'EMERGENCY' && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="h-4 w-4 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-red-700 font-medium">Emergency Request</p>
                  <p className="text-xs text-red-600 mt-1">
                    Emergency requests require immediate doctor attention. 
                    Please call the clinic if this is a life-threatening situation.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Refill Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}