import crypto from 'crypto'

export function verifyHmac(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret).update(payload).digest('hex')
  return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(signature))
}