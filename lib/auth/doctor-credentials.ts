// lib/auth/doctor-credentials.ts - FULL IMPLEMENTATION
import bcrypt from 'bcrypt'
import { prisma } from '@/lib/prisma'

export class DoctorCredentialsService {
  // Check if email is registered doctor
  static async isRegisteredDoctor(email: string): Promise<boolean> {
    const doctor = await prisma.doctor.findFirst({
      where: {
        user: {
          email: email.toLowerCase()
        },
        isActive: true
      }
    })
    return !!doctor
  }

  // Validate doctor credentials
  static async validateCredentials(email: string, password: string) {
    const credentials = await prisma.doctorCredentials.findFirst({
      where: {
        email: email.toLowerCase()
      },
      include: {
        doctor: {
          include: {
            user: true
          }
        }
      }
    })

    if (!credentials) {
      return { valid: false, doctor: null }
    }

    // Check if account is locked
    if (credentials.lockedUntil && credentials.lockedUntil > new Date()) {
      return { valid: false, doctor: null, locked: true }
    }

    // Verify password
    const isValid = await bcrypt.compare(password, credentials.passwordHash)
    
    // Log the attempt
    await this.logLoginAttempt(email, credentials.doctorId, isValid)

    if (!isValid) {
      // Increment failed attempts
      const newAttempts = credentials.failedAttempts + 1
      
      if (newAttempts >= 5) {
        // Lock account for 15 minutes
        const lockedUntil = new Date(Date.now() + 15 * 60 * 1000)
        await prisma.doctorCredentials.update({
          where: { id: credentials.id },
          data: {
            failedAttempts: newAttempts,
            lockedUntil
          }
        })
      } else {
        await prisma.doctorCredentials.update({
          where: { id: credentials.id },
          data: { failedAttempts: newAttempts }
        })
      }
      
      return { valid: false, doctor: null }
    }

    // Reset failed attempts on successful login
    await prisma.doctorCredentials.update({
      where: { id: credentials.id },
      data: {
        failedAttempts: 0,
        lockedUntil: null
      }
    })

    return {
      valid: true,
      doctor: {
        id: credentials.doctor.user.id,
        email: credentials.doctor.user.email,
        name: credentials.doctor.user.name,
        isAdmin: credentials.doctor.isAdmin,
        doctorId: credentials.doctor.id
      }
    }
  }

  // Log login attempts
  static async logLoginAttempt(
    email: string, 
    doctorId: string | null, 
    success: boolean,
    attemptType: string = 'password',
    ipAddress?: string,
    userAgent?: string
  ) {
    await prisma.loginLog.create({
      data: {
        email,
        doctorId,
        ipAddress,
        userAgent,
        success,
        attemptType,
        errorMessage: success ? null : 'Invalid credentials'
      }
    })
  }

  // Change password with validation
  static async changePassword(
    doctorId: string,
    currentPassword: string,
    newPassword: string
  ) {
    const credentials = await prisma.doctorCredentials.findUnique({
      where: { doctorId }
    })

    if (!credentials) {
      throw new Error('Credentials not found')
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, credentials.passwordHash)
    if (!isValid) {
      throw new Error('Current password is incorrect')
    }

    // Validate new password strength
    this.validatePasswordStrength(newPassword)

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, credentials.saltRounds)

    // Update password
    await prisma.doctorCredentials.update({
      where: { doctorId },
      data: {
        passwordHash,
        lastPasswordChange: new Date(),
        failedAttempts: 0,
        lockedUntil: null
      }
    })
  }

  // Password strength validation
  private static validatePasswordStrength(password: string) {
    const minLength = 8
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    if (password.length < minLength) {
      throw new Error(`Password must be at least ${minLength} characters`)
    }
    if (!hasUpperCase) {
      throw new Error('Password must contain at least one uppercase letter')
    }
    if (!hasLowerCase) {
      throw new Error('Password must contain at least one lowercase letter')
    }
    if (!hasNumbers) {
      throw new Error('Password must contain at least one number')
    }
    if (!hasSpecialChar) {
      throw new Error('Password must contain at least one special character')
    }
  }
}