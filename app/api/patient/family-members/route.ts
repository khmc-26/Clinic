import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { z } from 'zod'


export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get patient record for logged in user
    const patient = await prisma.patient.findFirst({
      where: { user: { email: session.user.email } },
      include: { familyMembers: true }
    })

    if (!patient) {
      return NextResponse.json([], { status: 200 })
    }

    return NextResponse.json(patient.familyMembers)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch family members' }, { status: 500 })
  }
}

// Validation schema for family member
const familyMemberSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address").optional().or(z.literal('')),
  phone: z.string().regex(/^[0-9]{10}$/, "Phone must be 10 digits").optional().or(z.literal('')),
  relationship: z.enum(['SPOUSE', 'CHILD', 'PARENT', 'OTHER']),
  age: z.coerce.number().min(0).max(120).optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  medicalNotes: z.string().optional()
})

// POST: Create a new family member
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = familyMemberSchema.parse(body)

    // Get patient record for logged in user
    const patient = await prisma.patient.findFirst({
      where: { user: { email: session.user.email } }
    })

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    // Check if family member limit reached (max 3)
    const familyCount = await prisma.familyMember.count({
      where: { 
        patientId: patient.id,
        isActive: true 
      }
    })

    if (familyCount >= 3) {
      return NextResponse.json(
        { error: 'Maximum limit of 3 family members reached' },
        { status: 400 }
      )
    }

    // Check email uniqueness if provided
    if (validatedData.email) {
      const existingEmail = await prisma.familyMember.findFirst({
        where: {
          patientId: patient.id,
          email: validatedData.email,
          isActive: true
        }
      })

      if (existingEmail) {
        return NextResponse.json(
          { error: 'Email already exists in your family members' },
          { status: 400 }
        )
      }
    }

    // Create family member
    const familyMember = await prisma.familyMember.create({
      data: {
        patientId: patient.id,
        name: validatedData.name,
        email: validatedData.email || null,
        phone: validatedData.phone || null,
        relationship: validatedData.relationship,
        age: validatedData.age || null,
        gender: validatedData.gender || null,
        medicalNotes: validatedData.medicalNotes || null,
        isActive: true
      }
    })

    return NextResponse.json(familyMember, { status: 201 })
  } catch (error) {
    console.error('Error creating family member:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues }, // Changed from error.errors
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create family member' },
      { status: 500 }
    )
  }
}

// PUT: Update a family member
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'Family member ID is required' }, { status: 400 })
    }

    // Get patient record for logged in user
    const patient = await prisma.patient.findFirst({
      where: { user: { email: session.user.email } }
    })

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    // Check if family member belongs to this patient
    const existingMember = await prisma.familyMember.findFirst({
      where: { 
        id,
        patientId: patient.id,
        isActive: true 
      }
    })

    if (!existingMember) {
      return NextResponse.json({ error: 'Family member not found' }, { status: 404 })
    }

    // Check email uniqueness if updating email
    if (updateData.email && updateData.email !== existingMember.email) {
      const existingEmail = await prisma.familyMember.findFirst({
        where: {
          patientId: patient.id,
          email: updateData.email,
          isActive: true,
          NOT: { id }
        }
      })

      if (existingEmail) {
        return NextResponse.json(
          { error: 'Email already exists in your family members' },
          { status: 400 }
        )
      }
    }

    // Update family member
    const updatedMember = await prisma.familyMember.update({
      where: { id },
      data: {
        ...updateData,
        email: updateData.email || null,
        phone: updateData.phone || null
      }
    })

    return NextResponse.json(updatedMember)
  } catch (error) {
    console.error('Error updating family member:', error)
    return NextResponse.json(
      { error: 'Failed to update family member' },
      { status: 500 }
    )
  }
}

// DELETE: Soft delete a family member
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Family member ID is required' }, { status: 400 })
    }

    // Get patient record for logged in user
    const patient = await prisma.patient.findFirst({
      where: { user: { email: session.user.email } }
    })

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    // Check if family member belongs to this patient
    const existingMember = await prisma.familyMember.findFirst({
      where: { 
        id,
        patientId: patient.id 
      }
    })

    if (!existingMember) {
      return NextResponse.json({ error: 'Family member not found' }, { status: 404 })
    }

    // Soft delete (set isActive = false)
    await prisma.familyMember.update({
      where: { id },
      data: { isActive: false }
    })

    return NextResponse.json({ success: true, message: 'Family member deleted successfully' })
  } catch (error) {
    console.error('Error deleting family member:', error)
    return NextResponse.json(
      { error: 'Failed to delete family member' },
      { status: 500 }
    )
  }
}