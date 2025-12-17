// prisma/seed.ts - FIXED VERSION
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()
const saltRounds = 12

async function main() {
  console.log('🌱 Seeding database with availability...')
  
  // Clean up existing data first
  console.log('🗑️  Cleaning up existing data...')
  await prisma.auditLog.deleteMany()
  await prisma.appointment.deleteMany()
  await prisma.familyMember.deleteMany()
  await prisma.patient.deleteMany()
  await prisma.doctorCredentials.deleteMany()
  await prisma.doctorAvailability.deleteMany()
  await prisma.doctor.deleteMany()
  await prisma.user.deleteMany()
  
  console.log('✅ Cleanup completed')

  // 1. Create admin user with doctor (using upsert)
  const adminUser = await prisma.user.create({
    data: {
      email: 'drkavithahc@gmail.com',
      name: 'Dr. Kavitha Thomas',
      role: 'ADMIN',
      emailVerified: new Date(),
      doctor: {
        create: {
          specialization: 'Homoeopathy',
          qualifications: ['BHMS', 'MD'],
          experience: 15,
          consultationFee: 300,
          isAdmin: true,
          isActive: true,
          colorCode: '#EF4444'
        }
      }
    },
    include: { doctor: true }
  })
  console.log('✅ Admin doctor created')

  // 2. Create admin credentials
  const passwordHash = await bcrypt.hash('Doctor@2024', saltRounds)
  await prisma.doctorCredentials.create({
    data: {
      doctorId: adminUser.doctor!.id,
      email: 'drkavithahc@gmail.com',
      passwordHash,
      saltRounds,
      lastPasswordChange: new Date()
    }
  })
  console.log('✅ Admin credentials created')

  // 3. Create test doctor
  const testDoctor = await prisma.user.create({
    data: {
      email: 'testdoctor@example.com',
      name: 'Dr. Test Specialist',
      role: 'DOCTOR',
      emailVerified: new Date(),
      doctor: {
        create: {
          specialization: 'Pediatrics',
          qualifications: ['BHMS'],
          experience: 8,
          consultationFee: 250,
          isAdmin: false,
          isActive: true,
          colorCode: '#3B82F6'
        }
      }
    },
    include: { doctor: true }
  })
  console.log('✅ Test doctor created')

  // 4. Create YOUR patient account
  const yourPatient = await prisma.user.create({
    data: {
      email: 'noelmathews123@gmail.com',
      name: 'Noel Mathews',
      phone: '9876543210',
      role: 'PATIENT',
      emailVerified: new Date(),
      patient: {
        create: {
          age: 35,
          gender: 'MALE',
          isPrimaryFamilyMember: true
        }
      }
    },
    include: { patient: true }
  })
  console.log('✅ Your patient account created')

  // 5. Create availability for admin doctor
  const availabilityDays = [
    { day: 1, start: '09:00', end: '17:00', slotDuration: 30, maxPatients: 1 },
    { day: 2, start: '09:00', end: '17:00', slotDuration: 30, maxPatients: 1 },
    { day: 3, start: '09:00', end: '17:00', slotDuration: 30, maxPatients: 1 },
    { day: 4, start: '09:00', end: '17:00', slotDuration: 30, maxPatients: 1 },
    { day: 5, start: '09:00', end: '17:00', slotDuration: 30, maxPatients: 1 },
    { day: 6, start: '09:00', end: '13:00', slotDuration: 30, maxPatients: 1 },
  ]

  for (const day of availabilityDays) {
    await prisma.doctorAvailability.create({
      data: {
        doctorId: adminUser.doctor!.id,
        dayOfWeek: day.day,
        startTime: day.start,
        endTime: day.end,
        isActive: true,
        slotDuration: day.slotDuration,
        maxPatients: day.maxPatients
      }
    })
  }
  console.log('✅ Created availability for admin doctor')

  // 6. Create availability for test doctor
  for (const day of availabilityDays.slice(0, 5)) {
    await prisma.doctorAvailability.create({
      data: {
        doctorId: testDoctor.doctor!.id,
        dayOfWeek: day.day,
        startTime: '10:00',
        endTime: '16:00',
        isActive: true,
        slotDuration: 45,
        maxPatients: 1
      }
    })
  }
  console.log('✅ Created availability for test doctor')

  // 7. Create one family member
  await prisma.familyMember.create({
    data: {
      patientId: yourPatient.patient!.id,
      name: 'Sarah Mathews',
      relationship: 'SPOUSE',
      age: 32,
      gender: 'FEMALE'
    }
  })
  console.log('✅ Family member created')

  // 8. Create audit log
  await prisma.auditLog.create({
    data: {
      action: 'SEED_DATA',
      entityType: 'SYSTEM',
      userEmail: 'system@seed.com',
      userRole: 'SYSTEM',
      ipAddress: '127.0.0.1',
      userAgent: 'Seed Script',
      requestPath: '/api/seed',
      requestMethod: 'POST',
      metadata: { seedVersion: '3.0' },
      success: true
    }
  })
  console.log('✅ Audit log created')

  console.log('\n🎉 Seeding completed!')
  console.log('\n📋 TEST DATA SUMMARY:')
  console.log('👨‍⚕️ Admin: drkavithahc@gmail.com / Doctor@2024')
  console.log('👨‍⚕️ Test Doctor: testdoctor@example.com')
  console.log('👤 You: noelmathews123@gmail.com (Google OAuth)')
  console.log('👩 Spouse: Sarah Mathews (family member)')
  console.log('📅 Availability: Both doctors have weekly schedules')
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })