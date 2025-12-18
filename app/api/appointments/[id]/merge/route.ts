// /app/api/appointments/[id]/merge/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { z } from 'zod'

// Validation schema for merge resolution
const mergeResolutionSchema = z.object({
  resolutionType: z.enum(['SELF', 'FAMILY', 'NEW']),
  familyMemberId: z.string().optional(),
  patientName: z.string().optional(),
  patientEmail: z.string().email().optional(),
  keepSeparate: z.boolean().optional()
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const appointmentId = params.id
    if (!appointmentId) {
      return NextResponse.json(
        { success: false, error: 'Appointment ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedData = mergeResolutionSchema.parse(body)

    // Get patient record for logged in user
    const currentPatient = await prisma.patient.findFirst({
      where: { user: { email: session.user.email } },
      include: { user: true }
    })

    if (!currentPatient) {
      return NextResponse.json(
        { success: false, error: 'Patient not found' },
        { status: 404 }
      )
    }

    // Get the appointment
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: {
          include: { user: true }
        },
        familyMember: true
      }
    })

    if (!appointment) {
      return NextResponse.json(
        { success: false, error: 'Appointment not found' },
        { status: 404 }
      )
    }

    // Verify user has permission to resolve this merge
    const canResolve = 
      appointment.bookedByPatientId === currentPatient.id ||
      (appointment.familyMember && appointment.familyMember.patientId === currentPatient.id) ||
      appointment.originalPatientEmail === session.user.email

    if (!canResolve) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to resolve this merge' },
        { status: 403 }
      )
    }

    // Start transaction for data consistency
    const result = await prisma.$transaction(async (tx) => {
      let mergedToPatientId: string | null = null
      let mergedToFamilyMemberId: string | null = null
      let mergeResolutionNotes = ''

      switch (validatedData.resolutionType) {
        case 'SELF': {
          // Merge to logged-in user's account
          mergedToPatientId = currentPatient.id
          mergeResolutionNotes = `Merged to logged-in user: ${session.user.email}`
          
          // Update user info if different
          if (appointment.originalPatientName && 
              appointment.originalPatientName !== currentPatient.user.name) {
            await tx.user.update({
              where: { id: currentPatient.userId },
              data: { name: appointment.originalPatientName }
            })
            mergeResolutionNotes += ` (Updated name to: ${appointment.originalPatientName})`
          }
          break
        }

        case 'FAMILY': {
          if (!validatedData.familyMemberId) {
            throw new Error('Family member ID is required for FAMILY resolution')
          }

          // Verify family member belongs to current patient
          const familyMember = await tx.familyMember.findFirst({
            where: {
              id: validatedData.familyMemberId,
              patientId: currentPatient.id,
              isActive: true
            }
          })

          if (!familyMember) {
            throw new Error('Family member not found or not active')
          }

          mergedToPatientId = currentPatient.id
          mergedToFamilyMemberId = familyMember.id
          mergeResolutionNotes = `Merged to family member: ${familyMember.name}`
          
          // Update family member info if different
          const updates: any = {}
          if (appointment.originalPatientName && 
              appointment.originalPatientName !== familyMember.name) {
            updates.name = appointment.originalPatientName
          }
          if (appointment.originalPatientEmail && 
              appointment.originalPatientEmail !== familyMember.email) {
            updates.email = appointment.originalPatientEmail
          }
          if (appointment.originalPatientPhone && 
              appointment.originalPatientPhone !== familyMember.phone) {
            updates.phone = appointment.originalPatientPhone
          }
          
          if (Object.keys(updates).length > 0) {
            await tx.familyMember.update({
              where: { id: familyMember.id },
              data: updates
            })
            mergeResolutionNotes += ` (Updated information)`
          }
          break
        }

        case 'NEW': {
          // Keep as separate patient - just mark as resolved
          mergeResolutionNotes = 'Kept as separate patient record'
          
          // Update the patient record with original information
          if (appointment.originalPatientName || appointment.originalPatientEmail) {
            await tx.patient.update({
              where: { id: appointment.patientId },
              data: {
                user: {
                  update: {
                    ...(appointment.originalPatientName && { name: appointment.originalPatientName }),
                    ...(appointment.originalPatientEmail && { email: appointment.originalPatientEmail }),
                    ...(appointment.originalPatientPhone && { phone: appointment.originalPatientPhone })
                  }
                }
              }
            })
          }
          break
        }
      }

      // Update appointment with merge resolution
      const updatedAppointment = await tx.appointment.update({
        where: { id: appointmentId },
        data: {
          requiresMerge: false,
          mergeResolvedAt: new Date(),
          mergedToPatientId,
          mergedToFamilyMemberId,
          mergeNotes: appointment.mergeNotes 
            ? `${appointment.mergeNotes} | RESOLVED: ${mergeResolutionNotes}`
            : `RESOLVED: ${mergeResolutionNotes}`
        },
        include: {
          patient: {
            include: { user: true }
          },
          familyMember: true
        }
      })

      // Create audit log
      await tx.auditLog.create({
        data: {
          action: 'MERGE_RESOLUTION',
          entityType: 'APPOINTMENT',
          entityId: appointmentId,
          userId: currentPatient.userId,
          userEmail: session.user.email,
          userRole: 'PATIENT',
          oldData: appointment,
          newData: updatedAppointment,
          metadata: {
            resolutionType: validatedData.resolutionType,
            familyMemberId: validatedData.familyMemberId,
            mergeResolutionNotes
          },
          requestPath: request.url,
          requestMethod: 'POST'
        }
      })

      return updatedAppointment
    })

    return NextResponse.json({
      success: true,
      message: 'Merge resolved successfully',
      appointment: result
    })
  } catch (error: any) {
    console.error('Error resolving merge:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Validation failed',
          details: error.issues.map(e => ({
            path: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to resolve merge' 
      },
      { status: 500 }
    )
  }
}