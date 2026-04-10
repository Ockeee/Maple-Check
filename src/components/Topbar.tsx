'use client'

import DarkMode from '@/components/DarkMode/DarkMode'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function Topbar() {
    const supabase = createClient()
    const router = useRouter()
    const [isLoggedIn, setIsLoggedIn] = useState(false)

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setIsLoggedIn(!!data.session)
        })
    
        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsLoggedIn(!!session)
        })
    
        return () => listener.subscription.unsubscribe()
    }, [])
    
    const handleClick = async () => {
        if (isLoggedIn) {
            await supabase.auth.signOut()
            router.push('/')
        } else {
            router.push('/')
        }
    }

    return (
        <header className="topbar">
            <Image
                src="/images/logo.svg"
                alt="아맞다 메이플"
                width={150}
                height={50}
                className="topbar_title"
                loading="eager"
            />
            <nav className="topbar_nav">
                <button onClick={handleClick}>{isLoggedIn ? '로그아웃' : '로그인'}</button>
            </nav>
            <DarkMode />
        </header>
    )
}