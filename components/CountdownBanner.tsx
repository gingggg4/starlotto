'use client';

import { useEffect, useState } from 'react';

// 다음 로또 마감 시각 (토요일 오후 8시)
function getLottoDeadline(): Date {
  const now = new Date();
  const target = new Date(now);
  const day = now.getDay(); // 0=일 ... 6=토
  let daysUntil = (6 - day + 7) % 7;

  // 오늘이 토요일이고 이미 오후 8시 지났으면 다음 주
  if (day === 6) {
    const passed = now.getHours() > 20 || (now.getHours() === 20 && now.getMinutes() > 0);
    if (passed) daysUntil = 7;
  }

  target.setDate(now.getDate() + daysUntil);
  target.setHours(20, 0, 0, 0);
  return target;
}

function formatRemaining(ms: number) {
  if (ms <= 0) return { d: 0, h: 0, m: 0 };
  const totalMinutes = Math.floor(ms / 60000);
  const d = Math.floor(totalMinutes / 1440);
  const h = Math.floor((totalMinutes % 1440) / 60);
  const m = totalMinutes % 60;
  return { d, h, m };
}

export default function CountdownBanner() {
  const [remaining, setRemaining] = useState({ d: 0, h: 0, m: 0 });

  useEffect(() => {
    const update = () => {
      const deadline = getLottoDeadline();
      const ms = deadline.getTime() - Date.now();
      setRemaining(formatRemaining(ms));
    };
    update();
    const id = setInterval(update, 30000); // 30초마다 업데이트
    return () => clearInterval(id);
  }, []);

  return (
    <div className="w-full max-w-sm mx-auto mb-6 rounded-2xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎰</span>
          <div>
            <p className="text-yellow-300 text-xs font-semibold">이번 주 로또 마감까지</p>
            <p className="text-purple-300/70 text-xs">매주 토요일 오후 8시</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-white font-black text-sm">
            {remaining.d}일 {remaining.h}시간 {remaining.m}분
          </p>
        </div>
      </div>
    </div>
  );
}
