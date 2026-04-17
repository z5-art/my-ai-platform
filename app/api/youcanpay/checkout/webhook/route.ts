import { NextRequest, NextResponse } from 'next/server'
import { verifyHmacSignature } from '@/lib/youcanpay'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const PLANS_CREDITS = {
  starter: 100,
  pro: 500,
  unlimited: 2000
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get('x-youcanpay-signature') || ''

    // التحقق من صحة الطلب
    const isValid = verifyHmacSignature(
      body,
      signature,
      process.env.YOUCAN_PAY_PRIVATE_KEY!
    )

    if (!isValid) {
      return NextResponse.json(
        { error: 'توقيع غير صحيح' },
        { status: 401 }
      )
    }

    const payload = JSON.parse(body)

    if (payload.event === 'payment.success') {
      const orderId = payload.order_id
      const [userId, planId] = orderId.split('_')

      const credits = PLANS_CREDITS[planId as keyof typeof PLANS_CREDITS] || 0

      // تحديث الخطة والرصيد
      await supabase
        .from('profiles')
        .update({
          plan: planId,
          credits: credits
        })
        .eq('id', userId)

      // تسجيل الاشتراك
      await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          plan_type: planId,
          created_at: new Date().toISOString()
        })

      // تسجيل حركة التوكنز
      await supabase
        .from('credit_transactions')
        .insert({
          user_id: userId,
          amount: credits,
          type: 'purchase',
          created_at: new Date().toISOString()
        })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    return NextResponse.json(
      { error: 'حدث خطأ' },
      { status: 500 }
    )
  }
}