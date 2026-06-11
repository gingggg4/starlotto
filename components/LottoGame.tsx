'use client';

import { useState } from 'react';

interface LottoGameProps {
  luckyNumbers: number[]; // 별로또 추천 6개 (비교 대상)
}

const MAX_ATTEMPTS = 3;

export default function LottoGame({ luckyNumbers }: LottoGameProps) {
  const [selected, setSelected] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const luckySet = new Set(luckyNumbers);
  const matches = selected.filter((n) => luckySet.has(n));
  const matchCount = matches.length;

  const toggleNumber = (n: number) => {
    if (submitted) return;
    if (selected.includes(n)) {
      setSelected(selected.filter((x) => x !== n));
    } else if (selected.length < 6) {
      setSelected([...selected, n]);
    }
  };

  const handleSubmit = () => {
    if (selected.length !== 6) return;
    setSubmitted(true);
    setAttempts(attempts + 1);
  };

  const handleRetry = () => {
    setSelected([]);
    setSubmitted(false);
  };

  const getColor = (n: number) => {
    if (n <= 10) return 'bg-yellow-400 text-yellow-900';
    if (n <= 20) return 'bg-blue-400 text-blue-900';
    if (n <= 30) return 'bg-red-400 text-red-900';
    if (n <= 40) return 'bg-gray-500 text-gray-100';
    return 'bg-green-400 text-green-900';
  };

  const canRetry = submitted && attempts < MAX_ATTEMPTS;

  return (
    <div className="rounded-3xl bg-gradient-to-br from-yellow-500/15 to-orange-500/15 border border-yellow-400/30 p-4 space-y-4">
      <div className="text-center">
        <p className="text-yellow-300 text-sm font-bold mb-1">🎯 운명의 6개 뽑기</p>
        <p className="text-purple-200 text-xs">
          1~45 중 마음에 드는 번호 6개를 뽑아보세요
        </p>
        <p className="text-purple-400 text-xs mt-1">
          시도 {attempts} / {MAX_ATTEMPTS}회
        </p>
      </div>

      {/* 선택 상태 표시 */}
      <div className="flex justify-between items-center px-2">
        <span className="text-purple-300 text-xs">
          선택: <span className="text-white font-bold">{selected.length}</span> / 6
        </span>
        {!submitted && selected.length > 0 && (
          <button
            onClick={() => setSelected([])}
            className="text-purple-400 text-xs hover:text-purple-200"
          >
            초기화
          </button>
        )}
      </div>

      {/* 1~45 공 격자 */}
      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: 45 }, (_, i) => i + 1).map((n) => {
          const isSelected = selected.includes(n);
          const isMatched = submitted && luckySet.has(n) && isSelected;
          const isLucky = submitted && luckySet.has(n) && !isSelected;

          return (
            <button
              key={n}
              onClick={() => toggleNumber(n)}
              disabled={submitted}
              className={`
                aspect-square rounded-full text-xs font-bold flex items-center justify-center
                transition-all duration-200
                ${isMatched
                  ? 'bg-gradient-to-br from-yellow-300 to-yellow-500 text-yellow-900 ring-2 ring-yellow-200 scale-110 shadow-lg shadow-yellow-500/50'
                  : isSelected
                  ? `${getColor(n)} ring-2 ring-white scale-105`
                  : isLucky
                  ? 'bg-white/5 border-2 border-yellow-400/40 text-yellow-300'
                  : submitted
                  ? 'bg-white/5 text-purple-400/40'
                  : 'bg-white/10 text-purple-200 hover:bg-white/20 active:scale-95'
                }
              `}
            >
              {n}
            </button>
          );
        })}
      </div>

      {/* 뽑기 버튼 */}
      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={selected.length !== 6}
          className={`w-full py-3 rounded-2xl font-bold text-sm transition-all duration-200 ${
            selected.length === 6
              ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-yellow-900 shadow-lg shadow-yellow-500/40 active:scale-95'
              : 'bg-white/10 text-purple-400/50 cursor-not-allowed'
          }`}
        >
          {selected.length === 6 ? '✨ 운명 확인하기' : `${6 - selected.length}개 더 선택해주세요`}
        </button>
      )}

      {/* 결과 */}
      {submitted && (
        <div className="space-y-3 animate-fade-in">
          <div className="text-center rounded-2xl bg-white/10 border border-yellow-300/30 p-4">
            <p className="text-yellow-300 text-xs mb-2">✨ 운명의 일치율</p>
            <p className="text-white text-4xl font-black">
              {matchCount}<span className="text-yellow-300 text-2xl">/6</span>
            </p>
            <p className="text-purple-200 text-xs mt-2">
              {matchCount === 6 && '🎉 완벽한 일치! 오늘 별빛이 당신과 함께해요!'}
              {matchCount === 5 && '🌟 거의 완벽! 운명의 흐름이 강합니다!'}
              {matchCount === 4 && '✨ 훌륭해요! 좋은 기운이 가득합니다!'}
              {matchCount === 3 && '💫 절반의 일치! 직감이 살아있어요!'}
              {matchCount === 2 && '⭐ 조금 더 집중해보세요!'}
              {matchCount === 1 && '🌙 한 번의 일치도 의미가 있어요!'}
              {matchCount === 0 && '🌌 오늘은 별빛이 다른 방향을 가리켜요'}
            </p>
          </div>

          {/* 별로또 추천 번호 표시 */}
          <div className="rounded-2xl bg-white/5 border border-purple-300/20 p-3">
            <p className="text-center text-purple-300 text-xs mb-2">
              별로또가 뽑은 운명 번호
            </p>
            <div className="flex justify-center gap-1.5 flex-wrap">
              {luckyNumbers.map((n) => (
                <div
                  key={n}
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black shadow-md ${
                    selected.includes(n)
                      ? 'bg-gradient-to-br from-yellow-300 to-yellow-500 text-yellow-900 ring-2 ring-yellow-200'
                      : getColor(n)
                  }`}
                >
                  {n}
                </div>
              ))}
            </div>
          </div>

          {/* 다시 뽑기 / 종료 */}
          {canRetry ? (
            <button
              onClick={handleRetry}
              className="w-full py-3 rounded-2xl bg-purple-500/20 border border-purple-400/30 text-purple-200 font-semibold text-sm hover:bg-purple-500/30 transition-all"
            >
              🔄 다시 뽑기 ({MAX_ATTEMPTS - attempts}회 남음)
            </button>
          ) : (
            <p className="text-center text-purple-400/70 text-xs">
              오늘의 도전이 끝났어요. 내일 다시 만나요! 🌙
            </p>
          )}
        </div>
      )}
    </div>
  );
}
