// scripts/create-doctor.ts
import { prisma } from '@/lib/prisma'

async function createDoctor() {
  const doctorEmail = 'drkavithahc@gmail.com' // Use clinic email
  const doctorName = 'Dr. Kavitha Thomas'
  
  try {
    // 1. Create User
    const user = await prisma.user.create({
      data: {
        email: doctorEmail,
        name: doctorName,
        role: 'DOCTOR',
        emailVerified: new Date(),
      }
    })
    
    // 2. Create Doctor Profile
    const doctor = await prisma.doctor.create({
      data: {
        userId: user.id,
        specialization: 'Homoeopathy',
        qualifications: ['DHMS', 'MD (Homoeopathy)'],
        experience: 15,
        consultationFee: 300,
        bio: 'Dr. Kavitha Thomas with 15+ years experience in homoeopathic treatment...',
        achievements: ['5000+ Patients Treated', 'Specialist in Chronic Diseases']
      }
    })
    
    // 3. Set up availability (Monday-Saturday, 9AM-5PM)
    const days = [1, 2, 3, 4, 5, 6] // Monday to Saturday
    for (const day of days) {
      await prisma.doctorAvailability.create({
        data: {
          doctorId: doctor.id,
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '17:00',
          slotDuration: 30,
          maxPatients: 1
        }
      })
    }
    
    console.log('✅ Doctor created successfully!')
    console.log('User ID:', user.id)
    console.log('Doctor ID:', doctor.id)
    console.log('Email:', doctorEmail)
    
  } catch (error) {
    console.error('Error creating doctor:', error)
  }
}

createDoctor()