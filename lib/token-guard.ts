import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function checkAndDeductCredits(
  userId: string,
  cost: number
) {
  // تحقق من الرصيد
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('credits')
    .eq('id', userId)
    .single()

  if (error || !profile) {
    return { success: false, message: 'المستخدم غير موجود' }
  }

  if (profile.credits < cost) {
    return { success: false, message: 'رصيد غير كافٍ' }
  }

  // خصم الرصيد
  const { error: deductError } = await supabase
    .from('profiles')
    .update({ credits: profile.credits - cost })
    .eq('id', userId)

  if (deductError) {
    return { success: false, message: 'خطأ في خصم الرصيد' }
  }

  // تسجيل العملية
  await supabase
    .from('usage')
    .insert({
      user_id: userId,
      tool_name: 'chat',
      created_at: new Date().toISOString()
    })

  return { success: true }
}