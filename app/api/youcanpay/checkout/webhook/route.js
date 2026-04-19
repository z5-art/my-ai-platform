import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

const URL = process.env.NEXT_PUBLIC_STORAGE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SERVICE = process.env.STORAGE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const db = createClient(URL, SERVICE, { auth: { autoRefreshToken: false, persistSession: false } })

const CREDITS = { pro: 500, ultra: 2000 }

export async function POST(req) {
  try {
    const body = await req.text()
    const sig  = req.headers.get('x-youcanpay-signature') || ''
    const secret = process.env.YOUCAN_PAY_PRIVATE_KEY || ''

    if (secret && sig) {
      const hmac = crypto.createHmac('sha256', secret).update(body).digest('hex')
      if (!crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(sig)))
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const payload = JSON.parse(body)

    if (payload.event === 'payment.success') {
      const [userId, planId] = (payload.order_id || '').split('_')
      const credits = CREDITS[planId]
      if (!userId || !credits)
        return NextResponse.json({ error: 'Invalid order' }, { status: 400 })

      await db.rpc('add_credits', {
        p_user_id: userId, p_amount: credits,
        p_plan: planId, p_description: `Purchase: ${planId}`
      })

      await db.from('subscriptions').insert({
        user_id: userId, plan_type: planId, status: 'active',
        expires_at: new Date(Date.now() + 30*24*60*60*1000).toISOString()
      })
    }

    return NextResponse.json({ received: true })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}