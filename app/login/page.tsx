'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [message, setMessage] = useState('')

  const handleAuth = async () => {
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setMessage(error.message)
      else setMessage('تحقق من بريدك الإلكتروني!')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage(error.message)
      else window.location.href = '/'
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '100px auto', padding: 20 }}>
      <h1>{isSignUp ? 'إنشاء حساب' : 'تسجيل الدخول'}</h1>
      <input
        type="email"
        placeholder="البريد الإلكتروني"
        value={email}
        onChange={e => setEmail(e.target.value)}
        style={{ width: '100%', padding: 10, marginBottom: 10 }}
      />
      <input
        type="password"
        placeholder="كلمة المرور"
        value={password}
        onChange={e => setPassword(e.target.value)}
        style={{ width: '100%', padding: 10, marginBottom: 10 }}
      />
      <button
        onClick={handleAuth}
        style={{ width: '100%', padding: 10, background: '#6366f1', color: 'white', border: 'none', borderRadius: 8 }}
      >
        {isSignUp ? 'إنشاء حساب' : 'دخول'}
      </button>
      <p style={{ marginTop: 10, cursor: 'pointer', color: '#6366f1' }}
        onClick={() => setIsSignUp(!isSignUp)}>
        {isSignUp ? 'عندي حساب — تسجيل الدخول' : 'ليس لدي حساب — إنشاء حساب'}
      </p>
      {message && <p style={{ color: 'red' }}>{message}</p>}
    </div>
  )
}