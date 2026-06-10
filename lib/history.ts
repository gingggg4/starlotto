import type { FortuneResult } from '@/types/fortune';

const HISTORY_KEY = 'byeollotto_history';
const MAX_ITEMS = 5;

export interface HistoryItem {
  id: string;
  savedAt: string;       // ISO 날짜 문자열
  birthDate: string;
  zodiac: string;
  zodiacEmoji: string;
  fortune: string;
}

export function saveToHistory(result: FortuneResult, birthDate: string): void {
  if (typeof window === 'undefined') return;

  const today = new Date().toISOString().split('T')[0];
  const history = loadHistory();

  // 오늘 같은 생년월일+별자리 기록이 이미 있으면 덮어씀
  const filtered = history.filter(
    (h) => !(h.birthDate === birthDate && h.zodiac === result.zodiac && h.savedAt.startsWith(today))
  );

  const newItem: HistoryItem = {
    id: `${Date.now()}`,
    savedAt: new Date().toISOString(),
    birthDate,
    zodiac: result.zodiac,
    zodiacEmoji: result.zodiacEmoji,
    fortune: result.fortune,
  };

  const updated = [newItem, ...filtered].slice(0, MAX_ITEMS);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
}

export function loadHistory(): HistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as HistoryItem[]) : [];
  } catch {
    return [];
  }
}
