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

// 특정 숫자 제외하고 고유 숫자 추출
function pickUniqueNumbersExcluding(rng: () => number, min: number, max: number, count: number, exclude: number): number[] {
  const pool = Array.from({ length: max - min + 1 }, (_, i) => i + min).filter((n) => n !== exclude);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

// 로또 통계 패턴 체크 (자주 나오는 조합인지)
function isBalancedLottoSet(set: number[]): boolean {
  // 1. 합계 100~175
  const sum = set.reduce((a, b) => a + b, 0);
  if (sum < 100 || sum > 175) return false;

  // 2. 홀수 2~4개 (즉 홀짝 비율 2:4 ~ 4:2)
  const odds = set.filter((n) => n % 2 === 1).length;
  if (odds < 2 || odds > 4) return false;

  // 3. 번호대 분포 체크 (1-9, 10-19, 20-29, 30-39, 40-45)
  const ranges = [0, 0, 0, 0, 0];
  for (const n of set) {
    if (n <= 9) ranges[0]++;
    else if (n <= 19) ranges[1]++;
    else if (n <= 29) ranges[2]++;
    else if (n <= 39) ranges[3]++;
    else ranges[4]++;
  }
  // 최소 3개 번호대 사용
  if (ranges.filter((r) => r > 0).length < 3) return false;
  // 한 번호대에 3개 초과 금지
  if (ranges.some((r) => r > 3)) return false;

  return true;
}

// 통계 패턴 만족하는 로또 세트 1개 생성 (행운 숫자 포함)
function generateBalancedLottoSet(rng: () => number, luckyNumber: number): number[] {
  for (let attempt = 0; attempt < 200; attempt++) {
    const others = pickUniqueNumbersExcluding(rng, 1, 45, 5, luckyNumber);
    const set = [...others, luckyNumber].sort((a, b) => a - b);
    if (isBalancedLottoSet(set)) return set;
  }
  // 200번 시도해도 못 찾으면 마지막 후보 반환 (안전장치)
  const others = pickUniqueNumbersExcluding(rng, 1, 45, 5, luckyNumber);
  return [...others, luckyNumber].sort((a, b) => a - b);
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
  '편의점', '24시 편의점', '동네 편의점',
  '단골 카페 근처', '대형마트 근처', '동네 마트',
  '지하철역 근처', '회사 근처', '학교 근처',
  '시장 근처', '영화관 근처', '공원 근처',
  '터미널 근처', '은행 근처', '백화점 근처',
  '대로변 가게', '사거리 가게', '줄 서는 가게',
];

const LUCKY_TIMES: string[] = [
  '오전 7~9시', '오전 9~11시', '정오 12~1시',
  '오후 2~4시', '오후 4~6시', '저녁 6~8시',
  '저녁 8~10시', '밤 10~12시',
];

// 종합 점수 + 4가지 운 점수 계산 (seed 기반)
function generateScore(rng: () => number) {
  // 종합 점수: 70~99 자연스러운 분포
  // rng를 3번 평균내서 정규분포 흉내 (중간값 빈도 ↑)
  const avg = (rng() + rng() + rng()) / 3;
  const total = 70 + Math.floor(avg * 30);
  // 세부 점수: 2~5 별 (1점은 없음)
  return {
    total,
    love: 2 + Math.floor(rng() * 4),
    money: 2 + Math.floor(rng() * 4),
    health: 2 + Math.floor(rng() * 4),
    work: 2 + Math.floor(rng() * 4),
  };
}

// 별점별 메시지 풀
const LOVE_MESSAGES: Record<number, string[]> = {
  5: ['운명적인 만남이 찾아올 수 있어요', '관계가 한 단계 더 깊어지는 날'],
  4: ['마음 맞는 사람과 좋은 시간을 보내요', '따뜻한 기운이 가득한 하루'],
  3: ['솔직한 표현이 관계를 깊게 해요', '평온한 마음으로 대화해보세요'],
  2: ['조급함보다 차분한 마음이 필요해요', '오해 없이 명확하게 표현하세요'],
};

const MONEY_MESSAGES: Record<number, string[]> = {
  5: ['예상치 못한 수익이 들어올 수 있어요', '재물의 흐름이 매우 좋은 날'],
  4: ['꾸준한 수입이 안정적으로 들어와요', '작은 기회를 놓치지 마세요'],
  3: ['투자보다 저축이 안전한 시기에요', '계획적인 소비가 필요해요'],
  2: ['충동 구매를 자제하는 게 좋아요', '큰 결정은 다음으로 미루세요'],
};

const HEALTH_MESSAGES: Record<number, string[]> = {
  5: ['활기찬 에너지가 가득한 하루에요', '컨디션 최상! 무엇이든 도전해요'],
  4: ['운동 효과가 잘 나타나는 날이에요', '몸도 마음도 가벼운 하루'],
  3: ['충분한 휴식이 필요한 날이에요', '평소 컨디션을 유지하세요'],
  2: ['무리하지 말고 컨디션을 살펴요', '가벼운 스트레칭으로 풀어주세요'],
};

const WORK_MESSAGES: Record<number, string[]> = {
  5: ['큰 성과를 이룰 수 있는 날이에요', '리더십이 빛나는 하루'],
  4: ['동료와의 협업이 좋은 결과를 내요', '집중력이 좋아 일이 잘 풀려요'],
  3: ['신중한 판단이 필요한 시기에요', '꼼꼼한 확인이 도움이 돼요'],
  2: ['오해 없이 명확하게 소통하세요', '서두르지 말고 차근차근 진행해요'],
};

function pickScoreMessage(rng: () => number, score: number, messages: Record<number, string[]>): string {
  const pool = messages[score] ?? messages[3];
  return pool[Math.floor(rng() * pool.length)];
}

function generateScoreMessages(rng: () => number, score: { love: number; money: number; health: number; work: number }) {
  return {
    love: pickScoreMessage(rng, score.love, LOVE_MESSAGES),
    money: pickScoreMessage(rng, score.money, MONEY_MESSAGES),
    health: pickScoreMessage(rng, score.health, HEALTH_MESSAGES),
    work: pickScoreMessage(rng, score.work, WORK_MESSAGES),
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
  const luckyTime = pickFrom(rng, LUCKY_TIMES);
  const score = generateScore(rng);
  const scoreMessages = generateScoreMessages(rng, score);
  const luckyNumber = 1 + Math.floor(rng() * 45);

  // 로또 5세트 생성 — 통계 패턴 만족 + 행운 숫자 포함
  const lottoNumbers: number[][] = [];
  for (let i = 0; i < 5; i++) {
    lottoNumbers.push(generateBalancedLottoSet(rng, luckyNumber));
  }

  return {
    birthDate,
    zodiac,
    zodiacEmoji,
    fortune,
    score,
    scoreMessages,
    luckyNumber,
    luckyColor: color.name,
    luckyColorHex: color.hex,
    luckyPlace,
    luckyTime,
    lottoNumbers,
  };
}
