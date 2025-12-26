// /app/api/patient/export-data/route.ts - DISABLED EXPORT
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: false,
      message: 'Data export functionality is currently unavailable. For medical records, please contact the clinic directly.',
      availableSoon: true,
      estimatedDate: 'Q1 2025'
    })

  } catch (error) {
    console.error('Export data error:', error)
    return NextResponse.json(
      { error: 'Failed to process export request' },
      { status: 500 }
    )
  }
}