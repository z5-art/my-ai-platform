import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { checkAndDeductCredits } from '@/lib/token-guard'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export async function POST(req: NextRequest) {
  try {
    const { messages, userId } = await req.json()

    // التحقق من الرصيد
    const check = await checkAndDeductCredits(userId, 1)
    if (!check.success) {
      return NextResponse.json(
        { error: 'رصيدك غير كافٍ' },
        { status: 402 }
      )
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages
    })

    return NextResponse.json({
      content: response.content[0].type === 'text'
        ? response.content[0].text
        : ''
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'حدث خطأ' },
      { status: 500 }
    )
  }
}