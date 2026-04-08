'use client'

import Image from "next/image";
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from "next/link";

export default function Home() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSignup, setIsSignup] = useState(false)

  const handleSubmit = async () => {
    setError('')
    if (isSignup) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) return setError(error.message)
      setError('가입 확인 이메일을 보냈어요')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return setError('이메일 또는 비밀번호가 틀렸어요')
      router.push('/checklist')
    }
  }

  return (
    <div className="app">
      <main className="main">
        <h1>메이플 체크(메쳌)</h1>
        <div className="login">
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p>{error}</p>}
        </div>
        <button className="login_button" onClick={handleSubmit}>{isSignup ? '회원가입' : '로그인'}</button>
        <button className="signin_button" onClick={() => setIsSignup((prev) => !prev)}>
          {isSignup ? '로그인으로' : '회원가입으로'}
        </button>
      </main>
    </div>
  )
}
