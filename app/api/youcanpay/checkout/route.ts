import { NextRequest, NextResponse } from 'next/server'
import { createCheckoutSession } from '@/lib/youcanpay'

const PLANS = {
  starter: { amount: 9900, credits: 100, name: 'Starter' },
  pro: { amount: 29900, credits: 500, name: 'Pro' },
  unlimited: { amount: 59900, credits: 2000, name: 'Unlimited' }
}

export async function POST(req: NextRequest) {
  try {
    const { planId, userId, email } = await req.json()

    const plan = PLANS[planId as keyof typeof PLANS]
    if (!plan) {
      return NextResponse.json(
        { error: 'خطة غير موجودة' },
        { status: 400 }
      )
    }

    const orderId = `${userId}_${planId}_${Date.now()}`

    const session = await createCheckoutSession(
      plan.amount,
      'MAD',
      orderId,
      email
    )

    return NextResponse.json({
      checkout_url: session.checkout_url,
      order_id: orderId
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'حدث خطأ' },
      { status: 500 }
    )
  }
}