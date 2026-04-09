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
  const [autoLogin, setAutoLogin] = useState(true)

  const handleSubmit = async () => {
    setError('')
    if (isSignup) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) return setError(error.message)
      setError('이메일에서 가입확인을 해주세요!')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return setError('이메일 또는 비밀번호가 틀렸어요')
      if (!autoLogin) {
        // 탭 닫으면 세션 제거
        await supabase.auth.updateUser({})
        sessionStorage.setItem('no_auto_login', 'true')
      }
      router.push('/checklist')
    }
  }

  return (
    <div className="app">
      <main className="main">
        <div className="login_banner">
          <div className="login_banner_grid">
            {Array.from({ length: 30 }).map((_, i) => (
              <Image
                key={i}
                src={(i + Math.floor(i / 6)) % 2 === 0 ? '/images/banner.png' : '/images/logo.svg'}
                alt="banner"
                width={375}
                height={60}
              />
            ))}
          </div>
        </div>
        <div className="login">
          <div className="guide">
            <h1>메이플 아맞다! 가이드</h1>
            <p>개인 맞춤 사용을 위해 회원가입을 부탁드립니다.</p>
            <p>회워가입은 이메일과 비밀번호만 입력하시면 됩니다.</p>
            <p>회원가입 버튼을 누른 뒤, 사용하시는 이메일에서 
              <br/>
              <span>Supabase Auth</span>의 <span>Confirm Your Sighnup</span>을 
              <br/>확인하시면 바로 사용 가능합니다.
            </p>
          </div>
          <div className="login_div">
            <input
              type="email"
              placeholder="이메일을 입력해주세요."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="비밀번호를 입력해주세요."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p>{error}</p>}
            <button className="login_button" onClick={handleSubmit}>{isSignup ? '회원가입' : '로그인'}</button>
            <label className="auto_login">
              <input
                type="checkbox"
                checked={autoLogin}
                onChange={(e) => setAutoLogin(e.target.checked)}
              />
              자동로그인
            </label>
            <button className="signin_button" onClick={() => setIsSignup((prev) => !prev)}>
              {isSignup ? '로그인으로' : '회원가입'}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
