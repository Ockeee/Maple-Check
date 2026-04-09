'use client'

import { useState, useEffect } from 'react'
import ModalDefault from '../ModalDefault';
import styles from '@/styles/Character.module.css';
import { SERVERS, SERVER_IMAGES, JOBS } from '@/data/gameData';
import Image from 'next/image';
import { NavArrowDownSolid, NavArrowUpSolid } from 'iconoir-react';
import { createClient } from '@/lib/supabase/client';
import CharacterInfoModal from './CharacterInfoModal';

type Character = {
    id: string 
    server: string
    nickname: string
    job: string
    level: string
    image?: string
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
    const [form, setForm] = useState({ image: '', server: '', nickname: '', job: '', level: '', mesoRate: '', dropRate: '' })
    const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
    const supabase = createClient();
    const [searching, setSearching] = useState(false)
    const [searchError, setSearchError] = useState('')
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [infoModal, setInfoModal] = useState<any>(null)

    useEffect(() => {
        const fetch = async () => {
          const { data } = await supabase
            .from('characters')
            .select('*')
            .order('created_at', { ascending: true })
          if (data) {
            setCharacters(data.map((c) => ({
              id: c.id,
              server: c.server,
              nickname: c.nickname,
              job: c.job,
              level: c.level,
              mesoRate: c.meso_rate,
              dropRate: c.drop_rate,
              image: c.image, 
            })))
          }
        }
        fetch()
      }, [])

    const handleSearch = async () => {
        if (!form.nickname) return
        setSearching(true)
        setSearchError('')
        const res = await fetch(`/api/character?name=${encodeURIComponent(form.nickname)}`)
        const data = await res.json()
        setSearching(false)
        if (data.error) return setSearchError(data.error)
        setForm(prev => ({ ...prev, ...data }))
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    };

    const handleCardClick = async (c: Character) => {
        const res = await fetch(`/api/character?name=${encodeURIComponent(c.nickname)}`)
        const data = await res.json()
        setInfoModal(data)
      }

    const handleSubmit = async () => {
        if (!form.nickname) return
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
      
        const { data, error } = await supabase
          .from('characters')
          .insert({
            user_id: user.id,
            server: form.server,
            nickname: form.nickname,
            job: form.job,
            level: form.level,
            meso_rate: form.mesoRate,
            drop_rate: form.dropRate,
            image: form.image,
          })
          .select()
          .single()
      
        if (error || !data) return
        setCharacters((prev) => [...prev, {
          id: data.id,
          server: data.server,
          nickname: data.nickname,
          job: data.job,
          level: data.level,
          mesoRate: data.meso_rate,
          dropRate: data.drop_rate,
          image: data.image, 
        }])
        setForm({ image: '', server: '', nickname: '', job: '', level: '', mesoRate: '', dropRate: ''})
        setOpen(false)
    }

    const handleClose = () => {
        setOpen(false)
        setForm({ image: '', server: '', nickname: '', job: '', level: '', mesoRate: '', dropRate: '' })
        setSearchError('')
      }

    const handleDelete = async (id: string) => {
        const { error } = await supabase.from('characters').delete().eq('id', id)
        if (error) return
        setCharacters((prev) => prev.filter((c) => c.id !== id))
        setDeleteId(null)
      }

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
            <button className={styles.addBtn} onClick={() => setOpen(true)}>+ 캐릭터 추가</button>
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
                        <div key={c.id} className={styles.card} onClick={() => handleCardClick(c)}>
                            {c.image && (
                                <div className={styles.charImage}>
                                    <Image src={c.image!} alt={c.nickname} fill />
                                </div>
                            )}
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
                            <button onClick={() => setDeleteId(c.id)}>삭제</button>
                        </div>
                    ))}
                </div>
                )
            })}
        </div>

        {open && (
            <ModalDefault onClose={handleClose} closeOnOverlay={false} className={styles.charModal}>
                <h2>캐릭터 추가</h2>
                <div className={styles.searchRow}>
                    <input
                        className={styles.input}
                        name="nickname"
                        placeholder="닉네임 입력 후 검색"
                        value={form.nickname}
                        onChange={handleChange}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSearch() }}
                    />
                    <button onClick={handleSearch} disabled={searching}>
                        {searching ? '검색중...' : '검색'}
                    </button>
                </div>
                {searchError && <p>{searchError}</p>}
                {form.server && (
                    <CharacterInfoModal info={form} />
                )}
                <div className={styles.buttons}>
                    <button className={styles.cancel} onClick={handleClose}>취소</button>
                    <button className={styles.confirm} onClick={handleSubmit}>추가</button>
                </div>
            </ModalDefault>
        )}
        {deleteId && (
            <ModalDefault onClose={() => setDeleteId(null)} closeOnOverlay={false}>
                <p>정말 삭제하시겠어요?</p>
                <div className={styles.buttons}>
                <button className={styles.cancel} onClick={() => setDeleteId(null)}>취소</button>
                <button className={styles.confirm} onClick={() => handleDelete(deleteId)}>삭제</button>
                </div>
            </ModalDefault>
        )}
        </div>
    )
}