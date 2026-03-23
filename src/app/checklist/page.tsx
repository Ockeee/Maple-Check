'use client'

import { useState } from 'react'
import CharacterSection from '@/components/Character/Character';
import TabBar from '@/components/Tab';
import HuntSection from '@/components/tabs/Hunt';
import BossSection from '@/components/tabs/Boss';
import ContentsSection from '@/components/tabs/Contents';
import styles from '@/styles/Checklist.module.css';

type Tab = 'hunt' | 'boss' | 'contents'
type Character = {
    id: number
    server: string
    nickname: string
    job: string
    level: string
  }
  

export default function Checklist() {
  const [activeTab, setActiveTab] = useState<Tab>('hunt');
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    )
  }

  const selectedCharacters = characters.filter((c) => selectedIds.includes(c.id));

  return (
    <div className="app">
      <header className={styles.header}>
        <h1 className={styles.title}>용사님의 메이플체크</h1>
      </header>

    <CharacterSection
        characters={characters}
        setCharacters={setCharacters}
        selectedIds={selectedIds}
        onToggle={toggleSelect}
      />

      <TabBar
        tabs={[
            { key: 'contents', label: '일일/주간 콘텐츠' },
            { key: 'hunt', label: '사냥' },
            { key: 'boss', label: '보스' },
        ]}
        active={activeTab}
        onChange={(key) => setActiveTab(key as Tab)}
      />

    <main className={styles.main}>
        {activeTab === 'contents' && <ContentsSection characters={selectedCharacters} />}
        {activeTab === 'hunt' && <HuntSection characters={selectedCharacters} />}
        {activeTab === 'boss' && <BossSection characters={selectedCharacters} />}
      </main>
    </div>
  )
}