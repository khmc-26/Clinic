// prisma/seed.ts - SIMPLIFIED (Only Admin Doctor)
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()
const saltRounds = 12

async function main() {
  console.log('🌱 Seeding database with admin doctor only...')
  
  // 1. Create admin user with doctor
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

  // 3. Create basic availability for admin doctor
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

  console.log('\n🎉 Seeding completed!')
  console.log('\n📋 ADMIN CREDENTIALS:')
  console.log('👨‍⚕️ Email: drkavithahc@gmail.com')
  console.log('🔐 Password: Doctor@2024')
  console.log('🎯 Role: ADMIN & DOCTOR')
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })