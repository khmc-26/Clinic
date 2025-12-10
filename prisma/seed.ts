// prisma/seed.ts - UPDATED WITH BCRYPT
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()
const saltRounds = 12

async function main() {
  console.log('🌱 Seeding database with security setup...')

  // 1. Ensure admin doctor exists
  let adminUser = await prisma.user.findUnique({
    where: { email: 'drkavithahc@gmail.com' }
  })

  if (!adminUser) {
    adminUser = await prisma.user.create({
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
            colorCode: '#EF4444' // Red for admin
          }
        }
      }
    })
    console.log('✅ Created admin doctor')
  } else {
    // Update existing doctor to be admin
    const adminDoctor = await prisma.doctor.findUnique({
      where: { userId: adminUser.id }
    })
    
    if (adminDoctor) {
      await prisma.doctor.update({
        where: { id: adminDoctor.id },
        data: {
          isAdmin: true,
          isActive: true,
          colorCode: '#EF4444'
        }
      })
      console.log('✅ Updated existing doctor to admin')
    }
  }

  // 2. Get the doctor record
  const adminDoctor = await prisma.doctor.findFirst({
    where: {
      user: {
        email: 'drkavithahc@gmail.com'
      }
    }
  })

  if (!adminDoctor) {
    throw new Error('Admin doctor not found')
  }

  // 3. Create secure credentials for admin
  const passwordHash = await bcrypt.hash('Doctor@2024', saltRounds)
  
  await prisma.doctorCredentials.upsert({
    where: { doctorId: adminDoctor.id },
    update: {
      email: 'drkavithahc@gmail.com',
      passwordHash,
      saltRounds,
      lastPasswordChange: new Date()
    },
    create: {
      doctorId: adminDoctor.id,
      email: 'drkavithahc@gmail.com',
      passwordHash,
      saltRounds,
      lastPasswordChange: new Date()
    }
  })

  console.log('✅ Admin credentials created')
  console.log('🎉 Seeding completed!')
  console.log('📧 Admin email: drkavithahc@gmail.com')
  console.log('🔐 Default password: Doctor@2024')
  console.log('⚠️  Note: Use password login with the credentials above')
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })