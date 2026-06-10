'use client';

import { useState } from 'react';
import { getZodiac } from '@/lib/zodiac';
import { FortuneInput, Gender } from '@/types/fortune';

interface FortuneFormProps {
  onSubmit: (input: FortuneInput) => void;
  isLoading: boolean;
}

export default function FortuneForm({ onSubmit, isLoading }: FortuneFormProps) {
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<Gender>('female');

  const zodiacInfo = birthDate ? getZodiac(birthDate) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!birthDate || !zodiacInfo) return;

    onSubmit({
      birthDate,
      gender,
      zodiac: zodiacInfo.nameKo,
      zodiacEmoji: zodiacInfo.emoji,
    });
  };

  const today = new Date().toISOString().split('T')[0];
  const minDate = '1920-01-01';

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto space-y-6">
      {/* 생년월일 */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-purple-200">
          생년월일
        </label>
        <input
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          max={today}
          min={minDate}
          required
          className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-purple-300/30 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent backdrop-blur-sm text-center text-lg"
        />
      </div>

      {/* 성별 */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-purple-200">
          성별
        </label>
        <div className="grid grid-cols-2 gap-3">
          {(['female', 'male'] as Gender[]).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGender(g)}
              className={`py-3 rounded-2xl font-semibold text-sm transition-all duration-200 ${
                gender === g
                  ? 'bg-purple-400 text-white shadow-lg shadow-purple-500/30 scale-105'
                  : 'bg-white/10 text-purple-200 border border-purple-300/30 hover:bg-white/20'
              }`}
            >
              {g === 'female' ? '👩 여성' : '👨 남성'}
            </button>
          ))}
        </div>
      </div>

      {/* 별자리 표시 */}
      {zodiacInfo && (
        <div className="flex items-center justify-center gap-3 py-3 rounded-2xl bg-white/10 border border-purple-300/20">
          <span className="text-3xl">{zodiacInfo.emoji}</span>
          <div>
            <p className="text-xs text-purple-300">내 별자리</p>
            <p className="text-white font-bold text-lg">{zodiacInfo.nameKo}</p>
          </div>
        </div>
      )}

      {/* 제출 버튼 */}
      <button
        type="submit"
        disabled={!birthDate || isLoading}
        className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${
          !birthDate || isLoading
            ? 'bg-purple-800/50 text-purple-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/40 hover:shadow-purple-500/60 hover:scale-105 active:scale-95'
        }`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin">✨</span>
            운세 읽는 중...
          </span>
        ) : (
          '⭐ 오늘의 운세 보기'
        )}
      </button>
    </form>
  );
}
