'use client';

import type { FortuneResult } from '@/types/fortune';

interface FortuneResultProps {
  result: FortuneResult;
  isFallback?: boolean;
  onReset: () => void;
}

function LottoBall({ number, size = 'md' }: { number: number; size?: 'sm' | 'md' }) {
  const getColor = (n: number) => {
    if (n <= 10) return 'bg-yellow-400 text-yellow-900';
    if (n <= 20) return 'bg-blue-400 text-blue-900';
    if (n <= 30) return 'bg-red-400 text-red-900';
    if (n <= 40) return 'bg-gray-500 text-gray-100';
    return 'bg-green-400 text-green-900';
  };
  const sizeClass = size === 'sm' ? 'w-9 h-9 text-sm' : 'w-11 h-11 text-base';
  return (
    <div className={`${sizeClass} ${getColor(number)} rounded-full flex items-center justify-center font-black shadow-md`}>
      {number}
    </div>
  );
}

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= value ? 'text-yellow-400' : 'text-purple-700/50'}>
          ★
        </span>
      ))}
    </div>
  );
}

export default function FortuneResult({ result, onReset }: FortuneResultProps) {
  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="w-full max-w-sm mx-auto space-y-4 animate-fade-in">

      {/* 생년월일 & 별자리 */}
      <div className="text-center space-y-1">
        <p className="text-purple-300 text-xs">
          {result.birthDate.replace(/-/g, '. ')} 생
        </p>
        <div className="flex items-center justify-center gap-2">
          <span className="text-4xl">{result.zodiacEmoji}</span>
          <h2 className="text-white font-bold text-2xl">{result.zodiac}</h2>
        </div>
      </div>

      {/* 오늘의 운세 */}
      <div className="rounded-3xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-300/20 p-5 text-center">
        <p className="text-xs text-purple-300 mb-1">✨ 오늘의 운세</p>
        <p className="text-purple-400 text-xs mb-3">{today}</p>
        <p className="text-white font-medium text-base leading-relaxed">{result.fortune}</p>
      </div>

      {/* 행운 점수 */}
      <div className="rounded-3xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-300/20 p-5">
        <div className="text-center mb-4">
          <p className="text-xs text-yellow-300 mb-2">🍀 오늘의 행운 점수</p>
          <p className="text-white text-4xl font-black">
            {result.score.total}<span className="text-yellow-300 text-2xl">점</span>
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="flex items-center justify-between">
            <span className="text-purple-200 text-xs">💖 사랑운</span>
            <StarRating value={result.score.love} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-purple-200 text-xs">💰 금전운</span>
            <StarRating value={result.score.money} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-purple-200 text-xs">🌿 건강운</span>
            <StarRating value={result.score.health} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-purple-200 text-xs">💼 직장운</span>
            <StarRating value={result.score.work} />
          </div>
        </div>
      </div>

      {/* 행운 정보 3개 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-white/10 border border-purple-300/20 p-3 text-center">
          <div className="w-8 h-8 rounded-full mx-auto mb-2 shadow-md" style={{ backgroundColor: result.luckyColorHex }} />
          <p className="text-purple-300 text-xs">행운의 색</p>
          <p className="text-white text-xs font-semibold mt-0.5">{result.luckyColor}</p>
        </div>
        <div className="rounded-2xl bg-white/10 border border-purple-300/20 p-3 text-center">
          <p className="text-2xl mb-1">🍀</p>
          <p className="text-purple-300 text-xs">로또 명당</p>
          <p className="text-white text-xs font-semibold mt-0.5">{result.luckyPlace}</p>
        </div>
        <div className="rounded-2xl bg-white/10 border border-purple-300/20 p-3 text-center">
          <p className="text-2xl mb-1">⏰</p>
          <p className="text-purple-300 text-xs">로또 황금 타임</p>
          <p className="text-white text-xs font-semibold mt-0.5">{result.luckyTime}</p>
        </div>
      </div>

      {/* 오늘의 행운 숫자 (1개) */}
      <div className="rounded-3xl bg-gradient-to-br from-purple-500/15 to-pink-500/15 border border-purple-300/30 p-5">
        <p className="text-center text-xs text-purple-300 mb-3">🔢 오늘의 행운 숫자</p>
        <div className="flex justify-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black shadow-xl ${
            result.luckyNumber <= 10 ? 'bg-yellow-400 text-yellow-900'
            : result.luckyNumber <= 20 ? 'bg-blue-400 text-blue-900'
            : result.luckyNumber <= 30 ? 'bg-red-400 text-red-900'
            : result.luckyNumber <= 40 ? 'bg-gray-500 text-gray-100'
            : 'bg-green-400 text-green-900'
          } ring-4 ring-white/20`}>
            {result.luckyNumber}
          </div>
        </div>
        <p className="text-center text-purple-400/50 text-xs mt-4">
          오늘 당신에게 가장 강한 기운을 주는 숫자예요
        </p>
        <p className="text-center text-purple-400/40 text-xs mt-1">
          (생년월일, 별자리, 조회 날짜 기반)
        </p>
      </div>

      {/* 로또 번호 */}
      <div className="rounded-3xl bg-white/10 border border-purple-300/20 p-4 space-y-3">
        <p className="text-center text-xs text-purple-300">
          🎱 오늘의 로또 번호 <span className="text-purple-400">(2/5세트 공개)</span>
        </p>

        {/* 공개 세트 (1, 2) */}
        {result.lottoNumbers.slice(0, 2).map((row, i) => (
          <div key={i}>
            <p className="text-center text-xs text-purple-400 mb-2">{i + 1}세트</p>
            <div className="flex justify-center gap-1.5 flex-wrap">
              {row.map((n) => (
                <LottoBall key={`${i}-${n}`} number={n} size="sm" />
              ))}
            </div>
          </div>
        ))}

        {/* 잠긴 세트 (3, 4, 5) */}
        {result.lottoNumbers.slice(2, 5).map((row, i) => (
          <div key={i + 2} className="relative">
            <p className="text-center text-xs text-purple-400 mb-2 flex items-center justify-center gap-1">
              {i + 3}세트 <span className="text-yellow-300">🔒</span>
            </p>
            <div className="flex justify-center gap-1.5 flex-wrap filter blur-sm select-none pointer-events-none">
              {row.map((n) => (
                <LottoBall key={`${i + 2}-${n}`} number={n} size="sm" />
              ))}
            </div>
          </div>
        ))}

        {/* 회원가입 유도 버튼 */}
        <button
          onClick={() => alert('🚧 곧 만나요!\n\n회원가입 기능을 준비 중입니다.\n매일 아침 카톡으로 5세트 받는 기능도 곧 출시 예정이에요 ✨')}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-400 text-yellow-900 font-bold text-sm shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50 active:scale-95 transition-all"
        >
          ✨ 회원가입하고 5세트 모두 보기
        </button>

        <p className="text-center text-purple-400/50 text-xs mt-2">
          * 이 번호는 재미용입니다. 당첨을 보장하지 않습니다.
        </p>
      </div>

      {/* 다시 보기 버튼 */}
      <button
        onClick={onReset}
        className="w-full py-3 rounded-2xl bg-white/10 border border-purple-300/30 text-purple-200 font-semibold text-sm hover:bg-white/20 transition-all duration-200"
      >
        다시 보기
      </button>
    </div>
  );
}
