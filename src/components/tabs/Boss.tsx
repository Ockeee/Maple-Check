'use client'

import { useState } from 'react';
import ModalDefault from '../ModalDefault';
import styles from '@/styles/Hunt.module.css';
import { BOSSES, MonthlyBoss, type Boss } from '@/data/gameData'

type Character = {
  id: number
  server: string
  nickname: string
  job: string
  level: string
}

type BossSlot = {
  name: string
  difficulty: string
  people: number
}

type MonthlyBossState  = {
  difficulty: string | null
  people: number
  checkedWeekStart: string | null
  checkedMonth: string | null
}

type BossEntry = {
  id: number
  character: Character
  bossSlots: BossSlot[]
  checkedBosses: string[] 
  MonthlyBoss: MonthlyBossState  
}

type Props = {
  characters: Character[]
}

type ModalMode = 'add' | 'edit' | 'delete'

export default function Boss({ characters }: Props) {
  const [entries, setEntries] = useState<BossEntry[]>([]);
  const [modalMode, setModalMode] = useState<ModalMode | null>(null);
  const [targetId, setTargetId] = useState<number | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
  const bossKey = (b: { name: string; difficulty: string }) => `${b.name}_${b.difficulty}`;
  const uniqueBossNames = [...new Set(BOSSES.map((b) => b.name))];
  const [selectedBossSlots, setSelectedBossSlots] = useState<BossSlot[]>([]);
  const [selectedMonthlyDiff, setSelectedMonthlyDiff] = useState<string | null>(null);
  const [selectedMonthlyPeople, setSelectedMonthlyPeople] = useState<number>(1);
  const usedCharIds = entries.map((e) => e.character.id);
  
  // const toggleBossName = (name: string) => {  // 보스팝업 체크박스
  //   setSelectedBossSlots((prev) => {
  //     if (prev.some((s) => s.name === name)) return prev.filter((s) => s.name !== name)
  //     if (prev.length >= 12) return prev
  //     const defaultDiff = BOSSES.find((b) => b.name === name)?.difficulty ?? ''
  //     return [...prev, { name, difficulty: defaultDiff, people: 1 }]
  //   })
  // }

  // 추가/수정 팝업 state
  const [selectedCharId, setSelectedCharId] = useState<number | null>(null);

  const openAdd = () => {
    setSelectedCharId(null)
    setModalMode('add')
  }

  const openEdit = (entry: BossEntry) => {
    setTargetId(entry.id)
    setSelectedCharId(entry.character.id)
    setSelectedBossSlots(entry.bossSlots)
    setSelectedMonthlyDiff(entry.MonthlyBoss.difficulty)
    setSelectedMonthlyPeople(entry.MonthlyBoss.people)
    setModalMode('edit')
    setMenuOpenId(null)
  }

  const openDelete = (id: number) => {
    setTargetId(id)
    setModalMode('delete')
    setMenuOpenId(null)
  }

  const closeModal = () => {
    setModalMode(null)
    setTargetId(null)
    setSelectedMonthlyDiff(null)
    setSelectedMonthlyPeople(1)
    setSelectedCharId(null)
    setSelectedBossSlots([])
  }

  const handleAdd = () => {
    if (!selectedCharId || selectedBossSlots.length === 0) return
    const char = characters.find((c) => c.id === selectedCharId)
    if (!char) return
    setEntries((prev) => [...prev, {
      id: Date.now(),
      character: char,
      bossSlots: selectedBossSlots,
      checkedBosses: [],
      MonthlyBoss: { difficulty: selectedMonthlyDiff, people: selectedMonthlyPeople, checkedWeekStart: null, checkedMonth: null },
    }])
    closeModal()
  }

  const handleEdit = () => {
    if (!targetId) return
    setEntries((prev) => prev.map((e) => {
      if (e.id !== targetId) return e
      return {
        ...e,
        bossSlots: selectedBossSlots,
        checkedBosses: [],
        MonthlyBoss: {
          ...e.MonthlyBoss,
          difficulty: selectedMonthlyDiff,
          people: selectedMonthlyPeople,
        }
      }
    }))
    closeModal()
  }

  const handleDelete = () => {
    setEntries((prev) => prev.filter((e) => e.id !== targetId))
    closeModal()
  }

  const toggleBossCheck = (entryId: number, bossName: string) => {
    setEntries((prev) => prev.map((e) => {
      if (e.id !== entryId) return e
      const checked = e.checkedBosses.includes(bossName)
        ? e.checkedBosses.filter((b) => b !== bossName)
        : [...e.checkedBosses, bossName]
      return { ...e, checkedBosses: checked }
    }))

    // await supabase.from('boss_logs').upsert(...)
  }

  const changeSlotDifficulty = (name: string, difficulty: string) => {
    setSelectedBossSlots((prev) => prev.map((s) => s.name === name ? { ...s, difficulty } : s))
  }
  
  const changeSlotPeople = (name: string, people: number) => {
    setSelectedBossSlots((prev) => prev.map((s) => s.name === name ? { ...s, people } : s))
  }

  const toggleAllCheck = (entryId: number) => {
    setEntries((prev) => prev.map((e) => {
      if (e.id !== entryId) return e
      const allChecked = e.bossSlots.every((s) => e.checkedBosses.includes(`${s.name}_${s.difficulty}`))
      return { ...e, checkedBosses: allChecked ? [] : e.bossSlots.map((s) => `${s.name}_${s.difficulty}`) }
    }))
  }

  const getWeeklyIncome = (entry: BossEntry) => {
    const weekStart = getWeekStart()
  
    const bossIncome = entry.checkedBosses.reduce((sum, key) => {
      const [name, difficulty] = key.split('_')
      const boss = BOSSES.find((b) => b.name === name && b.difficulty === difficulty)
      const slot = entry.bossSlots.find((s) => s.name === name)
      return sum + (boss?.reward ?? 0) / (slot?.people ?? 1)
    }, 0)
  
    const blackIncome = entry.MonthlyBoss.checkedWeekStart === weekStart && entry.MonthlyBoss.difficulty
    ? (MonthlyBoss.find((b) => b.difficulty === entry.MonthlyBoss.difficulty)?.reward ?? 0) / entry.MonthlyBoss.people
    : 0
  
    return Math.floor(bossIncome + blackIncome)
  }

  const getWeekRange = () => {
    const now = new Date()
    const day = now.getDay()
    const diffToThursday = (day + 3) % 7
    const thursday = new Date(now)
    thursday.setDate(now.getDate() - diffToThursday)
    const wednesday = new Date(thursday)
    wednesday.setDate(thursday.getDate() + 6)
    const fmt = (d: Date) => d.toISOString().slice(0, 10)
    return `${fmt(thursday)} ~ ${fmt(wednesday)}`
  }

  const getWeekStart = () => {
    const now = new Date()
    const day = now.getDay()
    const diff = (day + 3) % 7
    const thursday = new Date(now)
    thursday.setDate(now.getDate() - diff)
    return thursday.toISOString().slice(0, 10)
  }
  
  const isMonthlyBossCheckedThisMonth = (entry: BossEntry) => {
    const thisMonth = new Date().toISOString().slice(0, 7)
    return entry.MonthlyBoss.checkedMonth === thisMonth
  }
  
  const toggleMonthlyBoss = (entryId: number) => {
    const thisMonth = new Date().toISOString().slice(0, 7)
    const weekStart = getWeekStart()
  
    setEntries((prev) => prev.map((e) => {
      if (e.id !== entryId) return e
      const alreadyChecked = e.MonthlyBoss.checkedMonth === thisMonth
      return {
        ...e,
        MonthlyBoss: alreadyChecked
          ? { ...e.MonthlyBoss, checkedWeekStart: null, checkedMonth: null }
          : { ...e.MonthlyBoss, checkedWeekStart: weekStart, checkedMonth: thisMonth }
      }
    }))
  }

  const formatKorean = (n: number) => {
    const uk = Math.floor(n / 100000000)
    const man = Math.floor((n % 100000000) / 10000)
    const rest = n % 10000
  
    const parts = []
    if (uk > 0) parts.push(`${uk}억`)
    if (man > 0) parts.push(`${man}만`)
    if (rest > 0) parts.push(`${rest}`)
  
    return parts.join(' ') + ' 메소'
  }

  const getMonthlyIncome = () => {
    const thisMonth = new Date().toISOString().slice(0, 7)
    // 이번달 검은마법사 수익 포함 전체 합산
    return entries.reduce((total, entry) => {
      const bossIncome = entry.checkedBosses.reduce((sum, key) => {
        const [name, difficulty] = key.split('_')
        const boss = BOSSES.find((b) => b.name === name && b.difficulty === difficulty)
        const slot = entry.bossSlots.find((s) => s.name === name)
        return sum + (boss?.reward ?? 0) / (slot?.people ?? 1)
      }, 0)
  
      const blackIncome = entry.MonthlyBoss.checkedMonth === thisMonth && entry.MonthlyBoss.difficulty
        ? (MonthlyBoss.find((b) => b.difficulty === entry.MonthlyBoss.difficulty)?.reward ?? 0) / entry.MonthlyBoss.people
        : 0
  
      return total + bossIncome + blackIncome
    }, 0)
  }

  if (characters.length === 0) return <div className={styles.empty}>캐릭터를 먼저 추가하세요</div>

  return (
    <div className={styles.container}>
      <div className={styles.monthlyIncome}>
        <span>이번 달 수익</span>
        <span className={styles.monthlyValue}>{formatKorean(Math.floor(getMonthlyIncome()))}</span>
      </div>
      <div className={styles.weekRange}>{getWeekRange()}</div>
      <div className={styles.topRow}>
        <button className={styles.addBtn} onClick={openAdd}>+ 보스돌이 추가</button>
      </div>

      <div className={styles.grid}>
        {entries.map((entry) => (
          <div key={entry.id} className={styles.card}>

            {/* 카드 헤더 */}
            <div className={styles.cardHeader}>
              <div className={styles.cardCharInfo}>
                <span className={styles.cardNickname}>{entry.character.nickname}</span>
                <span className={styles.cardSub}>Lv.{entry.character.level} · {entry.character.job}</span>
              </div>
              <div className={styles.cardActions}>
                <button
                  className={styles.allCheckBtn}
                  onClick={() => toggleAllCheck(entry.id)}
                >
                  전체완료
                </button>
                <div className={styles.menuWrap}>
                  <button
                    className={styles.menuBtn}
                    onClick={() => setMenuOpenId(menuOpenId === entry.id ? null : entry.id)}
                  >
                    ···
                  </button>
                  {menuOpenId === entry.id && (
                    <div className={styles.menuDropdown}>
                      <button onClick={() => openEdit(entry)}>수정</button>
                      <button onClick={() => openDelete(entry.id)}>삭제</button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 보스 리스트 */}
            <div className={styles.bossList}>
              {entry.bossSlots.map((slot) => {
                const key = `${slot.name}_${slot.difficulty}`
                return (
                  <div key={slot.name} className={styles.bossRow}>
                    <div className={styles.row_item}>
                      <span className={styles.bossName}>{slot.name}</span>
                      <span className={styles.diffLabel}>{slot.difficulty}</span>
                      <span className={styles.peopleLabel}>{slot.people}인</span>
                    </div>
                    {/* <div
                      className={`${styles.checkbox} ${entry.checkedBosses.includes(key) ? styles.checked : ''}`}
                      onClick={() => toggleBossCheck(entry.id, key)}
                    /> */}
                    <div
                      className={`${styles.doneBtn} ${entry.checkedBosses.includes(key) ? styles.done : ''}`}
                      onClick={() => toggleBossCheck(entry.id, key)}
                    >
                      완료
                    </div>
                  </div>
                )
              })}
            </div>

            {/* 검은마법사 월간보스 */}
            <div className={styles.blackSection}>
              <span className={styles.blackLabel}>월간보스</span>
              <div className={styles.bossRow}>
                <div className={styles.row_item}>
                  <span className={styles.bossName}>검은마법사</span>
                  <span className={styles.diffLabel}>{entry.MonthlyBoss.difficulty ?? '-'}</span>
                  <span className={styles.peopleLabel}>{entry.MonthlyBoss.people}인</span>
                </div>
                {/* <div
                  className={`${styles.checkbox} ${isMonthlyBossCheckedThisMonth(entry) ? styles.checked : ''}`}
                  onClick={() => toggleMonthlyBoss(entry.id)}
                /> */}
                <div
                  className={`${styles.doneBtn} ${isMonthlyBossCheckedThisMonth(entry) ? styles.done : ''}`}
                  onClick={() => toggleMonthlyBoss(entry.id)}
                >
                  완료
                </div>
              </div>
            </div>

            {/* 카드 하단 수익 */}
            <div className={styles.cardFooter}>
              <span>이번 주 수익</span>
              <div className={styles.card_income}>
                <span className={styles.income}>{getWeeklyIncome(entry).toLocaleString()} 메소</span>
                <span className={styles.income_short}>({formatKorean(getWeeklyIncome(entry))})</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 추가/수정 팝업 */}
      {(modalMode === 'add' || modalMode === 'edit') && (
        <ModalDefault onClose={closeModal}>
          <h2>{modalMode === 'add' ? '보스돌이 추가' : '보스 수정'}</h2>

          {modalMode === 'add' && (
            <>
              <label className={styles.label}>캐릭터 선택</label>
              <div className={styles.charList}>
                {selectedCharId ? (
                  // 선택 후 - 선택된 캐릭터만 표시
                  (() => {
                    const c = characters.find((c) => c.id === selectedCharId)!
                    return (
                      <div
                        className={`${styles.charItem} ${styles.charSelected}`}
                        onClick={() => {
                          setSelectedCharId(null)
                          setSelectedBossSlots([])
                          setSelectedMonthlyDiff(null)
                          setSelectedMonthlyPeople(1)
                        }}
                      >
                        <span>{c.nickname}</span>
                        <span className={styles.charSub}>Lv.{c.level} · {c.job}</span>
                      </div>
                    )
                  })()
                ) : (
                  // 선택 전 - 전체 목록
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
            </>
          )}

          {selectedCharId && (
            <>
              <label className={styles.label}>주간 보스 선택 ({selectedBossSlots.length} / 12)</label>
              <div className={styles.bossPicker}>
                {uniqueBossNames.map((name) => {
                  const slot = selectedBossSlots.find((s) => s.name === name)
                  const selected = !!slot
                  const availableDiffs = BOSSES.filter((b) => b.name === name).map((b) => b.difficulty)
                  return (
                    <div
                      key={name}
                      className={`${styles.bossPickRow} ${selected ? styles.bossPickSelected : ''}`}
                    >
                      <span className={styles.bossPickName}>{name}</span>
                      <div className={styles.diffBtns}>
                        {availableDiffs.map((diff) => (
                          <button
                            key={diff}
                            className={`${styles.diffBtn} ${slot?.difficulty === diff ? styles.diffActive : ''}`}
                            onClick={() => {
                              if (!selected) {
                                setSelectedBossSlots((prev) => [...prev, { name, difficulty: diff, people: 1 }])
                              } else if (slot?.difficulty === diff) {
                                setSelectedBossSlots((prev) => prev.filter((s) => s.name !== name))
                              } else {
                                changeSlotDifficulty(name, diff)
                              }
                            }}
                          >
                            {diff}
                          </button>
                        ))}
                      </div>
                      <select
                        className={styles.peopleSelect}
                        value={slot?.people ?? 1}
                        disabled={!selected}
                        onChange={(e) => changeSlotPeople(name, Number(e.target.value))}
                      >
                        {[1,2,3,4,5,6].map((n) => <option key={n} value={n}>{n}인</option>)}
                      </select>
                      {/* <div
                        className={`${styles.checkbox} ${selected ? styles.checked : ''}`}
                        onClick={() => toggleBossName(name)}
                      /> */}
                    </div>
                  )
                })}
                </div>
                <label className={styles.label}>월간보스</label>
                <div className={styles.bossPickRow}>
                  <span className={styles.bossPickName}>검은마법사</span>
                  <div className={styles.diffBtns}>
                    {MonthlyBoss.map((b) => (
                      <button
                        key={b.difficulty}
                        className={`${styles.diffBtn} ${selectedMonthlyDiff === b.difficulty ? styles.diffActive : ''}`}
                        onClick={() => setSelectedMonthlyDiff(b.difficulty)}
                      >
                        {b.difficulty}
                      </button>
                    ))}
                  </div>
                  <select
                    className={styles.peopleSelect}
                    value={selectedMonthlyPeople}
                    onChange={(e) => setSelectedMonthlyPeople(Number(e.target.value))}
                  >
                    {[1,2,3,4,5,6].map((n) => <option key={n} value={n}>{n}인</option>)}
                  </select>
                </div>
              </>
            )}
          <div className={styles.buttons}>
            <button className={styles.cancel} onClick={closeModal}>취소</button>
            <button className={styles.confirm} onClick={modalMode === 'add' ? handleAdd : handleEdit}>
              {modalMode === 'add' ? '추가' : '저장'}
            </button>
          </div>
        </ModalDefault>
      )}

      {/* 삭제 확인 팝업 */}
      {modalMode === 'delete' && (
        <ModalDefault onClose={closeModal}>
          <h2>보스돌이 삭제</h2>
          <p className={styles.deleteMsg}>보스돌이를 삭제하시겠습니까?</p>
          <div className={styles.buttons}>
            <button className={styles.cancel} onClick={closeModal}>아니요</button>
            <button className={styles.confirmDelete} onClick={handleDelete}>예</button>
          </div>
        </ModalDefault>
      )}
    </div>
  )
}