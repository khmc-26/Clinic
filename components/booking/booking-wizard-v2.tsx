'use client'

import { useState, useEffect } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { AppointmentV2FormData } from '@/lib/validations/appointment-v2'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, User, Users, UserPlus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useSession } from 'next-auth/react'

interface BookingWizardV2Props {
  step: number
  setStep: (step: number) => void
  form: UseFormReturn<AppointmentV2FormData>
}

interface Doctor {
  id: string
  user: { name: string | null; email: string }
  specialization: string
  experience: number
  consultationFee: number
  colorCode: string
}

interface FamilyMember {
  id: string
  name: string
  email: string | null
  phone: string | null
  relationship: string
  age: number | null
  gender: string | null // Add this
  medicalNotes?: string | null
}

export default function BookingWizardV2({ step, setStep, form }: BookingWizardV2Props) {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState<string>()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])
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
    fetchFamilyMembers()
  }, [])

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
        if (data.length === 1) {
          setSelectedDoctor(data[0].id)
          form.setValue('doctorId', data[0].id)
        }
      }
    } catch (error) {
      console.error('Error fetching doctors:', error)
    }
  }

  const fetchFamilyMembers = async () => {
    try {
      const response = await fetch('/api/patient/family-members')
      if (response.ok) {
        const data = await response.json()
        // FIXED: Remove isActive filtering since we're doing permanent delete
        setFamilyMembers(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Error fetching family members:', error)
    }
  }

  const fetchAvailableSlots = async (date: Date) => {
    try {
      const response = await fetch(`/api/appointments/availability?date=${date.toISOString()}&doctorId=${selectedDoctor}`)
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

  // Step 1: Doctor Selection (same as before)
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
                <RadioGroupItem value={doctor.id} id={`doctor-${doctor.id}`} className="peer sr-only" />
                <Label htmlFor={`doctor-${doctor.id}`} className="flex items-center justify-between rounded-lg border-2 border-gray-200 bg-white p-4 hover:bg-gray-50 hover:border-primary peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer">
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
            <p className="text-gray-600">No doctors available at the moment</p>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <Button type="button" disabled>Previous</Button>
        <Button onClick={() => {
          if (!selectedDoctor) {
            alert('Please select a doctor')
            return
          }
          setStep(2)
        }} disabled={!selectedDoctor}>
          Next: Appointment Details <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )

  // Step 2: Service Type (same as before)
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
              <RadioGroupItem value={type.value} id={type.value} className="peer sr-only" />
              <Label htmlFor={type.value} className="flex flex-col items-center justify-between rounded-md border-2 border-gray-200 bg-white p-4 hover:bg-gray-50 hover:border-primary peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer">
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
        <Select onValueChange={(value) => form.setValue('serviceType', value as any)} defaultValue={form.getValues('serviceType')}>
          <SelectTrigger><SelectValue placeholder="Select service type" /></SelectTrigger>
          <SelectContent>{serviceTypes.map((service) => <SelectItem key={service.value} value={service.value}>{service.label}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={() => setStep(1)}><ChevronLeft className="mr-2 h-4 w-4" />Previous</Button>
        <Button onClick={() => {
          if (!form.getValues('appointmentType') || !form.getValues('serviceType')) {
            alert('Please select both appointment type and service type')
            return
          }
          setStep(3)
        }}>Next: Date & Time <ChevronRight className="ml-2 h-4 w-4" /></Button>
      </div>
    </div>
  )

  // Step 3: Date & Time (same as before)
  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-4">Select Date</h3>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !selectedDate && "text-muted-foreground")} disabled={!selectedDoctor}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={selectedDate} onSelect={handleDateSelect} disabled={(date) => {
            const today = new Date()
            today.setHours(0,0,0,0)
            return date < today || date.getDay() === 0
          }} initialFocus /></PopoverContent>
        </Popover>
      </div>

      {selectedDate && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Select Time Slot</h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {availableSlots.length > 0 ? availableSlots.map((slot) => (
              <Button key={slot} type="button" variant={selectedTime === slot ? "default" : "outline"} onClick={() => handleTimeSelect(slot)} className="h-12">{slot}</Button>
            )) : <p className="col-span-full text-center text-gray-500 py-4">No available slots for selected date</p>}
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={() => setStep(2)}><ChevronLeft className="mr-2 h-4 w-4" />Previous</Button>
        <Button onClick={() => {
          if (!selectedDate || !selectedTime) {
            alert('Please select both date and time')
            return
          }
          setStep(4)
        }}>Next: Who & Patient Info <ChevronRight className="ml-2 h-4 w-4" /></Button>
      </div>
    </div>
  )

  // Step 4: FIXED - Who is this appointment for?
  const renderStep4 = () => {
    const bookingFor = form.watch('bookingFor')
    const selectedFamilyMemberId = form.watch('familyMemberId')
    
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold mb-4">Who is this appointment for?</h3>
        
        <RadioGroup 
          value={bookingFor} 
          onValueChange={(value) => {
            form.setValue('bookingFor', value as any)
            
            // Clear patient fields when not booking for SOMEONE_ELSE
            if (value !== 'SOMEONE_ELSE') {
              form.setValue('patientName', '')
              form.setValue('patientEmail', '')
              form.setValue('patientPhone', '')
            }
            
            // Clear familyMemberId when not booking for FAMILY_MEMBER
            if (value !== 'FAMILY_MEMBER') {
              form.setValue('familyMemberId', undefined)
            }
          }}
          className="space-y-4"
        >

          {/* Myself */}
          <div className="relative">
            <RadioGroupItem 
              value="MYSELF" 
              id="myself" 
              className="peer sr-only" 
            />
            <Label 
              htmlFor="myself" 
              className="flex items-start justify-between rounded-lg border-2 border-gray-200 bg-white p-4 hover:bg-gray-50 hover:border-primary peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer"
              onClick={() => {
                form.setValue('bookingFor', 'MYSELF')
                form.setValue('familyMemberId', undefined)
              }}
            >
              <div className="flex items-start space-x-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="font-semibold">Myself ({session?.user?.name || 'You'})</p>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">You</span>
                  </div>
                  <div className="mt-2 space-y-1 text-sm text-gray-600">
                    <p>Booking with your account: {session?.user?.email}</p>
                    <p>Phone number from your profile will be used</p>
                  </div>
                </div>
              </div>
              <div className={`h-5 w-5 rounded-full border-2 ${form.getValues('bookingFor') === 'MYSELF' ? 'bg-primary border-primary' : 'border-gray-300'} mt-1`}></div>
            </Label>
          </div>

          {/* Family Members */}
          {familyMembers.map((member) => (
            <div key={member.id} className="relative">
              <RadioGroupItem value="FAMILY_MEMBER" id={`family-${member.id}`} className="peer sr-only" />
              <Label htmlFor={`family-${member.id}`} className="flex items-start justify-between rounded-lg border-2 border-gray-200 bg-white p-4 hover:bg-gray-50 hover:border-primary peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer" onClick={() => {
                form.setValue('bookingFor', 'FAMILY_MEMBER')
                form.setValue('familyMemberId', member.id)
              }}>
                <div className="flex items-start space-x-3">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-semibold">{member.name}</p>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded capitalize">{member.relationship}</span>
                    </div>
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      <p>Booking with your account: {session?.user?.email}</p>
                      {member.age && <p>Age: {member.age} years</p>}
                      {member.gender && <p>Gender: {member.gender}</p>}
                    </div>
                  </div>
                </div>
                <div className={`h-5 w-5 rounded-full border-2 ${selectedFamilyMemberId === member.id && bookingFor === 'FAMILY_MEMBER' ? 'bg-primary border-primary' : 'border-gray-300'} mt-1`}></div>
              </Label>
            </div>
          ))}

          {/* Someone Else */}
          <div className="relative">
            <RadioGroupItem value="SOMEONE_ELSE" id="someone-else" className="peer sr-only" />
            <Label htmlFor="someone-else" className="flex items-start justify-between rounded-lg border-2 border-gray-200 bg-white p-4 hover:bg-gray-50 hover:border-primary peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer">
              <div className="flex items-start space-x-3">
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <UserPlus className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Someone Else</p>
                  <div className="mt-3 space-y-3">
                    <div>
                      <Label htmlFor="someoneName" className="text-sm">Name *</Label>
                      <Input 
                        id="someoneName" 
                        placeholder="Enter full name" 
                        disabled={bookingFor !== 'SOMEONE_ELSE'} 
                        {...form.register('patientName')} 
                        onFocus={() => form.setValue('bookingFor', 'SOMEONE_ELSE')}
                      />
                    </div>
                    <div>
                      <Label htmlFor="someoneEmail" className="text-sm">Email *</Label>
                      <Input 
                        id="someoneEmail" 
                        type="email" 
                        placeholder="Enter email" 
                        disabled={bookingFor !== 'SOMEONE_ELSE'} 
                        {...form.register('patientEmail')} 
                        onFocus={() => form.setValue('bookingFor', 'SOMEONE_ELSE')}
                      />
                    </div>
                    <div>
                      <Label htmlFor="someonePhone" className="text-sm">Phone *</Label>
                      <Input 
                        id="someonePhone" 
                        placeholder="10-digit mobile number" 
                        disabled={bookingFor !== 'SOMEONE_ELSE'} 
                        {...form.register('patientPhone')} 
                        onFocus={() => form.setValue('bookingFor', 'SOMEONE_ELSE')}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="h-5 w-5 rounded-full border-2 border-gray-300 peer-data-[state=checked]:bg-primary peer-data-[state=checked]:border-primary mt-1"></div>
            </Label>
          </div>
        </RadioGroup>

        {/* Medical Info (Always editable) */}
        <div className="mt-8">
          <h4 className="text-lg font-semibold mb-4">Medical Information</h4>
          <div className="space-y-4">
            <div>
              <Label htmlFor="symptoms">Symptoms / Reason for Visit *</Label>
              <Textarea id="symptoms" placeholder="Describe your symptoms..." rows={4} {...form.register('symptoms')} />
            </div>
            <div>
              <Label htmlFor="previousTreatment">Previous Treatment (if any)</Label>
              <Textarea id="previousTreatment" placeholder="Any previous medications or treatments..." rows={3} {...form.register('previousTreatment')} />
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => setStep(3)}><ChevronLeft className="mr-2 h-4 w-4" />Previous</Button>
          <Button onClick={() => {
            console.log('=== STEP 4 VALIDATION ===')
            console.log('Form values:', form.getValues())
            console.log('Form errors:', form.formState.errors)
            
            const bookingForValue = form.getValues('bookingFor')
            const errors = form.formState.errors
            
            // Validate based on booking type
            if (!bookingForValue) {
              alert('Please select who this appointment is for')
              return
            }
            
            if (bookingForValue === 'SOMEONE_ELSE') {
              const { patientName, patientEmail, patientPhone } = form.getValues()
              console.log('Someone else validation:', { patientName, patientEmail, patientPhone })
              
              if (!patientName || !patientEmail || !patientPhone) {
                alert('Please fill all patient information for "Someone Else"')
                return
              }
            }
            
            if (bookingForValue === 'FAMILY_MEMBER' && !form.getValues('familyMemberId')) {
              alert('Please select a family member')
              return
            }
            
            if (!form.getValues('symptoms')) {
              alert('Please describe symptoms')
              return
            }
            
            console.log('Step 4 validation passed, moving to step 5')
            setStep(5)
          }}>
            Next: Review & Confirm <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  // Step 5: Review & Confirm (updated)
  const renderStep5 = () => {
    const bookingFor = form.getValues('bookingFor')
    const familyMemberId = form.getValues('familyMemberId')
    const selectedFamilyMember = familyMembers.find(m => m.id === familyMemberId)
    const selectedDoctorInfo = doctors.find(d => d.id === selectedDoctor)
    
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold mb-4">Review & Confirm</h3>
        
        <div className="bg-gray-50 rounded-lg p-6 space-y-4">
          {/* Doctor Info */}
          {selectedDoctorInfo && (
            <div className="border-b pb-4">
              <p className="text-sm text-gray-500">Doctor</p>
              <div className="flex items-center space-x-3 mt-1">
                <Avatar style={{ backgroundColor: selectedDoctorInfo.colorCode }}>
                  <AvatarFallback className="text-white">{selectedDoctorInfo.user.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{selectedDoctorInfo.user.name}</p>
                  <p className="text-sm text-gray-600">{selectedDoctorInfo.specialization}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Appointment Details */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Appointment Type</p>
              <p className="font-semibold">{form.getValues('appointmentType') === 'IN_PERSON' ? 'In-Person Visit' : 'Online Consultation'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Service Type</p>
              <p className="font-semibold">{serviceTypes.find(s => s.value === form.getValues('serviceType'))?.label}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Date & Time</p>
              <p className="font-semibold">{selectedDate && selectedTime ? `${format(selectedDate, 'PPP')} at ${selectedTime}` : 'Not selected'}</p>
            </div>
          </div>
          
          {/* Patient For */}
          <div className="border-t pt-4">
            <p className="text-sm text-gray-500">Appointment For</p>
            {bookingFor === 'MYSELF' && (
              <div className="flex items-center space-x-2 mt-1">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold">Myself ({session?.user?.name})</p>
                  <p className="text-sm text-gray-600">{session?.user?.email}</p>
                </div>
              </div>
            )}
            {bookingFor === 'FAMILY_MEMBER' && selectedFamilyMember && (
              <div className="flex items-center space-x-2 mt-1">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <Users className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold">{selectedFamilyMember.name}</p>
                  <p className="text-sm text-gray-600 capitalize">{selectedFamilyMember.relationship} • {selectedFamilyMember.email || 'No email'}</p>
                </div>
              </div>
            )}
            {bookingFor === 'SOMEONE_ELSE' && (
              <div className="flex items-center space-x-2 mt-1">
                <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <UserPlus className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold">{form.getValues('patientName')}</p>
                  <p className="text-sm text-gray-600">{form.getValues('patientEmail')} • {form.getValues('patientPhone')}</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Symptoms */}
          <div className="border-t pt-4">
            <p className="text-sm text-gray-500">Symptoms</p>
            <p className="font-semibold">{form.getValues('symptoms')}</p>
          </div>
        </div>

        {/* Terms */}
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <input type="checkbox" id="agreeToTerms" {...form.register('agreeToTerms')} className="mt-1" />
            <Label htmlFor="agreeToTerms" className="font-normal">
              I agree to the terms and conditions, and confirm that all information provided is accurate.
            </Label>
          </div>
        </div>

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => setStep(4)}><ChevronLeft className="mr-2 h-4 w-4" />Previous</Button>
          <Button onClick={() => {
            console.log('=== FINAL SUBMIT VALIDATION ===')
            console.log('Final form values:', form.getValues())
            console.log('Final form errors:', form.formState.errors)
            console.log('Agree to terms:', form.getValues('agreeToTerms'))
            
            if (!form.getValues('agreeToTerms')) {
              alert('You must agree to the terms and conditions')
              return
            }
            
            // Trigger form submission
            form.handleSubmit(handleSubmit)()
          }} disabled={loading} className="bg-green-600 hover:bg-green-700">
            {loading ? 'Booking...' : 'Confirm Booking'}
          </Button>
        </div>
      </div>
    )
  }

  const handleSubmit = async (data: AppointmentV2FormData) => {
    console.log('=== SUBMIT CALLED ===')
    console.log('Form data to submit:', data)
    console.log('Form validation errors:', form.formState.errors)
    
    setLoading(true)
    try {
      console.log('Sending request to /api/appointments/book-v2')
      const response = await fetch('/api/appointments/book-v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      console.log('Response status:', response.status)
      const result = await response.json()
      console.log('Response data:', result)
      
      if (result.success) {
        alert('✅ Appointment booked successfully!')
        // Reset form
        form.reset()
        setStep(1)
        setSelectedDoctor('')
        setSelectedDate(undefined)
        setSelectedTime(undefined)
      } else {
        alert(`❌ Error: ${result.error}`)
        if (result.details) {
          console.error('Validation details:', result.details)
        }
      }
    } catch (error) {
      console.error('Request failed:', error)
      alert('❌ Failed to book appointment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* REMOVED the duplicate hidden RadioGroup that was causing conflicts */}
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}
      {step === 5 && renderStep5()}
    </div>
  )
}