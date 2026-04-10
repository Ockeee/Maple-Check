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

  function formatKorean(num: number): string {
    const 억 = Math.floor(num / 100000000);
    const 만 = Math.floor((num % 100000000) / 10000);
    const 나머지 = num % 10000;
  
    let result = '';
    if (억 > 0) result += `${억}억 `;
    if (만 > 0) result += `${만}만 `;
    if (나머지 > 0) result += `${나머지}`;
  
    return result.trim();
  }

  const gradeClass: Record<string, string> = {
    '레전드리': styles.legendary,
    '유니크': styles.unique,
    '에픽': styles.epic,
    '레어': styles.lare,
  };
  
  return (
      <div className={styles.wrap}>
        <div className={styles.header}>
          <span className={styles.title}>CHARACTER INFO</span>
        </div>

        <div className={styles.profile}>
            <span className={styles.job}>{info.job}</span>
            <span className={styles.level}>Lv. {info.level}</span>
          <div className={styles.profile_main}>
            <div className={styles.profile_column}>
              <div className={styles.profile_Row}><span className={styles.profile_title}>유니온</span><span>{info.union || '-'}</span></div>
              <div className={styles.profile_Row}><span className={styles.profile_title}>인기도</span><span>{info.popularity}</span></div>
            </div>
            <div className={styles.profile_column2}>
              <div className={styles.imageWrap}>
              {info.image && (
                <Image src={info.image} alt={info.nickname} width={180} height={180} className={styles.profile_image}/>
              )}
              </div>
              <span className={styles.profile_nickname}>{info.nickname}</span>
            </div>
            <div className={styles.profile_column}>
              <div className={styles.profile_Row}><span className={styles.profile_title}>길드</span><span>{info.guild || '-'}</span></div>
              <div className={styles.profile_Row}><span className={styles.profile_title}>무릉도장</span><span>{info.dojang?.bestFloor ?? '-'}층</span></div>
            </div>
          </div>
        </div>

        <div className={styles.content}>
            <div className={styles.basicGrid}>
                <div className={styles.combatPower}>
                  <span>전투력</span>
                  <span className={styles.combatStat}>{formatKorean(Number(info.combatPower))}</span>
                </div>
                <div className={styles.statGrid}>
                {[
                    ['HP', info.hp], ['MP', info.mp],
                    ['STR', info.str], ['DEX', info.dex],
                    ['INT', info.int], ['LUK', info.luk],
                ].map(([label, value]) => (
                    <div key={label} className={styles.statItem}>
                      <span className={styles.statTitle}>{label}</span>
                      <span>{Number(value).toLocaleString()}</span>
                    </div>
                ))}
                </div>
            </div>

            <div className={styles.statGrid2}>
                {[
                ['스탯 공격력', info.statAttack],['데미지', `${info.damage}%`],
                ['최종 데미지', `${info.finalDamage}%`],['보스 몬스터 데미지', `${info.bossDamage}%`],
                ['방어율 무시', `${info.ignoreDefense}%`],['일반 몬스터 데미지', `${info.normalDamage}%`],
                ['공격력', info.attackPower],['크리티컬 확률', `${info.critRate}%`],
                ['마력', info.magicPower],['크리티컬 데미지', `${info.critDamage}%`],
                ['재사용 대기시간 감소', `${info.cooldownReduceSec}초 / ${info.cooldownReduce}%`],['버프 지속시간', `${info.buffDuration}%`],
                ['재사용 대기시간 미적용', `${info.cooldownReduceSec || 0}%`],['속성 내성 무시', `${info.ignoreElemental}%`],
                ['상태이상 추가 데미지', `${info.statusDamage}%`],['무기 숙련도', `${info.weaponMastery}%`],
                ].map(([label, value]) => (
                  <div key={label} className={styles.statItem}>
                      <span className={styles.statTitle2}>{label}</span>
                      <span className={styles.statText}>{value}</span>
                  </div>
                ))}
            </div>

            <div className={styles.statGrid2}>
                {[
                ['메소 획득량', `${info.mesoRate}%`],['스타포스', info.starforce],
                ['아이템 드롭률', `${info.dropRate}%`],['아케인포스', info.arcaneForce],
                ['추가 경험치', `${info.expBonus}%`],['어센틱포스', info.authenticForce],
                ].map(([label, value]) => (
                  <div key={label} className={styles.statItem}>
                      <span className={styles.statTitle2}>{label}</span>
                      <span className={styles.statText}>{value}</span>
                  </div>
                ))}
            </div>

            <div className={styles.abilityList}>
              <p className={styles.ability}>ABILITY</p>
                <div className={styles.ability_div}>
                {(info.ability ?? []).map((a, i) => (
                    <div key={i} className={`${styles.abilityItem} ${styles[a.grade?.toLowerCase()]}`}>
                      <span className={`${styles.abilityGrade} ${gradeClass[a.grade] ?? ''}`}>{a.value}</span>
                    </div>
                ))}
          </div>
        </div>
      </div>
    </div>
  )
}