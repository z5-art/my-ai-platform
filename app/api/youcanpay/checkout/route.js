import { NextResponse } from 'next/server'

const PLANS = {
  pro:   { amount: 9900,  credits: 500,  name: 'Pro' },
  ultra: { amount: 29900, credits: 2000, name: 'Business' },
}

export async function POST(req) {
  try {
    const { planId, userId, email } = await req.json()
    if (!planId || !userId || !email)
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const plan = PLANS[planId]
    if (!plan)
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })

    const orderId = `${userId}_${planId}_${Date.now()}`
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || ''

    const res = await fetch('https://youcanpay.com/api/pay', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.YOUCAN_PAY_PRIVATE_KEY}`,
      },
      body: JSON.stringify({
        amount: plan.amount, currency: 'MAD', order_id: orderId,
        customer_email: email,
        success_url: `${appUrl}/?payment=success`,
        error_url:   `${appUrl}/?payment=failed`,
        webhook_url: `${appUrl}/api/youcanpay/webhook`,
      }),
    })

    const data = await res.json()
    if (!data?.checkout_url)
      return NextResponse.json({ error: 'Payment gateway error' }, { status: 502 })

    return NextResponse.json({ checkout_url: data.checkout_url, order_id: orderId })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}