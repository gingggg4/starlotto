export interface ZodiacInfo {
  name: string;
  emoji: string;
  nameKo: string;
}

const ZODIAC_DATA: ZodiacInfo[] = [
  { name: 'aries', emoji: '♈', nameKo: '양자리' },
  { name: 'taurus', emoji: '♉', nameKo: '황소자리' },
  { name: 'gemini', emoji: '♊', nameKo: '쌍둥이자리' },
  { name: 'cancer', emoji: '♋', nameKo: '게자리' },
  { name: 'leo', emoji: '♌', nameKo: '사자자리' },
  { name: 'virgo', emoji: '♍', nameKo: '처녀자리' },
  { name: 'libra', emoji: '♎', nameKo: '천칭자리' },
  { name: 'scorpio', emoji: '♏', nameKo: '전갈자리' },
  { name: 'sagittarius', emoji: '♐', nameKo: '사수자리' },
  { name: 'capricorn', emoji: '♑', nameKo: '염소자리' },
  { name: 'aquarius', emoji: '♒', nameKo: '물병자리' },
  { name: 'pisces', emoji: '♓', nameKo: '물고기자리' },
];

export function getZodiac(birthDate: string): ZodiacInfo {
  const date = new Date(birthDate);
  const month = date.getMonth() + 1;
  const day = date.getDate();

  let index: number;
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) index = 0;
  else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) index = 1;
  else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) index = 2;
  else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) index = 3;
  else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) index = 4;
  else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) index = 5;
  else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) index = 6;
  else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) index = 7;
  else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) index = 8;
  else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) index = 9;
  else if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) index = 10;
  else index = 11; // 물고기자리

  return ZODIAC_DATA[index];
}
