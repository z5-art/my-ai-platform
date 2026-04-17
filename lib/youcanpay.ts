import crypto from 'crypto'

export function verifyHmacSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const hmac = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')
  return hmac === signature
}

export async function createCheckoutSession(
  amount: number,
  currency: string,
  orderId: string,
  customerEmail: string
) {
  const response = await fetch(
    'https://youcanpay.com/api/pay',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.YOUCAN_PAY_PRIVATE_KEY}`
      },
      body: JSON.stringify({
        amount,
        currency,
        order_id: orderId,
        customer_email: customerEmail,
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success`,
        error_url: `${process.env.NEXT_PUBLIC_APP_URL}/error`
      })
    }
  )

  const data = await response.json()
  return data
}