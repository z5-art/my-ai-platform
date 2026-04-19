import { NextResponse } from 'next/server'
import { checkAndDeductCredits, saveToGallery } from '../../lib/token-guard'

const COSTS = { text2video: 50, img2video: 60, effects: 40, lipsync: 70 }

export async function POST(req) {
  try {
    const { prompt, mode, duration, aspect, resolution, userId } = await req.json()
    if (!prompt || !userId)
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const cost = COSTS[mode] ?? 50
    const check = await checkAndDeductCredits(userId, cost, `video_${mode}`, prompt)
    if (!check.success)
      return NextResponse.json({ error: check.message }, { status: 402 })

    // Placeholder — replace with Kling API later
    const thumbnail = `https://picsum.photos/seed/${Date.now()}/640/360`

    await saveToGallery(userId, {
      type: 'video', url: thumbnail, thumbnail, prompt,
      mode: mode || 'text2video',
      duration: duration || '5',
      resolution: resolution || '720p',
      aspect_ratio: aspect || '16:9',
      credits_used: cost,
    })

    return NextResponse.json({ thumbnail, balance: check.balance, status: 'processing' })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}