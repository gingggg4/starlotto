import type { FortuneResult } from '@/types/fortune';

// ── 시드 기반 난수 생성 (FNV-1a 해시 + mulberry32 PRNG) ────────────
function hashToSeed(str: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

function createRng(seed: number) {
  let s = seed;
  return (): number => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// birthDate + zodiac + gender + 오늘 날짜 조합 → seed 문자열
function buildSeedKey(birthDate: string, zodiac: string, gender: string): string {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return `${birthDate}|${zodiac}|${gender}|${today}`;
}

// Fisher-Yates shuffle로 1~max 중 count개 고유 숫자 추출 (오름차순)
function pickUniqueNumbers(rng: () => number, min: number, max: number, count: number): number[] {
  const pool = Array.from({ length: max - min + 1 }, (_, i) => i + min);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count).sort((a, b) => a - b);
}

function pickFrom<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

// ── 데이터 풀 ──────────────────────────────────────────────────────

// 별자리별 운세 (각 3개씩) — seed 인덱스로 1개 선택
const ZODIAC_FORTUNES: Record<string, string[]> = {
  양자리: [
    '새로운 도전의 기운이 가득합니다. 오늘 한 걸음 내딛으면 큰 변화가 시작됩니다.',
    '열정이 최고조에 달하는 날입니다. 원하는 것을 직접 말하면 좋은 결과가 찾아옵니다.',
    '행동력이 빛을 발하는 날! 미뤄왔던 일을 오늘 시작하면 순조롭게 풀립니다.',
  ],
  황소자리: [
    '안정과 풍요의 기운이 감돕니다. 꾸준한 노력이 오늘 빛을 발할 것입니다.',
    '작은 사치를 허락하는 날입니다. 좋아하는 것에 시간을 쓰면 활력이 넘칩니다.',
    '인내의 결실을 맺는 날입니다. 기다려온 좋은 소식이 곧 들려올 것 같습니다.',
  ],
  쌍둥이자리: [
    '소통의 기운이 풍부합니다. 오늘 나눈 대화가 소중한 인연으로 발전할 수 있습니다.',
    '아이디어가 샘솟는 날입니다. 떠오르는 생각을 메모해두면 나중에 빛을 발합니다.',
    '다재다능한 매력이 빛나는 날! 여러 가지를 동시에 도전해도 잘 풀립니다.',
  ],
  게자리: [
    '감성과 직관이 예리해지는 날입니다. 마음의 소리에 귀 기울이면 좋은 선택을 합니다.',
    '소중한 사람들과의 유대가 깊어집니다. 따뜻한 한마디가 관계를 더욱 돈독하게 합니다.',
    '집과 가족에서 행운이 찾아옵니다. 가까운 사람의 조언에 귀 기울여 보세요.',
  ],
  사자자리: [
    '빛나는 존재감이 주목을 받는 날입니다. 자신 있게 나서면 원하는 바를 이룹니다.',
    '창의적인 에너지가 폭발하는 날! 예술적 감각을 활용하면 큰 성과를 거둡니다.',
    '리더십이 돋보이는 날입니다. 주변을 이끄는 역할을 맡으면 모두가 따라옵니다.',
  ],
  처녀자리: [
    '세밀한 분석력이 빛을 발하는 날입니다. 꼼꼼하게 준비한 것이 좋은 결과를 냅니다.',
    '건강과 루틴에 신경 쓰면 좋은 날입니다. 작은 습관 하나가 큰 변화를 만듭니다.',
    '완벽주의적 재능이 인정받는 날! 디테일에 집중하면 원하는 결과를 얻습니다.',
  ],
  천칭자리: [
    '조화와 균형의 기운이 감돕니다. 양쪽을 배려하는 태도가 모두를 행복하게 합니다.',
    '예술적 감각이 빛나는 날입니다. 아름다운 것에 둘러싸이면 영감이 떠오릅니다.',
    '협력과 파트너십이 강조되는 날! 함께하면 혼자보다 훨씬 큰 성과를 낼 수 있습니다.',
  ],
  전갈자리: [
    '직관과 통찰력이 극대화되는 날입니다. 숨겨진 진실을 꿰뚫어 보는 능력이 발휘됩니다.',
    '변화와 혁신의 기운이 강합니다. 오래된 것을 내려놓으면 새로운 것이 들어옵니다.',
    '집중력이 최고조에 달하는 날! 중요한 프로젝트에 몰입하면 놀라운 성과가 나옵니다.',
  ],
  사수자리: [
    '모험과 자유의 기운이 넘칩니다. 새로운 경험에 열린 마음으로 뛰어들어 보세요.',
    '낙관적인 에너지가 주변을 밝힙니다. 긍정적인 태도가 행운을 불러옵니다.',
    '지식과 배움에서 기쁨을 찾는 날! 새로운 것을 배우면 예상치 못한 기회가 열립니다.',
  ],
  염소자리: [
    '성실한 노력이 인정받는 날입니다. 꾸준히 쌓아온 것들이 드디어 빛을 발합니다.',
    '목표를 향한 집중력이 빛나는 날! 한 발씩 나아가면 반드시 정상에 도달합니다.',
    '책임감과 신뢰가 새로운 기회를 만듭니다. 맡은 일에 최선을 다하면 보상이 따릅니다.',
  ],
  물병자리: [
    '독창적인 아이디어가 세상을 놀라게 합니다. 남다른 생각이 오늘의 강점입니다.',
    '인도주의적 에너지가 넘치는 날입니다. 주변을 돕는 행동이 더 큰 행운을 불러옵니다.',
    '혁신적인 발상으로 문제를 해결하는 날! 기존 방식을 벗어나면 훨씬 좋은 답이 보입니다.',
  ],
  물고기자리: [
    '풍부한 감수성이 공감 능력을 높이는 날입니다. 상대방의 마음을 잘 이해하게 됩니다.',
    '창의력과 영감이 충만한 날! 예술적 활동을 하면 뜻밖의 재능이 꽃피웁니다.',
    '직관이 가장 예리해지는 날입니다. 첫 번째 느낌을 믿으면 좋은 선택을 하게 됩니다.',
  ],
};

const COLORS: { name: string; hex: string }[] = [
  { name: '보라색', hex: '#8B5CF6' },
  { name: '황금색', hex: '#F59E0B' },
  { name: '민트색', hex: '#10B981' },
  { name: '분홍색', hex: '#EC4899' },
  { name: '하늘색', hex: '#3B82F6' },
  { name: '산호색', hex: '#F97316' },
  { name: '연두색', hex: '#84CC16' },
  { name: '청록색', hex: '#06B6D4' },
  { name: '장미색', hex: '#F43F5E' },
  { name: '인디고', hex: '#6366F1' },
  { name: '오렌지', hex: '#FB923C' },
  { name: '라임색', hex: '#A3E635' },
];

const PLACES: string[] = [
  '카페', '공원', '도서관', '서점', '미술관',
  '영화관', '산책로', '바닷가', '한강', '벚꽃길',
  '문화센터', '카페거리', '공연장', '독립서점', '꽃집',
  '전망대', '빵집', '시장', '사진관', '수영장',
  '산', '놀이공원', '식물원', '박물관',
];

const LUCKY_DAYS: string[] = [
  '월요일', '화요일', '수요일', '목요일',
  '금요일', '토요일', '일요일', '이번 주말',
];

// 타로 5장 — 메이저 아르카나 중 가장 긍정적인 정방향 의미를 가진 카드
const TAROT_CARDS = [
  {
    name: '태양',
    nameEn: 'The Sun',
    emoji: '☀️',
    keyword: '성공·기쁨',
    meaning: '밝은 에너지가 가득한 날. 노력의 결실이 빛나기 시작합니다.',
  },
  {
    name: '별',
    nameEn: 'The Star',
    emoji: '⭐',
    keyword: '희망·치유',
    meaning: '오랜 기다림 끝에 희망의 빛이 보입니다. 마음의 평화가 찾아옵니다.',
  },
  {
    name: '마술사',
    nameEn: 'The Magician',
    emoji: '🪄',
    keyword: '실행·창조',
    meaning: '모든 도구가 갖춰진 날. 의지를 행동으로 옮기면 원하는 것을 이룹니다.',
  },
  {
    name: '여황제',
    nameEn: 'The Empress',
    emoji: '👑',
    keyword: '풍요·창조',
    meaning: '풍요와 사랑의 기운이 가득합니다. 마음의 여유가 새로운 기회를 만듭니다.',
  },
  {
    name: '세계',
    nameEn: 'The World',
    emoji: '🌍',
    keyword: '완성·성취',
    meaning: '한 사이클의 완성. 그동안 쌓아온 모든 것이 결실을 맺는 시기입니다.',
  },
];

// 종합 점수 + 4가지 운 점수 계산 (seed 기반)
function generateScore(rng: () => number) {
  // 종합 점수: 60~99 사이 (너무 낮으면 기분 나쁘니까)
  const total = 60 + Math.floor(rng() * 40);
  // 세부 점수: 2~5 별 (1점은 없음)
  return {
    total,
    love: 2 + Math.floor(rng() * 4),
    money: 2 + Math.floor(rng() * 4),
    health: 2 + Math.floor(rng() * 4),
    work: 2 + Math.floor(rng() * 4),
  };
}

// ── 공개 함수 ──────────────────────────────────────────────────────
export function getFallbackFortune(
  zodiac: string,
  zodiacEmoji: string,
  birthDate = '',
  gender = '',
): FortuneResult {
  const seedKey = buildSeedKey(birthDate, zodiac, gender);
  const rng = createRng(hashToSeed(seedKey));

  // 별자리별 운세 풀에서 날짜+생년월일 기반으로 1개 선택
  const fortunePool = ZODIAC_FORTUNES[zodiac] ?? ZODIAC_FORTUNES['양자리'];
  const fortune = fortunePool[Math.floor(rng() * fortunePool.length)];

  const color = pickFrom(rng, COLORS);
  const luckyPlace = pickFrom(rng, PLACES);
  const luckyDay = pickFrom(rng, LUCKY_DAYS);
  const tarot = pickFrom(rng, TAROT_CARDS);
  const score = generateScore(rng);
  const luckyNumbers = pickUniqueNumbers(rng, 1, 45, 6);
  const lotto1 = pickUniqueNumbers(rng, 1, 45, 6);
  const lotto2 = pickUniqueNumbers(rng, 1, 45, 6);

  return {
    zodiac,
    zodiacEmoji,
    fortune,
    score,
    tarot,
    luckyNumbers,
    luckyColor: color.name,
    luckyColorHex: color.hex,
    luckyPlace,
    luckyDay,
    lottoNumbers: [lotto1, lotto2],
  };
}
