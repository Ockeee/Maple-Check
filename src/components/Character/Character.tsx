'use client'

import { useState } from 'react'
import ModalDefault from '../ModalDefault';
import styles from '@/styles/Character.module.css';
import { SERVERS, SERVER_IMAGES, JOBS } from '@/data/gameData';
import Image from 'next/image'
import { NavArrowDownSolid, NavArrowUpSolid } from 'iconoir-react';

type Character = {
    id: number
    server: string
    nickname: string
    job: string
    level: string
    mesoRate?: string
    dropRate?: string
}

// type Props = {
//     characters: Character[]
//     setCharacters: React.Dispatch<React.SetStateAction<Character[]>>
//     selectedIds: number[]
//     onToggle: (id: number) => void
// }

// export default function CharacterSection({ characters, setCharacters, selectedIds, onToggle }: Props) {
type Props = {
    characters: Character[]
    setCharacters: React.Dispatch<React.SetStateAction<Character[]>>
}
    
export default function CharacterSection({ characters, setCharacters }: Props) {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({ server: '', nickname: '', job: '', level: '', mesoRate: '', dropRate: '' })
    const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    };

    const handleSubmit = () => {
        if (!form.nickname) return
        setCharacters((prev) => [...prev, { ...form, id: Date.now() }])
        setForm({ server: '', nickname: '', job: '', level: '', mesoRate: '', dropRate: '' })
        setOpen(false)
    };

    const grouped = characters.reduce<Record<string, Character[]>>((acc, c) => {
        if (!acc[c.server]) acc[c.server] = []
        acc[c.server].push(c)
        return acc
    }, {});
    
    const toggleCollapse = (server: string) => {
        setCollapsed((prev) => ({ ...prev, [server]: !prev[server] }))
    };

    return (
        <div className={styles.section}>
        <div className={styles.top}>
            <span className={styles.label}>내 캐릭터</span>
            <button className={styles.addBtn} onClick={() => setOpen(true)}>+ 추가</button>
        </div>

        <div className={styles.list}>
        {Object.entries(grouped).map(([server, chars]) => {
            // const selectedCount = chars.filter((c) => selectedIds.includes(c.id)).length
            const selectedCount = chars.length

            return (
                <div key={server} className={styles.serverGroup}>
                    <div className={styles.serverLabel}>
                        {SERVER_IMAGES[server] && (
                            <Image src={SERVER_IMAGES[server]} alt={server} width={24} height={24} />
                        )}
                            <span className={styles.severName}>{server}</span>
                            {selectedCount > 0 && (
                            <span className={styles.selectedCount}>{selectedCount}</span>
                        )}
                        <button className={styles.collapseBtn} onClick={() => toggleCollapse(server)}>
                            {collapsed[server] ? <NavArrowDownSolid className={styles.icon}/> : <NavArrowUpSolid className={styles.icon}/>}
                        </button>
                    </div>

                    {!collapsed[server] && chars.map((c) => (
                        <div key={c.id} className={styles.card}>
                            <div className={styles.cardInfo}>
                                <span className={styles.nickname}>{c.nickname}</span>
                                <div className={styles.info}>
                                    <span className={styles.job}>{c.job}</span>
                                    · 
                                    <span className={styles.level}>Lv.{c.level}</span> 
                                </div>
                            </div>
                            {/* <div
                                className={`${styles.checkbox} ${selectedIds.includes(c.id) ? styles.checked : ''}`}
                                onClick={() => onToggle(c.id)}
                            /> */}
                        </div>
                    ))}
                </div>
                )
            })}
        </div>

        {open && (
            <ModalDefault onClose={() => setOpen(false)} closeOnOverlay={false}>
                <h2>캐릭터 추가</h2>
                <select name="server" value={form.server} onChange={(e) => setForm(prev => ({ ...prev, server: e.target.value }))} className={styles.input}>
                <option value="">서버 선택</option>
                    {SERVERS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>

                <select name="job" value={form.job} onChange={(e) => setForm(prev => ({ ...prev, job: e.target.value }))} className={styles.input}>
                    <option value="">직업 선택</option>
                    {JOBS.map((j) => <option key={j} value={j}>{j}</option>)}
                </select>
                <input className={styles.input} name="nickname" placeholder="닉네임" value={form.nickname} onChange={handleChange} />
                <input className={styles.input} name="level" placeholder="레벨" value={form.level} onChange={handleChange} />
                <input className={styles.input} name="mesoRate" placeholder="메소획득률 (%)" value={form.mesoRate} onChange={handleChange} />
                <input className={styles.input} name="dropRate" placeholder="아이템드랍률 (%)" value={form.dropRate} onChange={handleChange} />
                <div className={styles.buttons}>
                <button className={styles.cancel} onClick={() => setOpen(false)}>취소</button>
                <button className={styles.confirm} onClick={handleSubmit}>추가</button>
                </div>
            </ModalDefault>
            )}
        </div>
    )
}