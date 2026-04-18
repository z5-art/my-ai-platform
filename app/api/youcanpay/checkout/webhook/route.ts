import { supabaseAdmin } from './supabase-server'

export async function checkAndDeductCredits(
  userId: string,
  cost: number,
  toolName: string,
  prompt?: string
) {
  if (userId === 'demo') return { success: true, balance: 999 }

  const { data, error } = await supabaseAdmin.rpc('deduct_credits', {
    p_user_id: userId,
    p_amount:  cost,
    p_tool:    toolName,
    p_prompt:  prompt || null,
  })

  if (error) {
    console.error('deduct_credits RPC error:', error.message)
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

export async function getUserCredits(userId: string): Promise<number> {
  if (userId === 'demo') return 999

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('credits')
    .eq('id', userId)
    .single()

  if (error || !data) return 0
  return data.credits ?? 0
}

export async function saveToGallery(
  userId: string,
  item: {
    type: 'image' | 'video'
    url: string
    prompt: string
    mode?: string
    style?: string
    duration?: string
    resolution?: string
    aspect_ratio?: string
    credits_used?: number
    thumbnail?: string
  }
) {
  if (userId === 'demo') return { success: true }

  const { error } = await supabaseAdmin
    .from('gallery')
    .insert({ user_id: userId, ...item })

  if (error) console.error('saveToGallery error:', error.message)
  return { success: !error }
}

export async function saveChatMessage(
  userId: string,
  role: 'user' | 'assistant',
  content: string
) {
  if (userId === 'demo') return

  const { error } = await supabaseAdmin
    .from('chat_history')
    .insert({ user_id: userId, role, content })

  if (error) console.error('saveChatMessage error:', error.message)
}