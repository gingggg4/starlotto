'use client';

import { useEffect, useState } from 'react';
import { loadHistory, type HistoryItem } from '@/lib/history';
import type { FortuneResult } from '@/types/fortune';

interface HistoryModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (result: FortuneResult) => void;
}

export default function HistoryModal({ open, onClose, onSelect }: HistoryModalProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    if (open) setHistory(loadHistory());
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl bg-gradient-to-br from-purple-900/95 to-indigo-900/95 border border-purple-300/30 p-5 max-h-[80vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-white font-bold text-lg">📖 운세 기록</p>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 text-purple-200 hover:bg-white/20 transition-all"
          >
            ✕
          </button>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">🌙</p>
            <p className="text-purple-300 text-sm">아직 기록이 없어요</p>
            <p className="text-purple-400/70 text-xs mt-1">운세를 보면 여기에 모여요</p>
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((item) => {
              const date = new Date(item.savedAt);
              const dateStr = date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });

              return (
                <button
                  key={item.id}
                  onClick={() => onSelect(item.fullResult)}
                  className="w-full text-left flex items-center gap-3 rounded-2xl bg-white/10 border border-purple-300/20 px-4 py-3 hover:bg-white/15 active:scale-[0.98] transition-all"
                >
                  <span className="text-2xl">{item.zodiacEmoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-purple-300 text-xs">{dateStr} · {item.zodiac}</p>
                      <p className="text-yellow-300 text-xs font-bold">{item.totalScore}점</p>
                    </div>
                    <p className="text-white text-xs truncate mt-0.5">{item.fortune}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        <p className="text-center text-purple-400/50 text-xs mt-4">
          최대 7개까지 자동 저장돼요
        </p>
      </div>
    </div>
  );
}
