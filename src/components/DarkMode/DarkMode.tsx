'use client'

import { useEffect, useState } from 'react'

export default function DarkMode() {
  const [dark, setDark] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('theme') === 'dark'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
  }, [dark])

  const toggle = () => {
    const next = !dark
    setDark(next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  return (
    <button suppressHydrationWarning className="darkmode_btn" onClick={toggle}>
      {dark ? '☀️' : '🌙'}
    </button>
  )
}