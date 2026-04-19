import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { checkAndDeductCredits, saveChatMessage } from '../../lib/token-guard'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req) {
  try {
    const { messages, userId } = await req.json()
    if (!messages?.length || !userId)
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const safe = messages
      .filter(m => ['user','assistant'].includes(m.role))
      .map(m => ({ role: m.role, content: String(m.content).slice(0, 4000) }))

    const check = await checkAndDeductCredits(userId, 1, 'chat', safe.at(-1)?.content)
    if (!check.success)
      return NextResponse.json({ error: check.message }, { status: 402 })

    const res = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: 'You are a helpful AI assistant on Ibda3 AI platform. Respond in the same language as the user.',
      messages: safe,
    })

    const reply = res.content[0]?.type === 'text' ? res.content[0].text : ''
    await saveChatMessage(userId, 'assistant', reply)

    return NextResponse.json({ content: reply, balance: check.balance })
  } catch (e) {
    console.error('Chat error:', e?.message)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}