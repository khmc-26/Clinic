// /app/api/appointments/[id]/merge/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { z } from 'zod'

const mergeResolutionSchema = z.object({
  resolutionType: z.enum(['SELF', 'FAMILY', 'NEW']),
  familyMemberId: z.string().optional(),
  // For NEW resolution (Add as Family Member)
  patientName: z.string().optional(),
  relationship: z.enum(['SPOUSE', 'CHILD', 'PARENT', 'OTHER']).optional(),
  age: z.coerce.number().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  // For keeping separate
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

    // Start transaction for data consistency
    const result = await prisma.$transaction(async (tx) => {
      let mergedToPatientId: string | null = null
      let mergedToFamilyMemberId: string | null = null
      let mergeResolutionNotes = ''
      let updatedPatientId = appointment.patientId
      let updatedFamilyMemberId = appointment.familyMemberId

      switch (validatedData.resolutionType) {
        case 'SELF': {
  // If keepSeparate is true, just mark as resolved without merging
  if (validatedData.keepSeparate) {
    mergedToPatientId = null
    mergeResolutionNotes = 'Kept as separate record'
    
    // Just mark as resolved without changing anything
    const updatedAppointment = await tx.appointment.update({
      where: { id: appointmentId },
      data: {
        requiresMerge: false,
        mergeResolvedAt: new Date(),
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
    
    return updatedAppointment
  }
  
  // Original SELF merge logic
  mergedToPatientId = currentPatient.id
  mergeResolutionNotes = `Merged to logged-in user: ${session.user.email}`
  
  // Update appointment with user's details
  updatedPatientId = currentPatient.id
  
  mergeResolutionNotes += ` (Appointment updated to match user: ${currentPatient.user.name})`
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
          
          // FIXED: Update appointment to match family member (not family member to match appointment)
          updatedPatientId = currentPatient.id
          updatedFamilyMemberId = familyMember.id
          
          mergeResolutionNotes = `Merged to family member: ${familyMember.name}`
          
          // FIXED: Do NOT update family member info - appointment should match existing family member
          mergeResolutionNotes += ` (Appointment updated to match existing family member)`
          break
        }

        case 'NEW': {
          // Add as new family member
          if (!validatedData.patientName) {
            throw new Error('Patient name is required for NEW resolution')
          }

          // Create new family member with appointment info
          const newFamilyMember = await tx.familyMember.create({
            data: {
              patientId: currentPatient.id,
              name: validatedData.patientName,
              email: appointment.originalPatientEmail || null,
              phone: appointment.originalPatientPhone || null,
              relationship: validatedData.relationship || 'OTHER',
              age: validatedData.age || null,
              gender: validatedData.gender || null,
              medicalNotes: appointment.symptoms || null,
              isActive: true
            }
          })

          mergedToPatientId = currentPatient.id
          mergedToFamilyMemberId = newFamilyMember.id
          updatedPatientId = currentPatient.id
          updatedFamilyMemberId = newFamilyMember.id
          
          mergeResolutionNotes = `Added as new family member: ${validatedData.patientName}`
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
          // FIXED: Update patient and family member references on appointment
          patientId: updatedPatientId,
          familyMemberId: updatedFamilyMemberId,
          // FIXED: Update appointment details to match the target (user or family member)
          ...(updatedPatientId === currentPatient.id && {
            // If merged to user, update appointment patient details to match user
            originalPatientName: currentPatient.user.name || appointment.originalPatientName,
            originalPatientEmail: currentPatient.user.email,
            originalPatientPhone: currentPatient.user.phone || appointment.originalPatientPhone
          }),
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