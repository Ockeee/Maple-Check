'use client'

import { useState } from 'react'
import CharacterSection from '@/components/Character/Character'
import TabBar from '@/components/Tab'
import HuntSection from '@/components/tabs/Hunt'
import BossSection from '@/components/tabs/Boss'
import styles from '@/styles/Checklist.module.css'

type Tab = 'hunt' | 'boss' | 'content'

export type Character = {
  id: number
  server: string
  nickname: string
  job: string
  level: string
}

export default function Checklist() {
  const [activeTab, setActiveTab] = useState<Tab>('hunt')
  const [characters, setCharacters] = useState<Character[]>([])

  return (
    <div className="app">
      <header className={styles.header}>
        <h1 className={styles.title}>용사님의 메이플체크</h1>
      </header>

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
        {activeTab === 'boss' && <BossSection characters={characters} />}
      </main>
    </div>
  )
}