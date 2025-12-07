// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create Doctor first
  const doctorUser = await prisma.user.create({
    data: {
      email: 'drkavithathomas@example.com',
      name: 'Dr. Kavitha Thomas',
      phone: '+919847000000',
      role: 'DOCTOR',
      emailVerified: new Date(),
    }
  })

  const doctor = await prisma.doctor.create({
    data: {
      userId: doctorUser.id,
      specialization: 'Homoeopathy',
      qualifications: ['DHMS', 'MD (Homoeopathy)'],
      experience: 15,
      consultationFee: 300,
      bio: 'Experienced homoeopathic doctor...',
      achievements: ['Best Homoeopathic Doctor Award 2020', 'Published 5 research papers'],
    }
  })

  // Create Doctor Availabilities
  await prisma.doctorAvailability.createMany({
    data: [
      { doctorId: doctor.id, dayOfWeek: 1, startTime: '09:00', endTime: '17:00' },
      { doctorId: doctor.id, dayOfWeek: 2, startTime: '09:00', endTime: '17:00' },
      { doctorId: doctor.id, dayOfWeek: 3, startTime: '09:00', endTime: '17:00' },
      { doctorId: doctor.id, dayOfWeek: 4, startTime: '09:00', endTime: '17:00' },
      { doctorId: doctor.id, dayOfWeek: 5, startTime: '09:00', endTime: '17:00' },
      { doctorId: doctor.id, dayOfWeek: 6, startTime: '09:00', endTime: '14:00' },
    ]
  })

  // Create Patient
  const patientUser = await prisma.user.create({
    data: {
      email: 'patient@example.com',
      name: 'John Doe',
      phone: '+919876543210',
      role: 'PATIENT',
      emailVerified: new Date(),
    }
  })

  const patient = await prisma.patient.create({
    data: {
      userId: patientUser.id,
      age: 35,
      gender: 'Male',
      address: 'Kozhikode, Kerala',
      allergies: 'None',
      bloodGroup: 'O+'
    }
  })

  // Create Appointment
  const appointmentDate = new Date()
  appointmentDate.setDate(appointmentDate.getDate() + 2)
  appointmentDate.setHours(10, 0, 0, 0)

  const appointment = await prisma.appointment.create({
    data: {
      patientId: patient.id,
      doctorId: doctor.id,
      appointmentDate: appointmentDate,
      appointmentType: 'IN_PERSON',
      status: 'CONFIRMED',
      serviceType: 'GENERAL_CONSULTATION',
      symptoms: 'Persistent headache and fatigue',
      duration: 30
    }
  })

  console.log('Seeding completed successfully!')
}