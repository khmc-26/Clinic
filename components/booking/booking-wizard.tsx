// components/booking/booking-wizard.tsx
'use client'

import { useState, useEffect } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { AppointmentFormData } from '@/lib/validations/appointment'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface BookingWizardProps {
  step: number
  setStep: (step: number) => void
  form: UseFormReturn<AppointmentFormData, any, AppointmentFormData>
}

export default function BookingWizard({ step, setStep, form }: BookingWizardProps) {
  const [loading, setLoading] = useState(false)
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState<string>()

  const appointmentTypes = [
    { value: 'IN_PERSON', label: 'In-Person Visit', description: 'Visit our clinic in Areekkad' },
    { value: 'ONLINE', label: 'Online Consultation', description: 'Video call via Google Meet' },
  ]

  const serviceTypes = [
    { value: 'GENERAL_CONSULTATION', label: 'General Consultation' },
    { value: 'FOLLOW_UP', label: 'Follow-up Visit' },
    { value: 'CHRONIC_TREATMENT', label: 'Chronic Disease Treatment' },
    { value: 'SKIN_TREATMENT', label: 'Skin Problems' },
    { value: 'WOMENS_HEALTH', label: "Women's Health" },
    { value: 'CHILD_CARE', label: 'Child Health' },
    { value: 'ALLERGY_TREATMENT', label: 'Allergy Treatment' },
    { value: 'ACUTE_TREATMENT', label: 'Acute Illness' },
  ]

  useEffect(() => {
    console.log('Booking Wizard mounted, step:', step)
    console.log('Form state:', form.getValues())
  }, [step, form])

  // Fetch available slots when date is selected
  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots(selectedDate)
    }
  }, [selectedDate])

  const fetchAvailableSlots = async (date: Date) => {
    try {
      const response = await fetch(`/api/appointments/availability?date=${date.toISOString()}`)
      const data = await response.json()
      if (data.success) {
        setAvailableSlots(data.availableSlots)
      }
    } catch (error) {
      console.error('Error fetching slots:', error)
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    setSelectedTime(undefined)
    if (date) {
      form.setValue('appointmentDate', date.toISOString())
    }
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
    if (selectedDate) {
      const [hours, minutes] = time.split(':').map(Number)
      const appointmentDateTime = new Date(selectedDate)
      appointmentDateTime.setHours(hours, minutes, 0, 0)
      form.setValue('appointmentDate', appointmentDateTime.toISOString())
    }
  }

  const handleSubmit = async (data: AppointmentFormData) => {
    console.log('=== BOOKING SUBMIT START ===')
    console.log('Form data to submit:', data)
    console.log('Is form valid?', form.formState.isValid)
    console.log('Form errors:', form.formState.errors)
    
  
    
    setLoading(true)
    
    try {
      console.log('Sending POST request to /api/appointments/book...')
      
      const response = await fetch('/api/appointments/book', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      console.log('Response status:', response.status)
      console.log('Response status text:', response.statusText)
      
      const responseText = await response.text()
      console.log('Response text:', responseText)
      
      let result;
      try {
        result = JSON.parse(responseText)
      } catch (e) {
        console.error('Failed to parse JSON response:', e)
        throw new Error(`Invalid JSON response: ${responseText}`)
      }
      
      console.log('Response JSON:', result)

      if (result.success) {
        alert('✅ Appointment booked successfully! Check your email for confirmation.')
        // Reset form PROPERLY
        form.reset({
          appointmentType: 'IN_PERSON',
          serviceType: 'GENERAL_CONSULTATION',
          appointmentDate: '',
          patientName: '',
          patientEmail: '',
          patientPhone: '',
          patientAge: undefined,
          patientGender: undefined,
          symptoms: '',
          previousTreatment: '',
          agreeToTerms: false,
        })
        setStep(1)
        setSelectedDate(undefined)
        setSelectedTime(undefined)
      } else {
        alert(`❌ Error: ${result.error || 'Failed to book appointment'}`)
      }
    } catch (error: any) {
      console.error('Booking error:', error)
      alert(`❌ Error: ${error.message}`)
    } finally {
      setLoading(false)
      console.log('=== BOOKING SUBMIT END ===')
    }
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-4">Select Appointment Type</h3>
        <RadioGroup
          onValueChange={(value) => form.setValue('appointmentType', value as any)}
          defaultValue={form.getValues('appointmentType')}
          className="grid md:grid-cols-2 gap-4"
        >
          {appointmentTypes.map((type) => (
            <div key={type.value} className="relative">
              <RadioGroupItem
                value={type.value}
                id={type.value}
                className="peer sr-only"
              />
              <Label
                htmlFor={type.value}
                className="flex flex-col items-center justify-between rounded-md border-2 border-gray-200 bg-white p-4 hover:bg-gray-50 hover:border-primary peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <CalendarIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{type.label}</p>
                      <p className="text-sm text-gray-500">{type.description}</p>
                    </div>
                  </div>
                  <div className="h-5 w-5 rounded-full border-2 border-gray-300 peer-data-[state=checked]:bg-primary peer-data-[state=checked]:border-primary"></div>
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">Select Service Type</h3>
        <Select
          onValueChange={(value) => form.setValue('serviceType', value as any)}
          defaultValue={form.getValues('serviceType')}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select service type" />
          </SelectTrigger>
          <SelectContent>
            {serviceTypes.map((service) => (
              <SelectItem key={service.value} value={service.value}>
                {service.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-between">
        <Button type="button" disabled>
          Previous
        </Button>
        <Button onClick={() => {
  // Validate step 1 fields
  const errors = form.formState.errors;
  const step1Fields = ['appointmentType', 'serviceType'];
  
  // Check for validation errors
  const hasErrors = step1Fields.some(field => errors[field as keyof typeof errors]);
  
  if (hasErrors) {
    // Trigger validation to show errors
    form.trigger(step1Fields as any);
    return;
  }
  
  // Check if fields are filled
  const values = form.getValues();
  const appointmentType = values.appointmentType;
  const serviceType = values.serviceType;
  
  if (!appointmentType || !serviceType) {
    alert('Please select both appointment type and service type');
    return;
  }
  
  setStep(2);
}}>
  Next: Select Date & Time
  <ChevronRight className="ml-2 h-4 w-4" />
</Button>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-4">Select Date</h3>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={(date) => {
                const today = new Date()
                today.setHours(0, 0, 0, 0)
                return date < today || date.getDay() === 0 // Disable Sundays
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {selectedDate && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Select Time Slot</h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {availableSlots.length > 0 ? (
              availableSlots.map((slot) => (
                <Button
                  key={slot}
                  type="button"
                  variant={selectedTime === slot ? "default" : "outline"}
                  onClick={() => handleTimeSelect(slot)}
                  className="h-12"
                >
                  {slot}
                </Button>
              ))
            ) : (
              <p className="col-span-full text-center text-gray-500 py-4">
                No available slots for selected date
              </p>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={() => setStep(1)}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <Button
         onClick={() => {
        if (!selectedDate || !selectedTime) {
        alert('Please select both date and time');
         return;
    }
    setStep(3);
  }}
        >
          Next: Patient Information
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold mb-4">Patient Information</h3>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="patientName">Full Name *</Label>
          <Input
            id="patientName"
            placeholder="Enter your full name"
            {...form.register('patientName')}
            error={form.formState.errors.patientName?.message}
          />
        </div>

        <div>
          <Label htmlFor="patientEmail">Email *</Label>
          <Input
            id="patientEmail"
            type="email"
            placeholder="Enter your email"
            {...form.register('patientEmail')}
            error={form.formState.errors.patientEmail?.message}
          />
        </div>

        <div>
          <Label htmlFor="patientPhone">Phone Number *</Label>
          <Input
            id="patientPhone"
            placeholder="10-digit mobile number"
            {...form.register('patientPhone')}
            error={form.formState.errors.patientPhone?.message}
          />
        </div>

        <div>
          <Label htmlFor="patientAge">Age</Label>
          <Input
            id="patientAge"
            type="number"
            placeholder="Age in years"
            {...form.register('patientAge', { valueAsNumber: true })}
          />
        </div>
      </div>

      <div>
        <Label>Gender</Label>
        <RadioGroup
          onValueChange={(value) => form.setValue('patientGender', value as any)}
          className="flex space-x-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="MALE" id="male" />
            <Label htmlFor="male">Male</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="FEMALE" id="female" />
            <Label htmlFor="female">Female</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="OTHER" id="other" />
            <Label htmlFor="other">Other</Label>
          </div>
        </RadioGroup>
      </div>

      <div>
        <Label htmlFor="symptoms">Symptoms / Reason for Visit *</Label>
        <Textarea
          id="symptoms"
          placeholder="Describe your symptoms, duration, and any other relevant information..."
          rows={4}
          {...form.register('symptoms')}
          error={form.formState.errors.symptoms?.message}
        />
      </div>

      <div>
        <Label htmlFor="previousTreatment">Previous Treatment (if any)</Label>
        <Textarea
          id="previousTreatment"
          placeholder="Any previous medications or treatments..."
          rows={3}
          {...form.register('previousTreatment')}
        />
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={() => setStep(2)}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <Button onClick={() => {
  // Validate step 3 fields
  const errors = form.formState.errors;
  const requiredFields = ['patientName', 'patientEmail', 'patientPhone', 'symptoms'];
  
  // Check if any required fields are empty
  const values = form.getValues();
  const emptyFields = requiredFields.filter(field => {
    const value = values[field as keyof typeof values];
    return !value || value.toString().trim() === '';
  });
  
  // Check for validation errors
  const hasErrors = requiredFields.some(field => errors[field as keyof typeof errors]);
  
  if (emptyFields.length > 0 || hasErrors) {
    alert('Please fill all required fields correctly before proceeding');
    
    // Trigger validation
    form.trigger(requiredFields as any);
    
    return;
  }
  
  setStep(4);
}}>
  Next: Review & Confirm
  <ChevronRight className="ml-2 h-4 w-4" />
</Button>
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold mb-4">Review & Confirm</h3>
      
      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Appointment Type</p>
            <p className="font-semibold">
              {form.getValues('appointmentType') === 'IN_PERSON' ? 'In-Person Visit' : 'Online Consultation'}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Service Type</p>
            <p className="font-semibold">
              {serviceTypes.find(s => s.value === form.getValues('serviceType'))?.label}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Date & Time</p>
            <p className="font-semibold">
              {selectedDate && selectedTime
                ? `${format(selectedDate, 'PPP')} at ${selectedTime}`
                : 'Not selected'}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Patient Name</p>
            <p className="font-semibold">{form.getValues('patientName')}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-semibold">{form.getValues('patientEmail')}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Phone</p>
            <p className="font-semibold">{form.getValues('patientPhone')}</p>
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-500">Symptoms</p>
          <p className="font-semibold">{form.getValues('symptoms')}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id="agreeToTerms"
            {...form.register('agreeToTerms')}
            className="mt-1"
          />
          <Label htmlFor="agreeToTerms" className="font-normal">
            I agree to the terms and conditions, and confirm that all information provided is accurate.
            I understand that this appointment booking is subject to confirmation by the clinic.
          </Label>
        </div>
        {form.formState.errors.agreeToTerms && (
          <p className="text-sm text-error">{form.formState.errors.agreeToTerms.message}</p>
        )}

        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id="consent"
            className="mt-1"
          />
          <Label htmlFor="consent" className="font-normal">
            I consent to receiving appointment reminders and communications via email and SMS.
          </Label>
        </div>
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={() => setStep(3)}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <Button
          onClick={form.handleSubmit(handleSubmit)}
          disabled={loading}
          className="bg-success hover:bg-success/90"
        >
          {loading ? 'Booking...' : 'Confirm Booking'}
          <Check className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )

  return (
    <>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </form>
    </>
  )
}