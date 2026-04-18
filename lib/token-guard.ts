import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function checkAndDeductCredits(
  userId: string,
  cost: number,
  toolName: string,
  prompt?: string
) {
  // Demo user — skip DB check
  if (userId === 'demo') {
    return { success: true, balance: 999 }
  }

  const { data, error } = await supabase.rpc('deduct_credits', {
    p_user_id: userId,
    p_amount:  cost,
    p_tool:    toolName,
    p_prompt:  prompt || null,
  })

  if (error) {
    console.error('deduct_credits error:', error)
    return { success: false, message: 'Database error' }
  }

  if (!data.success) {
    return {
      success: false,
      message: data.error === 'insufficient_credits'
        ? 'رصيدك غير كافٍ'
        : 'User not found',
      balance: data.balance,
    }
  }

  return { success: true, balance: data.balance }
}

export async function getUserCredits(userId: string): Promise<number> {
  if (userId === 'demo') return 999

  const { data, error } = await supabase
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
  }
) {
  if (userId === 'demo') return { success: true }

  const { error } = await supabase
    .from('gallery')
    .insert({ user_id: userId, ...item })

  return { success: !error }
}

export async function saveChatMessage(
  userId: string,
  role: 'user' | 'assistant',
  content: string
) {
  if (userId === 'demo') return

  await supabase
    .from('chat_history')
    .insert({ user_id: userId, role, content })
}