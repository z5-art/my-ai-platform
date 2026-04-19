import { createClient } from '@supabase/supabase-js'

const URL = process.env.NEXT_PUBLIC_STORAGE_SUPABASE_URL
  || process.env.NEXT_PUBLIC_SUPABASE_URL
  || ''

const SERVICE = process.env.STORAGE_SUPABASE_SERVICE_ROLE_KEY
  || process.env.SUPABASE_SERVICE_ROLE_KEY
  || ''

const db = createClient(URL, SERVICE, {
  auth: { autoRefreshToken: false, persistSession: false }
})

export async function checkAndDeductCredits(userId, cost, toolName, prompt) {
  if (userId === 'demo') return { success: true, balance: 999 }

  const { data, error } = await db.rpc('deduct_credits', {
    p_user_id: userId,
    p_amount:  cost,
    p_tool:    toolName,
    p_prompt:  prompt || null,
  })

  if (error) {
    console.error('deduct_credits error:', error.message)
    return { success: false, message: 'Database error' }
  }

  if (!data?.success) {
    return {
      success: false,
      message: data?.error === 'insufficient_credits'
        ? 'رصيدك غير كافٍ'
        : 'User not found',
      balance: data?.balance ?? 0,
    }
  }

  return { success: true, balance: data.balance }
}

export async function saveToGallery(userId, item) {
  if (userId === 'demo') return { success: true }
  const { error } = await db.from('gallery').insert({ user_id: userId, ...item })
  if (error) console.error('saveToGallery error:', error.message)
  return { success: !error }
}

export async function saveChatMessage(userId, role, content) {
  if (userId === 'demo') return
  const { error } = await db.from('chat_history').insert({ user_id: userId, role, content })
  if (error) console.error('saveChatMessage error:', error.message)
}