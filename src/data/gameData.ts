export const SERVERS = [
    '스카니아', 
    '베라', 
    '루나', 
    '제니스', 
    '크로아', 
    '유니온', 
    '엘리시움', 
    '이노시스', 
    '레드', 
    '오로라', 
    '아케인', 
    '노바',
    '에오스',
    '헬리오스',
    '챌린저스',
]
export const SERVER_IMAGES: Record<string, string> = {
    '스카니아': '/images/스카니아.png',
    '베라': '/images/베라.png',
    '루나': '/images/루나.png',
    '제니스': '/images/제니스.png',
    '크로아': '/images/크로아.png',
    '유니온': '/images/유니온.png',
    '엘리시움': '/images/엘리시움.png',
    '이노시스': '/images/이노시스.png',
    '레드': '/images/레드.png',
    '오로라': '/images/오로라.png',
    '아케인': '/images/아케인.png',
    '노바': '/images/노바.png',
    '에오스': '/images/에오스.png',
    '헬리오스': '/images/헬리오스.png',
    '챌린저스': '/images/챌린저스.png',
}

export const JOBS = [
    '히어로', '팔라딘', '다크나이트',  // 초보자 전사
    '아크메이지(불,독)', '아크메이지(썬,콜)', '비숍',  // 초보자 마법사
    '보우마스터', '신궁', '패스파인더',  // 초보자 궁수
    '나이트로드', '섀도어', '듀얼블레이드', // 초보자 도적
    '바이퍼', '캡틴', '캐논슈터', // 초보자 해적
    '소울마스터', '플레임위자드', '윈드브레이커', '나이트워커','스트라이커', '미하일', // 시그너스 기사단
    '블래스터', '배틀메이지', '와일드헌터', '메카닉','제논', // 레지스탕스
    '아란', '에반', '메르세데스', '팬텀', '은월', '루미너스', // 영웅
    '데몬슬레이어', '데몬어벤져', // 데몬
    '카이저', '카인', '카데나', '엔젤릭버스터', // 노바
    '제로', // 초월자
    '키네시스', // 프렌즈 월드
    '아델', '일리움', '칼리', '아크',  // 레프
    '호영', '라라', '렌' // 아니마
]

export type Boss = {
    name: string
    difficulty: string
    reward: number  // 수익
}

export const BOSSES: Boss[] = [
    { name: '시그너스', difficulty: '이지', reward: 4550000 },
    { name: '시그너스', difficulty: '노말', reward: 7500000 },
    { name: '힐라', difficulty: '하드', reward: 5750000},
    { name: '핑크빈', difficulty: '카오스', reward: 6580000 },
    { name: '자쿰', difficulty: '카오스', reward: 8080000 },
    { name: '블러디퀸', difficulty: '카오스', reward: 8140000 },
    { name: '반반', difficulty: '카오스', reward: 8150000 },
    { name: '피에르', difficulty: '카오스', reward: 8170000},
    { name: '매그너스', difficulty: '하드', reward: 8560000},
    { name: '벨룸', difficulty: '카오스', reward: 9280000},
    { name: '파풀라투스', difficulty: '카오스', reward: 13800000},
    { name: '스우', difficulty: '노말', reward: 17600000},
    { name: '스우', difficulty: '하드', reward: 54200000},
    { name: '스우', difficulty: '익스트림', reward: 604000000},
    { name: '데미안', difficulty: '노말', reward: 18400000},
    { name: '데미안', difficulty: '하드', reward: 51500000 },
    { name: '가디언 엔젤 슬라임', difficulty: '노말', reward: 26800000 },
    { name: '가디언 엔젤 슬라임', difficulty: '카오스', reward: 79100000 },
    { name: '루시드', difficulty: '노말', reward: 37500000 },
    { name: '루시드', difficulty: '하드', reward: 66200000 },
    { name: '윌', difficulty: '노말', reward: 43300000},
    { name: '윌', difficulty: '하드', reward: 81200000 },
    { name: '더스크', difficulty: '노말', reward: 46300000 },
    { name: '더스크', difficulty: '카오스', reward: 73500000 },
    { name: '진 힐라', difficulty: '노말', reward: 74900000 },
    { name: '진 힐라', difficulty: '하드', reward: 112000000 },
    { name: '듄켈', difficulty: '노말', reward: 50000000 },
    { name: '듄켈', difficulty: '하드', reward: 99400000 },
    { name: '선택받은 세렌', difficulty: '노말', reward: 266000000 },
    { name: '선택받은 세렌', difficulty: '하드', reward: 396000000 },
    { name: '선택받은 세렌', difficulty: '익스트림', reward: 396000000 },
    { name: '감시자 칼로스', difficulty: '이지', reward: 311000000 },
    { name: '감시자 칼로스', difficulty: '노말', reward: 561000000 },
    { name: '감시자 칼로스', difficulty: '카오스', reward: 1340000000 },
    { name: '감시자 칼로스', difficulty: '익스트림', reward: 4320000000 },
    { name: '카링', difficulty: '이지', reward: 419000000 },
    { name: '카링', difficulty: '노말', reward: 714000000 },
    { name: '카링', difficulty: '하드', reward: 1830000000 },
    { name: '카링', difficulty: '익스트림', reward: 5670000000 },
    { name: '최초의 대적자', difficulty: '이지', reward: 324000000 },
    { name: '최초의 대적자', difficulty: '노말', reward: 589000000 },
    { name: '최초의 대적자', difficulty: '하드', reward: 1510000000 },
    { name: '최초의 대적자', difficulty: '익스트림', reward: 4960000000 },
    { name: '찬란한 흉성', difficulty: '노말', reward: 658000000 },
    { name: '찬란한 흉성', difficulty: '하드', reward: 2819000000 },
    { name: '림보', difficulty: '노말', reward: 1080000000 },
    { name: '림보', difficulty: '하드', reward: 2510000000 },
    { name: '발드릭스', difficulty: '노말', reward: 1440000000 },
    { name: '발드릭스', difficulty: '하드', reward: 3240000000 },
    { name: '유피테르', difficulty: '노말', reward: 1700000000 },
    { name: '유피테르', difficulty: '하드', reward: 5100000000 },
]

export const MonthlyBoss: Boss[] = [
    { name: '검은마법사', difficulty: '하드', reward: 700000000 },
    { name: '검은마법사', difficulty: '익스트림', reward: 9200000000 },
]