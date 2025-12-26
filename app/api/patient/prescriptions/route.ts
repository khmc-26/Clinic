// /app/api/patient/prescriptions/route.ts - COMING SOON
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Prescriptions feature is coming soon',
    prescriptions: [],
    availableSoon: true
  })
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Prescriptions feature is coming soon' },
    { status: 403 }
  )
}