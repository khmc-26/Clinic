// lib/auth.ts - UPDATED for NextAuth v4
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import crypto from 'crypto'

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  return session?.user
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("Authentication required")
  }
  return user
}

export async function requireDoctor() {
  const user = await getCurrentUser()
  if (!user || user.email !== 'drkavithahc@gmail.com') {
    throw new Error("Doctor access required")
  }
  return user
}

// Magic link functions
export async function generateMagicToken(email: string) {
  const token = crypto.randomBytes(32).toString('hex')
  const expires = new Date()
  expires.setHours(expires.getHours() + 24)

  await prisma.verificationToken.deleteMany({
    where: { identifier: email }
  })

  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    }
  })

  return token
}

export async function validateMagicToken(email: string, token: string) {
  const verificationToken = await prisma.verificationToken.findFirst({
    where: {
      identifier: email,
      token,
      expires: { gt: new Date() }
    }
  })

  return !!verificationToken
}

export async function createUserFromEmail(email: string, name?: string) {
  let user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name,
        role: 'PATIENT',
        emailVerified: new Date(),
        patient: {
          create: {}
        }
      }
    })
  }

  return user
}