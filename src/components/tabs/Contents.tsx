'use client'

import { useState, useEffect } from 'react'
import ModalDefault from '../ModalDefault'
import { BossEntry } from '@/app/checklist/page'
import { createClient } from '@/lib/supabase/client'
import styles from '@/styles/Hunt.module.css'

type Character = {
  id: string
  server: string
  nickname: string
  job: string
  level: string
}

const CHECKLIST_ITEMS = [
  { key: 'guild', label: '길드 수로/플래그' },
  { key: 'epic', label: '에픽던전' },
  { key: 'extreme', label: '익스트림몬스터파크' },
] as const

type ChecklistKey = typeof CHECKLIST_ITEMS[number]['key'] | 'boss'

type ContentEntry = {
  id: string
  character: Character
  items: ChecklistKey[]         // 선택한 항목들
  checked: ChecklistKey[]       // 완료한 항목들
  weekStart: string             // 마지막 초기화 기준 목요일
}

const getWeekStart = () => {
  const now = new Date()
  const day = now.getDay()
  const diff = (day + 3) % 7
  const thursday = new Date(now)
  thursday.setDate(now.getDate() - diff)
  const y = thursday.getFullYear()
  const m = String(thursday.getMonth() + 1).padStart(2, '0')
  const d = String(thursday.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

type Props = {
  characters: Character[]
  bossEntries: BossEntry[]
  entries: ContentEntry[]
  setEntries: React.Dispatch<React.SetStateAction<ContentEntry[]>>
}

export default function Contents({ characters, bossEntries, entries, setEntries }: Props) {
  // const [entries, setEntries] = useState<ContentEntry[]>([])
  const [open, setOpen] = useState(false)
  const [selectedCharId, setSelectedCharId] = useState<string | null>(null)
  const [selectedItems, setSelectedItems] = useState<ChecklistKey[]>([])
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editId, setEditId] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    const fetch = async () => {
      const weekStart = getWeekStart()
      const { data } = await supabase
        .from('content_entries')
        .select('*, characters(*)')
        .order('created_at', { ascending: true })
      if (data) {
        setEntries(data.map((row) => ({
          id: row.id,
          character: {
            id: row.characters.id,
            server: row.characters.server,
            nickname: row.characters.nickname,
            job: row.characters.job,
            level: row.characters.level,
          },
          items: row.items,
          checked: row.week_start !== weekStart ? [] : row.checked,
          weekStart: row.week_start ?? weekStart,
        })))
  
        // 주간 초기화 필요한 항목 DB에도 반영
        const toReset = data.filter((row) => row.week_start !== weekStart)
        for (const row of toReset) {
          await supabase
            .from('content_entries')
            .update({ checked: [], week_start: weekStart })
            .eq('id', row.id)
        }
      }
    }
    fetch()
  }, [])

  // 목요일 기준 주간 초기화
  useEffect(() => {
    const weekStart = getWeekStart()
    setEntries((prev) => prev.map((e) => {
      if (e.weekStart !== weekStart) {
        return { ...e, checked: [], weekStart }
      }
      return e
    }))
  }, [])

  const usedCharIds = entries.map((e) => e.character.id)

  const toggleItem = (key: ChecklistKey) => {
    setSelectedItems((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  const handleAdd = async () => {
    if (!selectedCharId || selectedItems.length === 0) return
    const char = characters.find((c) => c.id === selectedCharId)
    if (!char) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
  
    const { data, error } = await supabase
      .from('content_entries')
      .insert({
        user_id: user.id,
        character_id: selectedCharId,
        items: selectedItems,
        checked: [],
        week_start: getWeekStart(),
      })
      .select()
      .single()
  
    if (error || !data) return
    setEntries((prev) => [...prev, {
      id: data.id,
      character: char,
      items: selectedItems,
      checked: [],
      weekStart: data.week_start,
    }])
    closeModal()
  }

  const handleEdit = async () => {
    if (!editId || selectedItems.length === 0) return
    const { error } = await supabase
      .from('content_entries')
      .update({ items: selectedItems })
      .eq('id', editId)

    if (error) return
    setEntries((prev) => prev.map((e) => e.id === editId ? { ...e, items: selectedItems } : e))
    closeModal()
  }

  const closeModal = () => {
    setOpen(false)
    setSelectedCharId(null)
    setSelectedItems([])
    setEditId(null)
  }

  const toggleCheck = async (entryId: string, key: ChecklistKey) => {
    const entry = entries.find((e) => e.id === entryId)
    if (!entry) return
    const checked = entry.checked.includes(key)
      ? entry.checked.filter((k) => k !== key)
      : [...entry.checked, key]
  
    const { error } = await supabase
      .from('content_entries')
      .update({ checked })
      .eq('id', entryId)
  
    if (error) return
    setEntries((prev) => prev.map((e) => e.id === entryId ? { ...e, checked } : e))
  }

  const handleDelete = async () => {
    if (!deleteId) return
    const { error } = await supabase.from('content_entries').delete().eq('id', deleteId)
    if (error) return
    setEntries((prev) => prev.filter((e) => e.id !== deleteId))
    setDeleteId(null)
  }

  const openEdit = (entry: ContentEntry) => {
    setEditId(entry.id)
    setSelectedCharId(entry.character.id)
    setSelectedItems(entry.items)
    setMenuOpenId(null)
    setOpen(true)
  }

  const getBossLabel = (charId: string) => {
    const entry = bossEntries.find((e) => e.character.id === charId)
    if (!entry) return '보스돌이 없음'
    const total = entry.bossSlots.length
    const done = entry.checkedBosses.length
    return `보스 ${done}/${total}`
  }

  const isBossDone = (charId: string) => {
    const entry = bossEntries.find((e) => e.character.id === charId)
    if (!entry) return false
    return entry.bossSlots.length > 0 && entry.checkedBosses.length === entry.bossSlots.length
  }

  if (characters.length === 0) return <div className={styles.empty}>캐릭터를 선택하세요</div>

  return (
    <div className={styles.container}>
      <div className={styles.topRow}>
        <button className={styles.addBtn} onClick={() => setOpen(true)}>+ 콘텐츠 추가</button>
      </div>

      <div className={styles.grid}>
        {entries.map((entry) => (
          <div key={entry.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardCharInfo}>
                <span className={styles.cardNickname}>{entry.character.nickname}</span>
                <span className={styles.cardSub}>Lv.{entry.character.level} · {entry.character.job}</span>
              </div>
              <div className={styles.menuWrap}>
                <button
                  className={styles.menuBtn}
                  onClick={() => setMenuOpenId(menuOpenId === entry.id ? null : entry.id)}
                >···</button>
                {menuOpenId === entry.id && (
                  <div className={styles.menuDropdown}>
                    <button onClick={() => openEdit(entry)}>수정</button>
                    <button onClick={() => { setDeleteId(entry.id); setMenuOpenId(null) }}>삭제</button>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.checkList}>
              {entry.items.includes('boss') && (
                <div className={styles.checkRow}>
                  <span className={styles.checkLabel}>주간 보스 ({getBossLabel(entry.character.id)})</span>
                  <div
                    className={`${styles.doneBtn} ${isBossDone(entry.character.id) ? styles.done : ''}`}
                    onClick={() => toggleCheck(entry.id, 'boss')}
                  >완료</div>
                </div>
              )}
              {CHECKLIST_ITEMS.filter((item) => entry.items.includes(item.key)).map((item) => (
                <div key={item.key} className={styles.checkRow}>
                  <span className={styles.checkLabel}>{item.label}</span>
                  <div
                    className={`${styles.doneBtn} ${entry.checked.includes(item.key) ? styles.done : ''}`}
                    onClick={() => toggleCheck(entry.id, item.key)}
                  >완료</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {open && (
        <ModalDefault onClose={closeModal} closeOnOverlay={false}>
        <h2 className={styles.modalTitle}>{editId ? '콘텐츠 수정' : '콘텐츠 추가'}</h2>

          <label className={styles.label}>캐릭터 선택</label>
          <div className={styles.charList}>
              {editId ? (
                (() => {
                  const c = characters.find((c) => c.id === selectedCharId)!
                  return (
                    <div className={`${styles.charItem} ${styles.charSelected}`}>
                      <span>{c.nickname}</span>
                      <span className={styles.charSub}>Lv.{c.level} · {c.job}</span>
                    </div>
                  )
                })()
              ) : selectedCharId ? (
                (() => {
                  const c = characters.find((c) => c.id === selectedCharId)!
                  return (
                    <div
                      className={`${styles.charItem} ${styles.charSelected}`}
                      onClick={() => { setSelectedCharId(null); setSelectedItems([]) }}
                    >
                      <span>{c.nickname}</span>
                      <span className={styles.charSub}>Lv.{c.level} · {c.job}</span>
                    </div>
                  )
                })()
              ) : (
                characters.map((c) => {
                  const used = usedCharIds.includes(c.id)
                  return (
                    <div
                      key={c.id}
                      className={`${styles.charItem} ${used ? styles.charUsed : ''}`}
                      onClick={() => { if (!used) setSelectedCharId(c.id) }}
                    >
                      <span>{c.nickname}</span>
                      <span className={styles.charSub}>Lv.{c.level} · {c.job}</span>
                      {used && <span className={styles.charUsedLabel}>추가됨</span>}
                    </div>
                  )
                })
              )}
            </div>

          {selectedCharId && (
            <>
              <label className={styles.label}>체크리스트 선택</label>
              <div className={styles.itemList}>
                {[{ key: 'boss' as const, label: '주간 보스' }, ...CHECKLIST_ITEMS].map((item) => (
                  <div
                    key={item.key}
                    className={`${styles.itemRow} ${selectedItems.includes(item.key) ? styles.itemSelected : ''}`}
                    onClick={() => toggleItem(item.key)}
                  >
                    {item.label}
                  </div>
                ))}
              </div>
            </>
          )}

          <div className={styles.buttons}>
            <button className={styles.cancel} onClick={closeModal}>취소</button>
            <button className={styles.confirm} onClick={editId ? handleEdit : handleAdd}>
              {editId ? '저장' : '추가'}
            </button>
          </div>
        </ModalDefault>
      )}

      {deleteId !== null && (
        <ModalDefault onClose={() => setDeleteId(null)} closeOnOverlay={false}>
          <p>정말 삭제하시겠어요?</p>
          <div className={styles.buttons}>
            <button className={styles.cancel} onClick={() => setDeleteId(null)}>취소</button>
            <button className={styles.confirm} onClick={handleDelete}>삭제</button>
          </div>
        </ModalDefault>
      )}
    </div>
  )
}