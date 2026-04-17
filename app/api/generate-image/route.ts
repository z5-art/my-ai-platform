import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  return NextResponse.json(
    { message: 'قريباً' },
    { status: 200 }
  )
}