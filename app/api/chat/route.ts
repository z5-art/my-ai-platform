import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { checkAndDeductCredits, saveChatMessage } from '@/lib/token-guard'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export async function POST(req: NextRequest) {
  try {
    const { messages, userId } = await req.json()

    if (!messages || !userId) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // Check & deduct 1 credit
    const check = await checkAndDeductCredits(userId, 1, 'chat', messages[messages.length - 1]?.content)
    if (!check.success) {
      return NextResponse.json({ error: check.message }, { status: 402 })
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: 'You are a helpful AI assistant on a creative platform called Ibda3 AI. Always respond in the same language the user writes in.',
      messages,
    })

    const reply = response.content[0].type === 'text' ? response.content[0].text : ''

    // Save to chat history
    await saveChatMessage(userId, 'assistant', reply)

    return NextResponse.json({ content: reply, balance: check.balance })

  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}