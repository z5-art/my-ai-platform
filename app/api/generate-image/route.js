import { NextResponse } from 'next/server'
import { checkAndDeductCredits, saveToGallery } from '../../lib/token-guard'

export async function POST(req) {
  try {
    const { prompt, style, userId } = await req.json()
    if (!prompt || !userId)
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const check = await checkAndDeductCredits(userId, 10, 'image', prompt)
    if (!check.success)
      return NextResponse.json({ error: check.message }, { status: 402 })

    // Placeholder — replace with real image API later
    const seed = encodeURIComponent(prompt).slice(0, 20) + Date.now()
    const url = `https://picsum.photos/seed/${seed}/800/600`

    await saveToGallery(userId, { type: 'image', url, prompt, style: style || 'realistic', credits_used: 10 })

    return NextResponse.json({ url, balance: check.balance })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}