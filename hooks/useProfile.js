'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useProfile(userId) {
  const [profile, setProfile] = useState(null)
  useEffect(() => {
    if (!userId || userId === 'demo') return
    supabase.from('profiles').select('*').eq('id', userId).single()
      .then(({ data }) => { if (data) setProfile(data) })
  }, [userId])
  return profile
}