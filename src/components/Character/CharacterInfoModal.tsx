'use client'

import { useState } from 'react'
import Image from 'next/image'
import ModalDefault from '../ModalDefault'
import styles from '@/styles/Character.module.css';

type Ability = { grade: string; value: string }

type CharInfo = {
    server: string
    nickname: string
    job: string
    jobDetail?: string
    level: string
    gender?: string
    guild?: string
    image?: string
    union?: number
    dojang?: { bestFloor: string | null; bestTime: string | null }
    popularity?: number
    combatPower?: string
    hp?: string; mp?: string
    str?: string; dex?: string; int?: string; luk?: string
    attackPower?: string; magicPower?: string; statAttack?: string
    damage?: string; finalDamage?: string
    bossDamage?: string; normalDamage?: string
    ignoreDefense?: string
    critRate?: string; critDamage?: string
    cooldownReduce?: string; cooldownReduceSec?: string; buffDuration?: string
    ignoreElemental?: string; weaponMastery?: string; statusDamage?: string
    mesoRate?: string; dropRate?: string; expBonus?: string
    starforce?: string; arcaneForce?: string; authenticForce?: string
    ability?: Ability[]
}

type Props = {
  info: CharInfo
}

export default function CharacterInfoModal({ info }: Props) {

  return (
      <div className={styles.wrap}>
        <div className={styles.header}>
          <span className={styles.title}>CHARACTER INFO</span>
        </div>

        <div className={styles.profile}>
            <span className={styles.tag}>{info.job}</span>
            <span className={styles.level}>Lv. {info.level}</span>
          <div className={styles.tags}>
            {info.popularity && <span className={styles.tag}>{info.popularity}</span>}
          </div>
          <div className={styles.imageWrap}>
            {info.image && (
              <Image src={info.image} alt={info.nickname} width={120} height={120} />
            )}
          </div>
          <div className={styles.profileRight}>
            <div className={styles.infoRow}><span>길드</span><span>{info.guild || '-'}</span></div>
            <div className={styles.infoRow}><span>연랭</span><span>{info.server}</span></div>
          </div>
          <div className={styles.profileBottom}>
            <div className={styles.infoRow}><span>유니온</span><span>{info.union}</span></div>
            <div className={styles.infoRow}><span>무릉도장</span><span>{info.dojang?.bestFloor ?? '-'}층</span></div>
            <div className={styles.infoRow}><span>인기도</span><span>{info.popularity}</span></div>
          </div>
        </div>

        <div className={styles.content}>
            <div className={styles.basicGrid}>
                <div className={styles.combatPower}>
                <span>전투력</span>
                <span>{Number(info.combatPower).toLocaleString()}</span>
                </div>
                <div className={styles.statGrid}>
                {[
                    ['HP', info.hp], ['MP', info.mp],
                    ['STR', info.str], ['DEX', info.dex],
                    ['INT', info.int], ['LUK', info.luk],
                ].map(([label, value]) => (
                    <div key={label} className={styles.statItem}>
                    <span>{label}</span><span>{Number(value).toLocaleString()}</span>
                    </div>
                ))}
                </div>
            </div>

            <div className={styles.statList}>
                {[
                ['스탯 공격력', info.statAttack],
                ['데미지', `${info.damage}%`],
                ['최종 데미지', `${info.finalDamage}%`],
                ['보스 몬스터 데미지', `${info.bossDamage}%`],
                ['일반 몬스터 데미지', `${info.normalDamage}%`],
                ['방어율 무시', `${info.ignoreDefense}%`],
                ['공격력', info.attackPower],
                ['마력', info.magicPower],
                ['크리티컬 확률', `${info.critRate}%`],
                ['크리티컬 데미지', `${info.critDamage}%`],
                ['재사용 감소', `${info.cooldownReduce}% / ${info.cooldownReduceSec}초`],
                ['버프 지속시간', `${info.buffDuration}%`],
                ['속성 내성 무시', `${info.ignoreElemental}%`],
                ['무기 숙련도', `${info.weaponMastery}%`],
                ['상태이상 추가 데미지', `${info.statusDamage}%`],
                ['메소 획득량', `${info.mesoRate}%`],
                ['아이템 드롭률', `${info.dropRate}%`],
                ['추가 경험치', `${info.expBonus}%`],
                ['스타포스', info.starforce],
                ['아케인포스', info.arcaneForce],
                ['어센틱포스', info.authenticForce],
                ].map(([label, value]) => (
                <div key={label} className={styles.statRow}>
                    <span>{label}</span><span>{value}</span>
                </div>
                ))}
            </div>

            <div className={styles.abilityList}>
                {(info.ability ?? []).map((a, i) => (
                <div key={i} className={`${styles.abilityItem} ${styles[a.grade.toLowerCase()]}`}>
                    <span className={styles.abilityGrade}>{a.grade}</span>
                    <span>{a.value}</span>
                </div>
                ))}
            </div>
            </div>
      </div>
  )
}