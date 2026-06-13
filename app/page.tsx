'use client';

import { useState } from 'react';
import FortuneForm from '@/components/FortuneForm';
import FortuneResult from '@/components/FortuneResult';
import CountdownBanner from '@/components/CountdownBanner';
import HistoryModal from '@/components/HistoryModal';
import { FortuneInput, FortuneResult as FortuneResultType } from '@/types/fortune';
import { saveToHistory } from '@/lib/history';

export default function Home() {
  const [result, setResult] = useState<FortuneResultType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFallback, setIsFallback] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const handleSubmit = async (input: FortuneInput) => {
    setIsLoading(true);
    setResult(null);
    setIsFallback(false);

    try {
      const response = await fetch('/api/fortune', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      const json = await response.json();

      if (json.success && json.data) {
        setResult(json.data);
        setIsFallback(json.fallback === true);
        saveToHistory(json.data, input.birthDate);
      } else {
        throw new Error(json.error || '운세 생성 실패');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setIsFallback(false);
  };

  const handleHistorySelect = (selected: FortuneResultType) => {
    setResult(selected);
    setIsFallback(false);
    setHistoryOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="bg-star min-h-screen flex flex-col items-center py-10 px-4">
      {/* 배경 별들 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[15%] text-white text-xs star-1">✦</div>
        <div className="absolute top-[25%] right-[20%] text-purple-300 text-xs star-2">✦</div>
        <div className="absolute top-[60%] left-[8%] text-pink-300 text-xs star-3">✦</div>
        <div className="absolute top-[15%] right-[35%] text-white text-xs star-2">✧</div>
        <div className="absolute top-[70%] right-[12%] text-purple-300 text-xs star-1">✧</div>
        <div className="absolute bottom-[20%] left-[30%] text-pink-300 text-xs star-3">✦</div>
      </div>

      {/* 헤더 (운세 기록 버튼 우측 상단) */}
      <header className="relative w-full max-w-sm mx-auto text-center mb-8 z-10">
        <button
          onClick={() => setHistoryOpen(true)}
          className="absolute right-0 top-0 w-10 h-10 rounded-full bg-white/10 border border-purple-300/30 text-purple-200 text-lg hover:bg-white/20 active:scale-95 transition-all"
          aria-label="운세 기록"
        >
          📖
        </button>
        <h1 className="text-5xl font-black text-white mb-2">
          ⭐ 별로또
        </h1>
        <p className="text-purple-300 text-sm font-medium">
          별자리로 보는 오늘의 운세 & 행운의 로또번호
        </p>
      </header>

      {/* 카운트다운 배너 */}
      <div className="relative z-10 w-full">
        <CountdownBanner />
      </div>

      {/* 메인 컨텐츠 */}
      <div className="relative z-10 w-full">
        {result ? (
          <FortuneResult
            result={result}
            isFallback={isFallback}
            onReset={handleReset}
          />
        ) : (
          <FortuneForm onSubmit={handleSubmit} isLoading={isLoading} />
        )}
      </div>

      {/* 운세 기록 모달 */}
      <HistoryModal
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onSelect={handleHistorySelect}
      />

      {/* 푸터 */}
      <footer className="relative z-10 mt-10 text-center text-purple-500 text-xs">
        <p>별로또 © 2026 · 재미용 서비스입니다</p>
      </footer>
    </main>
  );
}
