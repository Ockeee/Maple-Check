'use client'

import { useState, useEffect } from 'react'
import ModalDefault from '../ModalDefault'
import styles from '@/styles/Hunt.module.css'
import { createClient } from '@/lib/supabase/client'

type Character = {
  id: string  
  server: string
  nickname: string
  job: string
  level: string
  mesoRate?: string
  dropRate?: string
}

type HuntLog = {
  id: string  
  characterId: string | null
  date: string
  time: string
  income: number
  solErda: number
  coreGem: number
  consumables: {
    unionWealth: number
    unionLuck: number
    smallPotion: number
    potion: number
  }
}

type Period = 'weekly' | 'monthly'

const today = () => {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const getWeekRange = (date: Date) => {
  const day = date.getDay()
  // 목요일 기준 (4)
  const diffToThursday = (day + 3) % 7  // 목요일까지 거슬러 올라가는 일수
  const thursday = new Date(date)
  thursday.setDate(date.getDate() - diffToThursday)
  const wednesday = new Date(thursday)
  wednesday.setDate(thursday.getDate() + 6)
  return { start: thursday, end: wednesday }
}

const formatDate = (d: Date) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

type Props = {
  characters: Character[]
}

const defaultForm = {
  characterId: null as string | null,
  date: today(),
  time: '',
  income: '',
  solErda: '',
  coreGem: '',
  unionWealthT1: 0, unionWealthT2: 0, unionWealthT3: 0,
  unionLuckT1: 0,   unionLuckT2: 0,   unionLuckT3: 0,
  smallPotionAmt: '0',
  potionAmt: '0',
}

export default function Hunt({ characters }: Props) {
  const [period, setPeriod] = useState<Period>('weekly')
  const [logs, setLogs] = useState<HuntLog[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(defaultForm)
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const [editLog, setEditLog] = useState<HuntLog | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [calendarMonth, setCalendarMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('hunt_logs')
        .select('*')
        .order('date', { ascending: false })
      if (data) {
        setLogs(data.map((row) => ({
          id: row.id,
          characterId: row.character_id,
          date: row.date,
          time: row.time,
          income: row.income,
          solErda: row.sol_erda,
          coreGem: row.core_gem,
          consumables: {
            unionWealth: row.union_wealth,
            unionLuck: row.union_luck,
            smallPotion: row.small_potion,
            potion: row.potion,
          },
        })))
      }
    }
    fetch()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async () => {
    if (!form.characterId) return alert('캐릭터를 선택해주세요')
    if (!form.date) return alert('날짜를 입력해주세요')
    if (!form.time) return alert('사냥 시간을 선택해주세요')
    if (!form.income) return alert('수익을 입력해주세요')
    if (!form.solErda) return alert('솔 에르다 조각을 입력해주세요')
  
    const payload = {
      character_id: form.characterId,
      date: form.date,
      time: form.time,
      income: Number(form.income),
      sol_erda: Number(form.solErda),
      core_gem: Number(form.coreGem),
      union_wealth: form.unionWealthT1 + form.unionWealthT2 + form.unionWealthT3,
      union_luck: form.unionLuckT1 + form.unionLuckT2 + form.unionLuckT3,
      small_potion: Number(form.smallPotionAmt),
      potion: Number(form.potionAmt),
    }
  
    if (editLog) {
      const { error } = await supabase.from('hunt_logs').update(payload).eq('id', editLog.id)
      if (error) return
      setLogs((prev) => prev.map((l) => l.id === editLog.id ? {
        id: editLog.id,
        characterId: form.characterId,
        date: form.date,
        time: form.time,
        income: Number(form.income),
        solErda: Number(form.solErda),
        coreGem: Number(form.coreGem),
        consumables: {
          unionWealth: payload.union_wealth,
          unionLuck: payload.union_luck,
          smallPotion: payload.small_potion,
          potion: payload.potion,
        },
      } : l))
    } else {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data, error } = await supabase
        .from('hunt_logs')
        .insert({ ...payload, user_id: user.id })
        .select()
        .single()
      if (error || !data) return
      setLogs((prev) => [...prev, {
        id: data.id,
        characterId: data.character_id,
        date: data.date,
        time: data.time,
        income: data.income,
        solErda: data.sol_erda,
        coreGem: data.core_gem,
        consumables: {
          unionWealth: data.union_wealth,
          unionLuck: data.union_luck,
          smallPotion: data.small_potion,
          potion: data.potion,
        },
      }])
    }
  
    setEditLog(null)
    setForm(defaultForm)
    setOpen(false)
  }

  const now = new Date()
  const { start, end } = getWeekRange(now)

  // const filteredLogs = logs.filter((log) => {
  //   // timezone 문제 방지 - 날짜 문자열 직접 비교
  //   const d = new Date(log.date + 'T00:00:00')
  //   const s = new Date(formatDate(start) + 'T00:00:00')
  //   const e = new Date(formatDate(end) + 'T00:00:00')
  //   if (period === 'weekly') return d >= s && d <= e
  //   if (period === 'monthly') return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  //   return true
  // })
  const filteredLogs = logs.filter((log) => {
    if (selectedDate) return log.date === selectedDate
    const d = new Date(log.date + 'T00:00:00')
    const s = new Date(formatDate(start) + 'T00:00:00')
    const e = new Date(formatDate(end) + 'T00:00:00')
    if (period === 'weekly') return d >= s && d <= e
    if (period === 'monthly') return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
    return true
  })

  const totalIncome = filteredLogs.reduce((s, l) => s + l.income, 0)
  const totalSolErda = filteredLogs.reduce((s, l) => s + l.solErda, 0)
  const totalCoreGem = filteredLogs.reduce((s, l) => s + l.coreGem, 0)
  const totalUnionWealth = filteredLogs.reduce((s, l) => s + (l.consumables.unionWealth ?? 0), 0)
  const totalUnionLuck = filteredLogs.reduce((s, l) => s + (l.consumables.unionLuck ?? 0), 0)
  const totalSmallPotion = filteredLogs.reduce((s, l) => s + (l.consumables.smallPotion ?? 0), 0)
  const totalPotion = filteredLogs.reduce((s, l) => s + (l.consumables.potion ?? 0), 0)

  const timeOptions = Array.from({ length: 12 }, (_, i) => {
    const totalMinutes = (i + 1) * 30
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    const label = hours === 0 ? `${minutes}분` : minutes === 0 ? `${hours}시간` : `${hours}시간 ${minutes}분`
    const value = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
    return { label, value }
  })

  const openEdit = (log: HuntLog) => {
    setEditLog(log)
    setForm({
      characterId: log.characterId,
      date: log.date,
      time: log.time,
      income: String(log.income),
      solErda: String(log.solErda),
      coreGem: String(log.coreGem),
      unionWealthT1: log.consumables.unionWealth, unionWealthT2: 0, unionWealthT3: 0,
      unionLuckT1: log.consumables.unionLuck,     unionLuckT2: 0,   unionLuckT3: 0,
      smallPotionAmt: String(log.consumables.smallPotion),
      potionAmt: String(log.consumables.potion),
    })
    setMenuOpenId(null)
    setOpen(true)
  }
  
  const openDelete = (id: string) => {
    setDeleteId(id)
    setMenuOpenId(null)
  }
  
  const handleDelete = async () => {
    if (!deleteId) return
    const { error } = await supabase.from('hunt_logs').delete().eq('id', deleteId)
    if (error) return
    setLogs((prev) => prev.filter((l) => l.id !== deleteId))
    setDeleteId(null)
  }

  if (characters.length === 0) return <div className={styles.empty}>캐릭터를 선택하세요</div>

  const openAdd = (dateStr: string) => {
    setEditLog(null)
    setForm({ ...defaultForm, date: dateStr })
    setOpen(true)
  }

  return (
    <div className={styles.container}>

      {/* 상단 필터 */}
      <div className={styles.filterRow}>
        <div className={styles.periodBtns}>
          <button
            className={`${styles.periodBtn} ${period === 'weekly' ? styles.active : ''}`}
            onClick={() => setPeriod('weekly')}
          >주간</button>
          <button
            className={`${styles.periodBtn} ${period === 'monthly' ? styles.active : ''}`}
            onClick={() => setPeriod('monthly')}
          >월간</button>
        </div>
        <span className={styles.dateLabel}>{today()}</span>
        <button className={styles.addBtn} onClick={() => openAdd(today())}>+ 추가</button>
      </div>

      {/* 주간 범위 표시 */}
      {period === 'weekly' && (
        <div className={styles.weekRange}>
          {formatDate(start)} ~ {formatDate(end)}
        </div>
      )}

      {/* 총 수익 */}
      <div className={styles.dashboard}>
        <span className={styles.dashLabel}>총 수익</span>
        <span className={styles.dashValue}>{totalIncome.toLocaleString()} 메소</span>
      </div>

      {/* 대시보드 */}
      <div className={styles.dashboard}>
        <div className={styles.dashCard}>
          <span className={styles.dashLabel}>사냥 수익</span>
          <span className={styles.dashValue}>{totalIncome.toLocaleString()} 메소</span>
        </div>
        <div className={styles.dashCard}>
          <span className={styles.dashLabel}>솔 에르다 조각</span>
          <span className={styles.dashValue}>{totalSolErda}</span>
        </div>
        <div className={styles.dashCard}>
          <span className={styles.dashLabel}>코어젬스톤· 사냥꾼의 보물상자</span>
          <span className={styles.dashValue}>{totalCoreGem}</span>
        </div>
        <div className={`${styles.dashCard}`}>
          <span className={styles.dashLabel}>사용 재화</span>
          <span className={styles.dashValue}>유니온의 부 {totalUnionWealth} · 유니온의 행운 {totalUnionLuck} · 소형 재물획득의 비약 {totalSmallPotion} · 재물획득의 비약 {totalPotion}</span>
        </div>
      </div>

      {/* 달력 */}
      {(() => {
        const calYear = calendarMonth.getFullYear()
        const calMonth = calendarMonth.getMonth()
        const firstDay = new Date(calYear, calMonth, 1).getDay()
        const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()
        const cells: (number | null)[] = [
          ...Array(firstDay).fill(null),
          ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
        ]
        return (
          <div className={styles.calendar}>
            <div className={styles.calHeader}>
              <button onClick={() => setCalendarMonth(new Date(calYear, calMonth - 1))}>‹</button>
              <span>{calYear}년 {calMonth + 1}월</span>
              <button onClick={() => setCalendarMonth(new Date(calYear, calMonth + 1))}>›</button>
            </div>
            <div className={styles.calGrid}>
              {['일','월','화','수','목','금','토'].map((d, i) => (
                <div key={d} className={`${styles.calDayName} ${i === 0 ? styles.sunday : i === 6 ? styles.saturday : ''}`}>{d}</div>
              ))}
              {cells.map((day, i) => {
                if (!day) return <div key={i} className={styles.calEmpty} />
                const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                const isToday = dateStr === today()
                const isSelected = dateStr === selectedDate
                const hasLog = logs.some((l) => l.date === dateStr)
                const col = i % 7
                return (
                  <div
                    key={i}
                    className={`${styles.calCell} ${isToday ? styles.calToday : ''} ${isSelected ? styles.calSelected : ''}  ${hasLog ? styles.calHasLog : ''}`}
                    onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                  >
                    <span className={`${styles.calDayNum} ${col === 0 ? styles.sunday : col === 6 ? styles.saturday : ''}`}>{day}</span>
                    {(() => {
                      const dayLogs = logs.filter((l) => l.date === dateStr)
                      if (!dayLogs.length) return null
                      const sumTime = dayLogs.reduce((s, l) => {
                        const [h, m] = l.time ? l.time.split(':').map(Number) : [0, 0]
                        return s + h * 60 + m
                      }, 0)
                      const sumIncome = dayLogs.reduce((s, l) => s + l.income, 0)
                      const sumSolErda = dayLogs.reduce((s, l) => s + l.solErda, 0)
                      const timeLabel = sumTime
                        ? (sumTime >= 60 ? `${Math.floor(sumTime/60)}시간${sumTime%60 ? ` ${sumTime%60}분` : ''}` : `${sumTime}분`)
                        : '-'
                      return (
                        <div className={styles.calLogInfo}>
                          <span>{timeLabel}</span>
                          <span>{sumIncome >= 100000000 ? `${(sumIncome/100000000).toFixed(1)}억` : sumIncome >= 10000 ? `${Math.floor(sumIncome/10000)}만` : sumIncome.toLocaleString()}</span>
                          <span>다조 {sumSolErda}</span>
                        </div>
                      )
                    })()}
                    <button
                      className={styles.calAddBtn}
                      onClick={(e) => { e.stopPropagation(); openAdd(dateStr) }}
                    >+</button>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })()}

      {/* 카드 목록 */}
      <div className={styles.logList}>
        {filteredLogs.length === 0 && <p className={styles.empty}>기록이 없어요</p>}
        {filteredLogs.map((log) => (
          <div key={log.id} className={styles.logCard}>
            <div className={styles.menuWrap}>
              <button
                className={styles.menuBtn}
                onClick={() => setMenuOpenId(menuOpenId === log.id ? null : log.id)}
              >
                ···
              </button>
              {menuOpenId === log.id && (
                <div className={styles.menuDropdown}>
                  <button onClick={() => openEdit(log)}>수정</button>
                  <button onClick={() => openDelete(log.id)}>삭제</button>
                </div>
              )}
            </div>
            <div className={styles.logTop}>
              <span className={styles.logChar}>
                {characters.find((c) => c.id === log.characterId)?.nickname ?? '-'}
              </span>
              <span className={styles.logDate}>{log.date} {log.time}</span>
              <span className={styles.logCharSub}>
                메소 {characters.find((c) => c.id === log.characterId)?.mesoRate ?? 0}% · 드랍 {characters.find((c) => c.id === log.characterId)?.dropRate ?? 0}%
              </span>
            </div>

            <div className={styles.logRow}>
              <span>수익</span><span>{log.income.toLocaleString()} 메소</span>
            </div>
            <div className={styles.logRow}>
              <span>솔 에르다 조각</span><span>{log.solErda}</span>
            </div>
            <div className={styles.logRow}>
              <span>코어젬스톤</span><span>{log.coreGem}</span>
            </div>

            <div>사용한 재화</div>
            {log.consumables.unionWealth !== null && (
              <div className={styles.logRow}><span>유니온의 부</span><span>{log.consumables.unionWealth}</span></div>
            )}
            {log.consumables.unionLuck !== null && (
              <div className={styles.logRow}><span>유니온의 행운</span><span>{log.consumables.unionLuck}</span></div>
            )}
            {log.consumables.smallPotion !== null && (
              <div className={styles.logRow}><span>소형 재물획득의 비약</span><span>{log.consumables.smallPotion}</span></div>
            )}
            {log.consumables.potion !== null && (
              <div className={styles.logRow}><span>재물획득의 비약</span><span>{log.consumables.potion}</span></div>
            )}
          </div>
        ))}
      </div>

      {/* 팝업 */}
      {open && (
        <ModalDefault onClose={() => setOpen(false)} closeOnOverlay={false}>
          <h2 className={styles.modalTitle}>사냥 수익 추가</h2>

          <label className={styles.label}>캐릭터 선택</label>
          <div className={styles.charList}>
            {form.characterId ? (
              (() => {
                const c = characters.find((c) => c.id === form.characterId)!
                return (
                  <div
                    className={`${styles.charItem} ${styles.charSelected}`}
                    onClick={() => setForm((prev) => ({ ...prev, characterId: null }))}
                  >
                    <span>{c.nickname}</span>
                    <span className={styles.charSub}>Lv.{c.level} · {c.job} · 메소{c.mesoRate ?? 0}% · 드랍{c.dropRate ?? 0}%</span>
                  </div>
                )
              })()
            ) : (
              characters.map((c) => (
                <div
                  key={c.id}
                  className={styles.charItem}
                  onClick={() => setForm((prev) => ({ ...prev, characterId: c.id }))}
                >
                  <span>{c.nickname}</span>
                  <span className={styles.charSub}>Lv.{c.level} · {c.job} · 메소{c.mesoRate ?? 0}% · 드랍{c.dropRate ?? 0}%</span>
                </div>
              ))
            )}
          </div>

          {form.characterId && (
            <>
              <label className={styles.label}>날짜</label>
              <input className={styles.input} type="date" name="date" value={form.date} onChange={handleChange} />

              <label className={styles.label}>사냥 시간</label>
              <select
                className={styles.input}
                name="time"
                value={form.time}
                onChange={(e) => setForm((prev) => ({ ...prev, time: e.target.value }))}
              >
                <option value="">선택</option>
                {timeOptions.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>

              <label className={styles.label}>수익 (메소)</label>
              <input className={styles.input} type="number" name="income" min="0" placeholder="0" value={form.income} onChange={handleChange} />

              <label className={styles.label}>솔 에르다 조각</label>
              <input className={styles.input} type="number" name="solErda" min="0" placeholder="0" value={form.solErda} onChange={handleChange} />

              {/* <label className={styles.label}>코어젬스톤</label>
              <input className={styles.input} type="number" name="coreGem" min="0" placeholder="0" value={form.coreGem} onChange={handleChange} /> */}

              <div className={styles.consumableSection}>
                <span className={styles.label}>사용 재화</span>

                {([
                  {
                    label: '유니온의 부',
                    tiers: [
                      { key: 'unionWealthT1' as const, tier: 1 },
                      { key: 'unionWealthT2' as const, tier: 2 },
                      { key: 'unionWealthT3' as const, tier: 3 },
                    ]
                  },
                  {
                    label: '유니온의 행운',
                    tiers: [
                      { key: 'unionLuckT1' as const, tier: 1 },
                      { key: 'unionLuckT2' as const, tier: 2 },
                      { key: 'unionLuckT3' as const, tier: 3 },
                    ]
                  },
                ]).map(({ label, tiers }) => (
                  <div key={label} className={styles.consumableRow}>
                    <span className={styles.consumableLabel}>{label}</span>
                    <div className={styles.tierGroup}>
                      {tiers.map(({ key, tier }) => (
                        <div key={key} className={styles.tierItem}>
                          <span className={styles.tierBadge}>{tier}단계</span>
                          <button
                            className={styles.tierBtn}
                            onClick={() => setForm((prev) => ({ ...prev, [key]: Math.max(0, (Number(prev[key]) || 0) - 1) }))}
                          >-</button>
                          <input
                            className={styles.tierCount}
                            type="number"
                            min="0"
                            value={Number(form[key]) || 0}
                            onChange={(e) => setForm((prev) => ({ ...prev, [key]: Math.max(0, Number(e.target.value) || 0) }))}
                          />
                          <button
                            className={styles.tierBtn}
                            onClick={() => setForm((prev) => ({ ...prev, [key]: (Number(prev[key]) || 0) + 1 }))}
                          >+</button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {([
                  { key: 'smallPotion', amtKey: 'smallPotionAmt', label: '소형 재물획득의 비약' },
                  { key: 'potion', amtKey: 'potionAmt', label: '재물획득의 비약' },
                ] as const).map(({ amtKey, label }) => (
                  <div key={amtKey} className={styles.consumableRow}>
                    <span className={styles.consumableLabel}>{label}</span>
                    <input
                      className={styles.consumableInput}
                      type="number"
                      name={amtKey}
                      min="0"
                      value={form[amtKey]}
                      onChange={handleChange}
                    />
                  </div>
                ))}
              </div>
            </>
          )}

          <div className={styles.buttons}>
            <button className={styles.cancel} onClick={() => setOpen(false)}>취소</button>
            <button className={styles.confirm} onClick={handleSubmit}>추가</button>
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