export async function GET() {
  const latest = estimateLatestDrawNo();

  // 최근 5회차 중 성공하는 회차 데이터 반환
  for (let drwNo = latest; drwNo >= latest - 5; drwNo--) {
    const result = await fetchDraw(drwNo);
    if (result) return Response.json({ success: true, data: result });
  }

  return Response.json({ success: false, error: '당첨 정보를 불러올 수 없습니다.' });
}

async function fetchDraw(drwNo: number) {
  const apiUrl = `https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${drwNo}`;

  // 방법 1: 직접 호출
  try {
    const res = await fetch(apiUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 3600 },
    });
    const data = await res.json();
    if (data.returnValue === 'success') return parse(data);
  } catch {}

  // 방법 2: allorigins 프록시 우회
  try {
    const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(apiUrl)}`;
    const res = await fetch(proxy, { next: { revalidate: 3600 } });
    const wrapper = await res.json();
    if (wrapper.contents) {
      const data = JSON.parse(wrapper.contents);
      if (data.returnValue === 'success') return parse(data);
    }
  } catch {}

  return null;
}

function parse(d: Record<string, unknown>) {
  return {
    drwNo: d.drwNo,
    drwNoDate: d.drwNoDate,
    numbers: [d.drwtNo1, d.drwtNo2, d.drwtNo3, d.drwtNo4, d.drwtNo5, d.drwtNo6],
    bonusNo: d.bnusNo,
    firstWinamnt: d.firstWinamnt,
    firstPrzwnerCo: d.firstPrzwnerCo,
  };
}

function estimateLatestDrawNo(): number {
  const firstDraw = new Date('2002-12-07').getTime();
  return Math.floor((Date.now() - firstDraw) / (7 * 24 * 60 * 60 * 1000)) + 1;
}
