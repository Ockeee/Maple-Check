import { NextRequest, NextResponse } from 'next/server'

const KEY = process.env.NEXON_API_KEY!
const BASE = 'https://open.api.nexon.com/maplestory/v1'

function getYesterday() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}

async function nexon(path: string, retries = 3): Promise<any> {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(`${BASE}${path}`, {
      headers: { 'x-nxopen-api-key': KEY }
    })
    if (res.ok) return res.json()
    await new Promise(r => setTimeout(r, 500))
  }
  return {}
}

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get('name')
  if (!name) return NextResponse.json({ error: '닉네임 없음' }, { status: 400 })

  const { ocid } = await nexon(`/id?character_name=${encodeURIComponent(name)}`)
  if (!ocid) return NextResponse.json({ error: '캐릭터를 찾을 수 없어요' }, { status: 404 })
  
  const date = getYesterday()

  const [basic, stat, popularity, ability, propensity, dojang, union, hexaStat, itemEquip, symbolEquip] = await Promise.all([
    nexon(`/character/basic?ocid=${ocid}&date=${date}`),
    nexon(`/character/stat?ocid=${ocid}&date=${date}`),
    nexon(`/character/popularity?ocid=${ocid}&date=${date}`),
    nexon(`/character/ability?ocid=${ocid}&date=${date}`),
    nexon(`/character/propensity?ocid=${ocid}&date=${date}`),
    nexon(`/character/dojang?ocid=${ocid}&date=${date}`),
    nexon(`/user/union?ocid=${ocid}&date=${date}`),
    nexon(`/character/hexamatrix-stat?ocid=${ocid}&date=${date}`),
    nexon(`/character/item-equipment?ocid=${ocid}&date=${date}`),
    nexon(`/character/symbol-equipment?ocid=${ocid}&date=${date}`),
])

  const getStat = (statName: string) =>
    stat.final_stat?.find((s: any) => s.stat_name === statName)?.stat_value ?? '0'
 
  const starforce = (itemEquip.item_equipment ?? [])
    .reduce((sum: number, item: any) => sum + (Number(item.starforce) || 0), 0)

  const arcaneForce = (symbolEquip.symbol ?? [])
      .filter((s: any) => s.symbol_name?.includes('아케인'))
      .reduce((sum: number, s: any) => sum + (Number(s.symbol_force) || 0), 0)

  const authenticForce = (symbolEquip.symbol ?? [])
      .filter((s: any) => s.symbol_name?.includes('어센틱'))
      .reduce((sum: number, s: any) => sum + (Number(s.symbol_force) || 0), 0)

  return NextResponse.json({
    // 기본 정보
    server: basic.world_name,
    nickname: basic.character_name,
    job: basic.character_class,
    jobDetail: basic.character_class_level,
    level: String(basic.character_level),
    exp: basic.character_exp,
    expRate: basic.character_exp_rate,
    gender: basic.character_gender,
    guild: basic.character_guild_name ?? '',
    image: basic.character_image,
    union: union.union_level,
    date: basic.date,

    // 스탯
    combatPower: getStat('전투력'),
    hp: getStat('최대 HP'),
    mp: getStat('최대 MP'),
    str: getStat('STR'),
    dex: getStat('DEX'),
    int: getStat('INT'),
    luk: getStat('LUK'),
    damage: getStat('데미지'),
    bossDamage: getStat('보스 몬스터 데미지'),
    finalDamage: getStat('최종 데미지'),
    ignoreDefense: getStat('방어율 무시'),
    critRate: getStat('크리티컬 확률'),
    critDamage: getStat('크리티컬 데미지'),
    mesoRate: getStat('메소 획득량'),
    dropRate: getStat('아이템 드롭률'),
    cooldownReduce: getStat('재사용 대기시간 감소 (%)'),
    speed: getStat('이동속도'),
    jump: getStat('점프력'),
    statAttack: getStat('스탯 공격력'),
    attackPower: getStat('공격력'),
    magicPower: getStat('마력'),
    normalDamage: getStat('일반 몬스터 데미지'),
    buffDuration: getStat('버프 지속시간'),
    cooldownReduceSec: getStat('재사용 대기시간 감소 (초)'),
    ignoreElemental: getStat('속성 내성 무시'),
    weaponMastery: getStat('무기 숙련도'),
    statusDamage: getStat('상태이상 추가 데미지'),
    expBonus: getStat('추가 경험치'),

    // 인기도
    popularity: popularity.popularity,

    // 어빌리티
    ability: ability.ability_info?.map((a: any) => ({
      grade: a.ability_grade,
      value: a.ability_value,
    })) ?? [],

    // 성향
    propensity: {
      charisma: propensity.charisma_level,
      sensibility: propensity.sensibility_level,
      insight: propensity.insight_level,
      willingness: propensity.willingness_level,
      handicraft: propensity.handicraft_level,
      charm: propensity.charm_level,
    },

    // 무릉도장
    dojang: {
      bestFloor: dojang.dojang_best_floor,
      bestTime: dojang.dojang_best_time,
    },

    // 헥사 스탯
    hexaStat: hexaStat.character_hexa_stat_core ?? [],

    starforce: String(starforce),
    arcaneForce: String(arcaneForce),
    authenticForce: String(authenticForce),
  })
}