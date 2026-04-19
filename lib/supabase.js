import { createClient } from '@supabase/supabase-js'

const URL = process.env.NEXT_PUBLIC_STORAGE_SUPABASE_URL
  || process.env.NEXT_PUBLIC_SUPABASE_URL
  || ''

const ANON = process.env.NEXT_PUBLIC_STORAGE_SUPABASE_ANON_KEY
  || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  || ''

const SERVICE = process.env.STORAGE_SUPABASE_SERVICE_ROLE_KEY
  || process.env.SUPABASE_SERVICE_ROLE_KEY
  || ''

// Browser client (anon key)
export const supabase = createClient(URL, ANON)

// Server/admin client (service role - never expose to browser)
export const supabaseAdmin = createClient(URL, SERVICE, {
  auth: { autoRefreshToken: false, persistSession: false }
})