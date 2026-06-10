'use client';

import { useEffect, useState } from 'react';
import { loadHistory, type HistoryItem } from '@/lib/history';

export default function FortuneHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  if (history.length === 0) return null;

  return (
    <div className="w-full max-w-sm mx-auto mt-6">
      <p className="text-center text-purple-400 text-xs mb-3">📖 최근 조회 기록</p>
      <div className="space-y-2">
        {history.map((item) => {
          const date = new Date(item.savedAt);
          const dateStr = date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });

          return (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-2xl bg-white/5 border border-purple-300/10 px-4 py-3"
            >
              <span className="text-xl">{item.zodiacEmoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-purple-300 text-xs">{dateStr} · {item.zodiac}</p>
                <p className="text-white text-xs truncate">{item.fortune}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
