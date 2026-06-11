'use client';

import { useState } from 'react';

interface LottoGameProps {
  luckyNumbers: number[]; // 별로또 추천 6개 (비교 대상)
}

const MAX_ATTEMPTS = 3;

function drawSixNumbers(): number[] {
  const pool = Array.from({ length: 45 }, (_, i) => i + 1);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, 6);
}

function getBallColor(n: number) {
  if (n <= 10) return 'bg-yellow-400 text-yellow-900';
  if (n <= 20) return 'bg-blue-400 text-blue-900';
  if (n <= 30) return 'bg-red-400 text-red-900';
  if (n <= 40) return 'bg-gray-500 text-gray-100';
  return 'bg-green-400 text-green-900';
}

export default function LottoGame({ luckyNumbers }: LottoGameProps) {
  const [drawn, setDrawn] = useState<number[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const luckySet = new Set(luckyNumbers);
  const sortedDrawn = [...drawn].sort((a, b) => a - b);
  const matchCount = sortedDrawn.filter((n) => luckySet.has(n)).length;
  const completed = drawn.length === 6 && !drawing;
  const canDrawAgain = completed && attempts < MAX_ATTEMPTS;

  const handleDraw = async () => {
    if (drawing) return;
    setDrawing(true);
    setDrawn([]);

    const numbers = drawSixNumbers();
    for (let i = 0; i < 6; i++) {
      await new Promise((r) => setTimeout(r, 350));
      setDrawn((prev) => [...prev, numbers[i]]);
    }

    setDrawing(false);
    setAttempts((prev) => prev + 1);
  };

  return (
    <div className="rounded-3xl bg-gradient-to-br from-yellow-500/15 to-orange-500/15 border border-yellow-400/30 p-5 space-y-4">
      <div className="text-center">
        <p className="text-yellow-300 text-sm font-bold mb-1">🎯 운명의 6개 뽑기</p>
        <p className="text-purple-200 text-xs">
          버튼을 누르면 운명의 숫자 6개가 뽑힙니다
        </p>
        <p className="text-purple-400 text-xs mt-1">
          시도 {attempts} / {MAX_ATTEMPTS}회
        </p>
      </div>

      {/* 뽑힌 공 6칸 (애니메이션) */}
      <div className="flex justify-center gap-1.5 flex-wrap min-h-[44px]">
        {Array.from({ length: 6 }).map((_, i) => {
          const n = drawn[i];
          if (n === undefined) {
            return (
              <div
                key={i}
                className="w-10 h-10 rounded-full bg-white/5 border border-purple-300/20 flex items-center justify-center"
              >
                <span className="text-purple-400/30 text-xs">?</span>
              </div>
            );
          }
          const matched = completed && luckySet.has(n);
          return (
            <div
              key={i}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black shadow-md animate-bounce-in ${
                matched
                  ? 'bg-gradient-to-br from-yellow-300 to-yellow-500 text-yellow-900 ring-2 ring-yellow-200'
                  : getBallColor(n)
              }`}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              {n}
            </div>
          );
        })}
      </div>

      {/* 뽑기 버튼 */}
      {!completed && (
        <button
          onClick={handleDraw}
          disabled={drawing || attempts >= MAX_ATTEMPTS}
          className={`w-full py-3 rounded-2xl font-bold text-sm transition-all duration-200 ${
            drawing
              ? 'bg-yellow-400/30 text-yellow-200 cursor-wait'
              : 'bg-gradient-to-r from-yellow-400 to-orange-400 text-yellow-900 shadow-lg shadow-yellow-500/40 active:scale-95'
          }`}
        >
          {drawing ? '🌀 뽑는 중...' : '✨ 뽑기 시작 ✨'}
        </button>
      )}

      {/* 결과 (6개 다 뽑은 후) */}
      {completed && (
        <div className="space-y-3 animate-fade-in">
          {/* 정렬된 뽑힌 공 */}
          <div className="rounded-2xl bg-white/5 border border-purple-300/20 p-3">
            <p className="text-center text-purple-300 text-xs mb-2">
              내가 뽑은 6개
            </p>
            <div className="flex justify-center gap-1.5 flex-wrap">
              {sortedDrawn.map((n) => {
                const matched = luckySet.has(n);
                return (
                  <div
                    key={n}
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black shadow-md ${
                      matched
                        ? 'bg-gradient-to-br from-yellow-300 to-yellow-500 text-yellow-900 ring-2 ring-yellow-200'
                        : getBallColor(n)
                    }`}
                  >
                    {n}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 일치율 */}
          <div className="text-center rounded-2xl bg-white/10 border border-yellow-300/30 p-4">
            <p className="text-yellow-300 text-xs mb-2">✨ 운명의 일치율</p>
            <p className="text-white text-4xl font-black">
              {matchCount}
              <span className="text-yellow-300 text-2xl">/6</span>
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

          {/* 별로또 추천 번호 */}
          <div className="rounded-2xl bg-white/5 border border-purple-300/20 p-3">
            <p className="text-center text-purple-300 text-xs mb-2">
              별로또가 뽑은 운명 번호
            </p>
            <div className="flex justify-center gap-1.5 flex-wrap">
              {luckyNumbers.map((n) => {
                const matched = drawn.includes(n);
                return (
                  <div
                    key={n}
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black shadow-md ${
                      matched
                        ? 'bg-gradient-to-br from-yellow-300 to-yellow-500 text-yellow-900 ring-2 ring-yellow-200'
                        : getBallColor(n)
                    }`}
                  >
                    {n}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 다시 뽑기 / 종료 */}
          {canDrawAgain ? (
            <button
              onClick={handleDraw}
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
