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
import { Calendar as CalendarIcon, Check, ChevronLeft, ChevronRight, User as UserIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface BookingWizardProps {
  step: number
  setStep: (step: number) => void
  form: UseFormReturn<AppointmentFormData, any, AppointmentFormData>
}

interface Doctor {
  id: string
  user: {
    name: string | null
    email: string
  }
  specialization: string
  experience: number
  consultationFee: number
  colorCode: string
  isActive: boolean
}

export default function BookingWizard({ step, setStep, form }: BookingWizardProps) {
  const [loading, setLoading] = useState(false)
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState<string>()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [selectedDoctor, setSelectedDoctor] = useState<string>('')

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
    fetchActiveDoctors()
  }, [])

  // Fetch available slots when date is selected
  useEffect(() => {
    if (selectedDate && selectedDoctor) {
      fetchAvailableSlots(selectedDate)
    }
  }, [selectedDate, selectedDoctor])

  const fetchActiveDoctors = async () => {
    try {
      const response = await fetch('/api/doctors/active')
      if (response.ok) {
        const data = await response.json()
        setDoctors(data)
        
        // Auto-select first doctor if only one exists
        if (data.length === 1) {
          setSelectedDoctor(data[0].id)
          form.setValue('doctorId', data[0].id)
        }
      }
    } catch (error) {
      console.error('Error fetching doctors:', error)
    }
  }

  const fetchAvailableSlots = async (date: Date) => {
    try {
      if (!selectedDoctor) {
        alert('Please select a doctor first')
        return
      }
      
      const response = await fetch(`/api/appointments/availability?date=${date.toISOString()}&doctorId=${selectedDoctor}`)
      const data = await response.json()
      if (data.success) {
        setAvailableSlots(data.availableSlots)
      } else if (data.error) {
        alert(data.error)
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
    
    setLoading(true)
    
    try {
      const response = await fetch('/api/appointments/book', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

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
          doctorId: '',
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
        setSelectedDoctor('')
        setSelectedDate(undefined)
        setSelectedTime(undefined)
        setAvailableSlots([])
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

  // NEW Step 1: Doctor Selection
  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-4">Select Doctor</h3>
        <p className="text-gray-600 mb-6">Choose a doctor for your consultation</p>
        
        {doctors.length > 0 ? (
          <RadioGroup
            value={selectedDoctor}
            onValueChange={(value) => {
              setSelectedDoctor(value)
              form.setValue('doctorId', value)
            }}
            className="space-y-4"
          >
            {doctors.map((doctor) => (
              <div key={doctor.id} className="relative">
                <RadioGroupItem
                  value={doctor.id}
                  id={`doctor-${doctor.id}`}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={`doctor-${doctor.id}`}
                  className="flex items-center justify-between rounded-lg border-2 border-gray-200 bg-white p-4 hover:bg-gray-50 hover:border-primary peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer"
                >
                  <div className="flex items-center space-x-4">
                    <Avatar style={{ backgroundColor: doctor.colorCode }}>
                      <AvatarFallback className="text-white font-semibold">
                        {doctor.user.name?.charAt(0) || doctor.user.email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="font-semibold">{doctor.user.name || 'Doctor'}</p>
                      <p className="text-sm text-gray-500">{doctor.specialization}</p>
                      <div className="flex items-center space-x-4 mt-1 text-sm">
                        <span className="text-gray-600">{doctor.experience} years experience</span>
                        <span className="text-primary font-medium">₹{doctor.consultationFee}</span>
                      </div>
                    </div>
                  </div>
                  <div className="h-5 w-5 rounded-full border-2 border-gray-300 peer-data-[state=checked]:bg-primary peer-data-[state=checked]:border-primary"></div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        ) : (
          <div className="text-center py-8">
            <div className="h-12 w-12 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <UserIcon className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-gray-600">No doctors available at the moment</p>
            <p className="text-sm text-gray-500 mt-2">Please try again later or contact the clinic</p>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <Button type="button" disabled>
          Previous
        </Button>
        <Button 
          onClick={() => {
            if (!selectedDoctor) {
              alert('Please select a doctor')
              return
            }
            setStep(2)
          }}
          disabled={!selectedDoctor || doctors.length === 0}
        >
          Next: Appointment Details
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )

  // Step 2: Appointment Type & Service (was Step 1)
  const renderStep2 = () => (
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
        <Button type="button" variant="outline" onClick={() => setStep(1)}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <Button onClick={() => {
          const errors = form.formState.errors;
          const step2Fields = ['appointmentType', 'serviceType'];
          
          if (step2Fields.some(field => errors[field as keyof typeof errors])) {
            form.trigger(step2Fields as any);
            return;
          }
          
          const values = form.getValues();
          if (!values.appointmentType || !values.serviceType) {
            alert('Please select both appointment type and service type');
            return;
          }
          
          setStep(3);
        }}>
          Next: Select Date & Time
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )

  // Step 3: Date & Time (was Step 2)
  const renderStep3 = () => (
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
              disabled={!selectedDoctor}
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
                return date < today || date.getDay() === 0
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {!selectedDoctor && (
          <p className="text-sm text-red-500 mt-2">Please select a doctor first</p>
        )}
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
        <Button type="button" variant="outline" onClick={() => setStep(2)}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <Button
         onClick={() => {
        if (!selectedDate || !selectedTime) {
        alert('Please select both date and time');
         return;
        }
        setStep(4);
      }}
        >
          Next: Patient Information
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )

  // Step 4: Patient Information (was Step 3)
  const renderStep4 = () => (
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
        <Button type="button" variant="outline" onClick={() => setStep(3)}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <Button onClick={() => {
  const errors = form.formState.errors;
  const requiredFields = ['patientName', 'patientEmail', 'patientPhone', 'symptoms'];
  
  const values = form.getValues();
  const emptyFields = requiredFields.filter(field => {
    const value = values[field as keyof typeof values];
    return !value || value.toString().trim() === '';
  });
  
  const hasErrors = requiredFields.some(field => errors[field as keyof typeof errors]);
  
  if (emptyFields.length > 0 || hasErrors) {
    alert('Please fill all required fields correctly before proceeding');
    form.trigger(requiredFields as any);
    return;
  }
  
  setStep(5);
}}>
  Next: Review & Confirm
  <ChevronRight className="ml-2 h-4 w-4" />
</Button>
      </div>
    </div>
  )

  // Step 5: Review & Confirm (was Step 4)
  const renderStep5 = () => {
    const selectedDoctorInfo = doctors.find(d => d.id === selectedDoctor)
    
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold mb-4">Review & Confirm</h3>
        
        <div className="bg-gray-50 rounded-lg p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {selectedDoctorInfo && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500">Selected Doctor</p>
                <div className="flex items-center space-x-3 mt-1">
                  <Avatar style={{ backgroundColor: selectedDoctorInfo.colorCode }}>
                    <AvatarFallback className="text-white font-semibold">
                      {selectedDoctorInfo.user.name?.charAt(0) || selectedDoctorInfo.user.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{selectedDoctorInfo.user.name || 'Doctor'}</p>
                    <p className="text-sm text-gray-600">{selectedDoctorInfo.specialization}</p>
                  </div>
                </div>
              </div>
            )}
            
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
          <Button type="button" variant="outline" onClick={() => setStep(4)}>
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
  }

  return (
    <>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
        {step === 5 && renderStep5()}
      </form>
    </>
  )
}