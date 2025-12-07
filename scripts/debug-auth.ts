import { prisma } from '@/lib/prisma'
import { config } from 'dotenv'
import path from 'path'
config({ path: path.resolve(process.cwd(), '.env.local') })


async function debugAuth() {
  console.log('=== AUTH DEBUG SCRIPT ===')
  
  // 1. Check doctor user
  const doctorUser = await prisma.user.findUnique({
    where: { email: 'drkavithahc@gmail.com' },
    select: { id: true, email: true, role: true, emailVerified: true }
  })
  
  console.log('1. Doctor User:', doctorUser)
  
  // 2. Check if doctor profile exists
  if (doctorUser) {
    const doctorProfile = await prisma.doctor.findUnique({
      where: { userId: doctorUser.id }
    })
    console.log('2. Doctor Profile:', doctorProfile)
  }
  
  // 3. Check any existing sessions
  const sessions = await prisma.session.findMany({
    where: { userId: doctorUser?.id },
    take: 5
  })
  console.log('3. Recent Sessions:', sessions.length)
  
  // 4. Create a test session token if needed
  const testToken = Math.random().toString(36).substring(2)
  console.log('4. Test token (for manual testing):', testToken)
  
  console.log('=== END DEBUG ===')
}

debugAuth().catch(console.error)