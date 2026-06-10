// 동행복권 공식 API 프록시 (CORS 우회)
export async function GET() {
  const latestDrwNo = estimateLatestDrawNo();

  // 최근 3회차 중 데이터가 있는 회차를 찾음
  for (let drwNo = latestDrwNo; drwNo >= latestDrwNo - 3; drwNo--) {
    try {
      const res = await fetch(
        `https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${drwNo}`,
        { next: { revalidate: 3600 } },
      );
      const data = await res.json();

      if (data.returnValue === 'success') {
        return Response.json({
          success: true,
          data: {
            drwNo: data.drwNo,
            drwNoDate: data.drwNoDate,
            numbers: [data.drwtNo1, data.drwtNo2, data.drwtNo3, data.drwtNo4, data.drwtNo5, data.drwtNo6],
            bonusNo: data.bnusNo,
            firstWinamnt: data.firstWinamnt,
            firstPrzwnerCo: data.firstPrzwnerCo,
          },
        });
      }
    } catch {
      // 해당 회차 없으면 다음 시도
    }
  }

  return Response.json({ success: false, error: '당첨 정보를 불러올 수 없습니다.' });
}

// 1회차(2002-12-07) 기준으로 현재 회차 추정
function estimateLatestDrawNo(): number {
  const firstDraw = new Date('2002-12-07').getTime();
  const now = Date.now();
  return Math.floor((now - firstDraw) / (7 * 24 * 60 * 60 * 1000)) + 1;
}
