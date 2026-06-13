export type Gender = 'male' | 'female';

export interface FortuneInput {
  birthDate: string;
  gender: Gender;
  zodiac: string;
  zodiacEmoji: string;
}

export interface FortuneScore {
  total: number;     // 0~100 종합 점수
  love: number;      // 사랑운 (0~5)
  money: number;     // 금전운 (0~5)
  health: number;    // 건강운 (0~5)
  work: number;      // 직장운 (0~5)
}

export interface FortuneResult {
  zodiac: string;
  zodiacEmoji: string;
  fortune: string;
  score: FortuneScore;
  luckyNumbers: number[];
  luckyColor: string;
  luckyColorHex: string;
  luckyPlace: string;
  luckyTime: string;
  lottoNumbers: [number[], number[]];
}
