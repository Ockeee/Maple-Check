import { NextRequest, NextResponse } from 'next/server'

const KEY = process.env.NEXON_API_KEY!
const BASE = 'https://open.api.nexon.com/maplestory/v1'

async function nexon(path: string) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'x-nxopen-api-key': KEY }
  })
  return res.json()
}

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get('name')
  if (!name) return NextResponse.json({ error: '닉네임 없음' }, { status: 400 })

  const { ocid } = await nexon(`/id?character_name=${encodeURIComponent(name)}`)
  if (!ocid) return NextResponse.json({ error: '캐릭터를 찾을 수 없어요' }, { status: 404 })

  const [basic, stat, popularity, ability, propensity, dojang, union, hexaStat] = await Promise.all([
    nexon(`/character/basic?ocid=${ocid}`),
    nexon(`/character/stat?ocid=${ocid}`),
    nexon(`/character/popularity?ocid=${ocid}`),
    nexon(`/character/ability?ocid=${ocid}`),
    nexon(`/character/propensity?ocid=${ocid}`),
    nexon(`/character/dojang?ocid=${ocid}`),
    nexon(`/user/union?ocid=${ocid}`),
    nexon(`/character/hexamatrix-stat?ocid=${ocid}`),
  ])

  const getStat = (statName: string) =>
    stat.final_stat?.find((s: any) => s.stat_name === statName)?.stat_value ?? '0'

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
  })
}