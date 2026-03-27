'use client'

import { useState } from 'react'
import ModalDefault from '../ModalDefault'
import styles from '@/styles/Hunt.module.css'

type Character = {
  id: number
  server: string
  nickname: string
  job: string
  level: string
  mesoRate?: string
  dropRate?: string
}

type HuntLog = {
  id: number
  characterId: number | null
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
  characterId: null as number | null,
  date: today(),
  time: '',
  income: '',
  solErda: '',
  coreGem: '',
  unionWealthAmt: '0',
  unionLuckAmt: '0',
  smallPotionAmt: '0',
  potionAmt: '0',
}

export default function Hunt({ characters }: Props) {
  const [period, setPeriod] = useState<Period>('weekly')
  const [logs, setLogs] = useState<HuntLog[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(defaultForm)
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null)
  const [editLog, setEditLog] = useState<HuntLog | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = () => {
    const log: HuntLog = {
      id: editLog ? editLog.id : Date.now(),
      characterId: form.characterId,
      date: form.date,
      time: form.time,
      income: Number(form.income),
      solErda: Number(form.solErda),
      coreGem: Number(form.coreGem),
      consumables: {
        unionWealth: Number(form.unionWealthAmt),
        unionLuck: Number(form.unionLuckAmt),
        smallPotion: Number(form.smallPotionAmt),
        potion: Number(form.potionAmt),
      }
    }
    if (editLog) {
      setLogs((prev) => prev.map((l) => l.id === editLog.id ? log : l))
    } else {
      setLogs((prev) => [...prev, log])
    }
    setEditLog(null)
    setForm(defaultForm)
    setOpen(false)
  }

  const now = new Date()
  const { start, end } = getWeekRange(now)

  const filteredLogs = logs.filter((log) => {
    // timezone 문제 방지 - 날짜 문자열 직접 비교
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
      unionWealthAmt: String(log.consumables.unionWealth),
      unionLuckAmt: String(log.consumables.unionLuck),
      smallPotionAmt: String(log.consumables.smallPotion),
      potionAmt: String(log.consumables.potion),
    })
    setMenuOpenId(null)
    setOpen(true)
  }
  
  const openDelete = (id: number) => {
    setDeleteId(id)
    setMenuOpenId(null)
  }
  
  const handleDelete = () => {
    setLogs((prev) => prev.filter((l) => l.id !== deleteId))
    setDeleteId(null)
  }

  if (characters.length === 0) return <div className={styles.empty}>캐릭터를 선택하세요</div>

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
        <button className={styles.addBtn} onClick={() => setOpen(true)}>+ 추가</button>
      </div>

      {/* 주간 범위 표시 */}
      {period === 'weekly' && (
        <div className={styles.weekRange}>
          {formatDate(start)} ~ {formatDate(end)}
        </div>
      )}

      {/* 대시보드 */}
      <div className={styles.dashboard}>
        <div className={styles.dashCard}>
          <span className={styles.dashLabel}>수익</span>
          <span className={styles.dashValue}>{totalIncome.toLocaleString()} 메소</span>
        </div>
        <div className={styles.dashCard}>
          <span className={styles.dashLabel}>솔 에르다 조각</span>
          <span className={styles.dashValue}>{totalSolErda}</span>
        </div>
        <div className={styles.dashCard}>
          <span className={styles.dashLabel}>코어젬스톤</span>
          <span className={styles.dashValue}>{totalCoreGem}</span>
        </div>
        <div className={`${styles.dashCard} ${styles.dashFull}`}>
          <span className={styles.dashLabel}>사용 재화</span>
          <span className={styles.dashValue}>유니온의 부 {totalUnionWealth} · 유니온의 행운 {totalUnionLuck} · 소형비약 {totalSmallPotion} · 비약 {totalPotion}</span>
        </div>
      </div>

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
            {characters.map((c) => (
              <div
                key={c.id}
                className={`${styles.charItem} ${form.characterId === c.id ? styles.charSelected : ''}`}
                onClick={() => setForm((prev) => ({ ...prev, characterId: c.id }))}
              >
                <span>{c.nickname}</span>
                <span className={styles.charSub}>Lv.{c.level} · 메소{c.mesoRate}% · 드랍{c.dropRate}%</span>
              </div>
            ))}
          </div>

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

          <label className={styles.label}>코어젬스톤</label>
          <input className={styles.input} type="number" name="coreGem" min="0" placeholder="0" value={form.coreGem} onChange={handleChange} />

          <div className={styles.consumableSection}>
            <span className={styles.label}>사용 재화</span>

            {([
              { key: 'unionWealth', amtKey: 'unionWealthAmt', label: '유니온의 부' },
              { key: 'unionLuck', amtKey: 'unionLuckAmt', label: '유니온의 행운' },
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