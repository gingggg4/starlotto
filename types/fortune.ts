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

export interface TarotCard {
  name: string;        // 한글 이름
  nameEn: string;      // 영문 이름
  emoji: string;       // 이모지
  keyword: string;     // 짧은 키워드 (예: 희망)
  meaning: string;     // 한줄 의미 풀이
}

export interface FortuneResult {
  zodiac: string;
  zodiacEmoji: string;
  fortune: string;
  score: FortuneScore;
  tarot: TarotCard;
  luckyNumbers: number[];
  luckyColor: string;
  luckyColorHex: string;
  luckyPlace: string;
  luckyDay: string;
  lottoNumbers: [number[], number[]];
}
