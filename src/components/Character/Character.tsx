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
    const [searchResult, setSearchResult] = useState<any>(null)

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
        setSearchResult(null)
        const res = await fetch(`/api/character?name=${encodeURIComponent(form.nickname)}`)
        const data = await res.json()
        setSearching(false)
        if (data.error) return setSearchError(data.error)
        setSearchResult(data)
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
        if (!searchResult) return
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
      
        const { data, error } = await supabase
          .from('characters')
          .insert({
            user_id: user.id,
            server: searchResult.server,
            nickname: searchResult.nickname,
            job: searchResult.job,
            level: searchResult.level,
            meso_rate: searchResult.mesoRate,
            drop_rate: searchResult.dropRate,
            image: searchResult.image,
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
        setSearchResult(null) 
        setOpen(false)
    }

    const handleClose = () => {
        setOpen(false)
        setForm({ image: '', server: '', nickname: '', job: '', level: '', mesoRate: '', dropRate: '' })
        setSearchResult(null)
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
    
    // const toggleCollapse = (server: string) => {
    //     setCollapsed((prev) => ({ ...prev, [server]: !prev[server] }))
    // };
    const toggleCollapse = (server: string) => {
        setCollapsed((prev) => {
            const isOpen = !prev[server]
            const allClosed = Object.keys(grouped).reduce<Record<string, boolean>>((acc, s) => {
                acc[s] = true
                return acc
            }, {})
            return isOpen ? allClosed : { ...allClosed, [server]: false }
        })
    }

    return (
        <div className={styles.section}>
        <div className={styles.top}>
            <span className={styles.label}>내 캐릭터</span>
            <button className={styles.addBtn} onClick={() => setOpen(true)}>+ 캐릭터 추가</button>
        </div>


        <div className={styles.serverTabs}>
        {Object.entries(grouped).map(([server, chars]) => (
            <button
                key={server}
                className={`${styles.serverTab} ${!collapsed[server] ? styles.serverTab_active : ''}`}
                onClick={() => toggleCollapse(server)}
            >
                {SERVER_IMAGES[server] && (
                    <Image src={SERVER_IMAGES[server]} alt={server} width={16} height={16} />
                )}
                <span>{server}</span>
                {chars.length > 0 && (
                    <span className={styles.selectedCount}>{chars.length}</span>
                )}
            </button>
        ))}
        </div>
        {Object.entries(grouped).map(([server, chars]) => {
            // const selectedCount = chars.filter((c) => selectedIds.includes(c.id)).length
            const selectedCount = chars.length

            return (
                <div key={server} className={styles.serverGroup}>
                    {/* <div className={styles.serverLabel}>
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
                    </div> */}

                    <div className={styles.card_group}>
                        {!collapsed[server] && chars.map((c) => (
                            <div key={c.id} className={styles.card} onClick={() => handleCardClick(c)}>
                                <div className={styles.cardInfo}>
                                    {c.image && (
                                        <div className={styles.charImage}>
                                            <Image src={c.image!} alt={c.nickname} width={140} height={140}/>
                                        </div>
                                    )}
                                    <span className={styles.card_nickname}>{c.nickname}</span>
                                    <div className={styles.card_text}>
                                        <span className={styles.card_job}>{c.job}</span>
                                        &nbsp; &middot; &nbsp;
                                        <span className={styles.card_level}>Lv.{c.level}</span> 
                                    </div>
                                    <button className={styles.delete_button} onClick={(e) => { e.stopPropagation(); setDeleteId(c.id) }}>X</button>
                                </div>
                                {/* <div
                                    className={`${styles.checkbox} ${selectedIds.includes(c.id) ? styles.checked : ''}`}
                                    onClick={() => onToggle(c.id)}
                                /> */}
                            </div>
                        ))}
                    </div>
                </div>
                )
            })}

        {open && (
            <ModalDefault onClose={handleClose} closeOnOverlay={false} className={styles.charModal}>
                <h2>내 캐릭터 추가</h2>
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
                {searchResult && (
                    <CharacterInfoModal info={searchResult} />
                )}
                <div className={styles.buttons}>
                    <button className={styles.cancel} onClick={handleClose}>취소</button>
                    <button className={styles.confirm} onClick={handleSubmit}>추가</button>
                </div>
            </ModalDefault>
        )}
        {deleteId && (
            <ModalDefault onClose={() => setDeleteId(null)} closeOnOverlay={false}>
                <p>내 캐릭터에서 삭제하시겠어요?</p>
                <div className={styles.buttons}>
                <button className={styles.cancel} onClick={() => setDeleteId(null)}>취소</button>
                <button className={styles.confirm} onClick={() => handleDelete(deleteId)}>삭제</button>
                </div>
            </ModalDefault>
        )}
        {infoModal && (
            <ModalDefault onClose={() => setInfoModal(null)} closeOnOverlay={true}>
                <CharacterInfoModal info={infoModal} />
                <div className={styles.buttons}>
                    <button className={styles.cancel} onClick={() => setInfoModal(null)}>닫기</button>
                </div>
            </ModalDefault>
        )}
        </div>
    )
}