type Character = {
  id: number
  server: string
  nickname: string
  job: string
  level: string
}

type Props = {
  characters: Character[]
}

export default function Boss({ characters }: Props) {
  return <div>{characters.length === 0 ? '캐릭터를 선택하세요' : '보스 섹션'}</div>
}