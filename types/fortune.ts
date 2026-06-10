export type Gender = 'male' | 'female';

export interface FortuneInput {
  birthDate: string;
  gender: Gender;
  zodiac: string;
  zodiacEmoji: string;
}

export interface FortuneResult {
  zodiac: string;
  zodiacEmoji: string;
  fortune: string;
  luckyNumbers: number[];
  luckyColor: string;
  luckyColorHex: string;
  luckyPlace: string;
  luckyDay: string;
  lottoNumbers: [number[], number[]];
}
