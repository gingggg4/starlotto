'use client';

import { useState } from 'react';
import type { FortuneResult } from '@/types/fortune';

interface FortuneResultProps {
  result: FortuneResult;
  isFallback?: boolean;
  onReset: () => void;
}

interface LottoWinData {
  drwNo: number;
  drwNoDate: string;
  numbers: number[];
  bonusNo: number;
  firstWinamnt: number;
  firstPrzwnerCo: number;
}

function LottoBall({ number, size = 'md', highlight = false }: { number: number; size?: 'sm' | 'md'; highlight?: boolean }) {
  const getColor = (n: number) => {
    if (n <= 10) return 'bg-yellow-400 text-yellow-900';
    if (n <= 20) return 'bg-blue-400 text-blue-900';
    if (n <= 30) return 'bg-red-400 text-red-900';
    if (n <= 40) return 'bg-gray-500 text-gray-100';
    return 'bg-green-400 text-green-900';
  };
  const sizeClass = size === 'sm' ? 'w-9 h-9 text-sm' : 'w-11 h-11 text-base';
  return (
    <div className={`${sizeClass} ${getColor(number)} rounded-full flex items-center justify-center font-black shadow-md ${highlight ? 'ring-2 ring-white scale-110' : ''}`}>
      {number}
    </div>
  );
}

export default function FortuneResult({ result, onReset }: FortuneResultProps) {
  const [lottoWin, setLottoWin] = useState<LottoWinData | null>(null);
  const [lottoLoading, setLottoLoading] = useState(false);
  const [lottoOpen, setLottoOpen] = useState(false);

  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const fetchLottoResult = async () => {
    if (lottoWin) { setLottoOpen(true); return; }
    setLottoLoading(true);
    try {
      const res = await fetch('/api/lotto');
      const json = await res.json();
      if (json.success) {
        setLottoWin(json.data);
        setLottoOpen(true);
      }
    } catch {
      // 실패 시 조용히 처리
    } finally {
      setLottoLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto space-y-4 animate-fade-in">

      {/* 날짜 & 별자리 */}
      <div className="text-center space-y-1">
        <p className="text-purple-300 text-xs">{today}</p>
        <div className="flex items-center justify-center gap-2">
          <span className="text-4xl">{result.zodiacEmoji}</span>
          <h2 className="text-white font-bold text-2xl">{result.zodiac}</h2>
        </div>
      </div>

      {/* 오늘의 운세 */}
      <div className="rounded-3xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-300/20 p-5 text-center">
        <p className="text-xs text-purple-300 mb-2">✨ 오늘의 운세</p>
        <p className="text-white font-medium text-base leading-relaxed">{result.fortune}</p>
      </div>

      {/* 행운 정보 3개 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-white/10 border border-purple-300/20 p-3 text-center">
          <div className="w-8 h-8 rounded-full mx-auto mb-2 shadow-md" style={{ backgroundColor: result.luckyColorHex }} />
          <p className="text-purple-300 text-xs">행운의 색</p>
          <p className="text-white text-xs font-semibold mt-0.5">{result.luckyColor}</p>
        </div>
        <div className="rounded-2xl bg-white/10 border border-purple-300/20 p-3 text-center">
          <p className="text-2xl mb-1">📍</p>
          <p className="text-purple-300 text-xs">행운의 장소</p>
          <p className="text-white text-xs font-semibold mt-0.5">{result.luckyPlace}</p>
        </div>
        <div className="rounded-2xl bg-white/10 border border-purple-300/20 p-3 text-center">
          <p className="text-2xl mb-1">📅</p>
          <p className="text-purple-300 text-xs">행운의 요일</p>
          <p className="text-white text-xs font-semibold mt-0.5">{result.luckyDay}</p>
        </div>
      </div>

      {/* 행운의 숫자 */}
      <div className="rounded-3xl bg-white/10 border border-purple-300/20 p-4">
        <p className="text-center text-xs text-purple-300 mb-3">🔢 행운의 숫자</p>
        <div className="flex justify-center gap-2 flex-wrap">
          {result.luckyNumbers.map((n) => (
            <LottoBall key={n} number={n} size="md" />
          ))}
        </div>
        <p className="text-center text-purple-400/50 text-xs mt-3">
          행운의 숫자는 생년월일, 별자리, 조회 날짜를 기반으로 생성됩니다.
        </p>
      </div>

      {/* 로또 번호 */}
      <div className="rounded-3xl bg-white/10 border border-purple-300/20 p-4 space-y-3">
        <p className="text-center text-xs text-purple-300">🎱 오늘의 로또 번호</p>
        {result.lottoNumbers.map((row, i) => (
          <div key={i}>
            <p className="text-center text-xs text-purple-400 mb-2">{i + 1}세트</p>
            <div className="flex justify-center gap-1.5 flex-wrap">
              {row.map((n) => (
                <LottoBall
                  key={`${i}-${n}`}
                  number={n}
                  size="sm"
                  highlight={lottoWin?.numbers.includes(n)}
                />
              ))}
            </div>
          </div>
        ))}
        <p className="text-center text-purple-400/50 text-xs mt-2">
          * 이 번호는 재미용입니다. 당첨을 보장하지 않습니다.
        </p>

        {/* 당첨번호 버튼 2개 */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={fetchLottoResult}
            disabled={lottoLoading}
            className="flex-1 py-2.5 rounded-xl bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs font-semibold hover:bg-purple-500/30 transition-all disabled:opacity-50"
          >
            {lottoLoading ? '불러오는 중...' : '🏆 당첨번호 확인'}
          </button>
          <a
            href="https://search.naver.com/search.naver?query=로또+당첨번호"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2.5 rounded-xl bg-green-500/20 border border-green-400/30 text-green-200 text-xs font-semibold hover:bg-green-500/30 transition-all text-center block"
          >
            🔍 네이버 검색
          </a>
        </div>
      </div>

      {/* 최신 당첨번호 표시 */}
      {lottoOpen && lottoWin && (
        <div className="rounded-3xl bg-white/10 border border-yellow-400/20 p-4 space-y-3">
          <div className="text-center">
            <p className="text-yellow-300 text-xs font-semibold">🏆 제 {lottoWin.drwNo}회 당첨번호</p>
            <p className="text-purple-400/70 text-xs mt-0.5">{lottoWin.drwNoDate}</p>
          </div>
          <div className="flex justify-center gap-1.5 flex-wrap">
            {lottoWin.numbers.map((n) => (
              <LottoBall key={n} number={n} size="sm" />
            ))}
            <div className="flex items-center text-purple-300 text-xs mx-1">+</div>
            <div className="w-9 h-9 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-black shadow-md">
              {lottoWin.bonusNo}
            </div>
          </div>
          <p className="text-center text-yellow-300/70 text-xs">
            1등 {lottoWin.firstPrzwnerCo}명 · {(lottoWin.firstWinamnt / 100000000).toFixed(1)}억원
          </p>
          {result.lottoNumbers.some(row => row.some(n => lottoWin.numbers.includes(n))) && (
            <p className="text-center text-green-400 text-xs font-semibold">
              ✨ 내 번호 중 당첨번호와 일치하는 숫자가 있어요!
            </p>
          )}
          <button
            onClick={() => setLottoOpen(false)}
            className="w-full py-2 rounded-xl bg-white/5 text-purple-400 text-xs hover:bg-white/10 transition-all"
          >
            닫기
          </button>
        </div>
      )}

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
