import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const URL  = process.env.NEXT_PUBLIC_STORAGE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const ANON = process.env.NEXT_PUBLIC_STORAGE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') || '/'

  if (code) {
    const sb = createClient(URL, ANON)
    await sb.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(new URL(next, req.url))
}