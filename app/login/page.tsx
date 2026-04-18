'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://uiehcsmidizvmebkypgg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpZWhjc21sZGl6dm1lYmt5cGdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4OTI0MDgsImV4cCI6MjA2MDQ2ODQwOH0'
)


export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [message, setMessage] = useState('')

  const handleAuth = async () => {
    if (isSignUp) {
      if (!firstName || !lastName || !phone || !email || !password) {
        setMessage('يرجى ملء جميع الحقول')
        return
      }
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: `${firstName} ${lastName}`,
            phone
          }
        }
      })
      if (error) setMessage(error.message)
      else setMessage('تحقق من بريدك الإلكتروني للتأكيد!')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage(error.message)
      else window.location.href = '/'
    }
  }

  const inputStyle = {
    width: '100%',
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    border: '1px solid #ccc',
    fontSize: 14
  }

  return (
    <div style={{ maxWidth: 400, margin: '60px auto', padding: 24, background: '#1a1a2e', borderRadius: 16, color: 'white' }}>
      <h1 style={{ textAlign: 'center', marginBottom: 24 }}>
        {isSignUp ? '📝 إنشاء حساب' : '🔐 تسجيل الدخول'}
      </h1>

      {isSignUp && (
        <>
          <input
            placeholder="الاسم الأول"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            style={inputStyle}
          />
          <input
            placeholder="اللقب"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            style={inputStyle}
          />
          <input
            placeholder="رقم الهاتف"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            style={inputStyle}
          />
        </>
      )}

      <input
        type="email"
        placeholder="البريد الإلكتروني"
        value={email}
        onChange={e => setEmail(e.target.value)}
        style={inputStyle}
      />
      <input
        type="password"
        placeholder="كلمة المرور"
        value={password}
        onChange={e => setPassword(e.target.value)}
        style={inputStyle}
      />

      <button
        onClick={handleAuth}
        style={{ width: '100%', padding: 12, background: '#6366f1', color: 'white', border: 'none', borderRadius: 8, fontSize: 16, cursor: 'pointer' }}
      >
        {isSignUp ? 'إنشاء حساب' : 'دخول'}
      </button>

      <p
        style={{ marginTop: 12, cursor: 'pointer', color: '#a5b4fc', textAlign: 'center' }}
        onClick={() => { setIsSignUp(!isSignUp); setMessage('') }}
      >
        {isSignUp ? 'عندي حساب — تسجيل الدخول' : 'ليس لدي حساب — إنشاء حساب'}
      </p>

      {message && <p style={{ color: '#f87171', textAlign: 'center', marginTop: 8 }}>{message}</p>}
    </div>
  )
}