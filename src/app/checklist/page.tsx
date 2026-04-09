'use client'

import { useState } from 'react'
import CharacterSection from '@/components/Character/Character'
import TabBar from '@/components/Tab'
import HuntSection from '@/components/tabs/Hunt'
import BossSection from '@/components/tabs/Boss'
import ContentsSection from '@/components/tabs/Contents'
import styles from '@/styles/Checklist.module.css'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Tab = 'hunt' | 'boss' | 'content'

export type Character = {
  id: string  
  server: string
  nickname: string
  job: string
  level: string
}

export type BossSlot = {
  name: string
  difficulty: string
  people: number
}

export type BossEntry = {
  id: string
  character: Character
  bossSlots: BossSlot[]
  checkedBosses: string[]
  MonthlyBoss: {
    difficulty: string | null
    people: number
    checkedWeekStart: string | null
    checkedMonth: string | null
  }
}

export type ContentEntry = {
  id: string
  character: Character
  items: ChecklistKey[]
  checked: ChecklistKey[]
  weekStart: string
}

export type ChecklistKey = 'boss' | 'guild' | 'epic' | 'extreme'

export default function Checklist() {
  const [activeTab, setActiveTab] = useState<Tab>('hunt')
  const [characters, setCharacters] = useState<Character[]>([])
  const [bossEntries, setBossEntries] = useState<BossEntry[]>([])
  const [contentEntries, setContentEntries] = useState<ContentEntry[]>([])

  return (
    <div className="app">

      <CharacterSection
        characters={characters}
        setCharacters={setCharacters}
      />

      <TabBar
        tabs={[
          { key: 'content', label: '콘텐츠' },
          { key: 'boss', label: '보스' },
          { key: 'hunt', label: '사냥' },

        ]}
        active={activeTab}
        onChange={(key) => setActiveTab(key as Tab)}
      />

      <main className={styles.main}>
        {activeTab === 'hunt' && <HuntSection characters={characters} />}
        {activeTab === 'boss' && (
          <BossSection
            characters={characters}
            entries={bossEntries}
            setEntries={setBossEntries}
          />
        )}
        {activeTab === 'content' && (
          <ContentsSection
            characters={characters}
            bossEntries={bossEntries}
            entries={contentEntries}
            setEntries={setContentEntries}
          />
        )}
      </main>
    </div>
  )
}