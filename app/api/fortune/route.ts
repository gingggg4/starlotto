import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';
import { getFallbackFortune } from '@/lib/fallback';
import type { FortuneResult } from '@/types/fortune';

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey || !apiKey.startsWith('sk-ant-')) {
  console.error('[별로또] ANTHROPIC_API_KEY가 설정되지 않았거나 형식이 잘못됩니다. .env.local을 확인하세요.');
}
const client = new Anthropic({ apiKey });

const SYSTEM_PROMPT = `당신은 별자리 운세 전문가입니다. 사용자의 별자리, 생년월일, 오늘 날짜를 기반으로 오늘의 운세를 생성합니다.

반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트는 포함하지 마세요:

{
  "fortune": "오늘의 한줄 운세 (30자 이내, 희망적이고 긍정적인 내용)",
  "score": {
    "total": 종합 점수 (60~99 사이 정수),
    "love": 사랑운 (2~5 사이 정수),
    "money": 금전운 (2~5 사이 정수),
    "health": 건강운 (2~5 사이 정수),
    "work": 직장운 (2~5 사이 정수)
  },
  "luckyNumbers": [행운의 숫자 6개, 1~45 사이, 중복 없음, 오름차순],
  "luckyColor": "행운의 색깔 이름 (한국어, 예: 보라색)",
  "luckyColorHex": "#RRGGBB 형식의 색상 코드",
  "luckyPlace": "행운의 장소 (한국어, 10자 이내, 예: 카페)",
  "luckyTime": "별빛이 머무는 시간 (오늘 안의 시간대, 예: 오후 2~4시, 저녁 7~9시)",
  "lottoNumbers": [
    [로또 1세트: 1~45 사이 숫자 6개, 중복 없음, 오름차순],
    [로또 2세트: 1~45 사이 숫자 6개, 중복 없음, 오름차순]
  ]
}`;

export async function POST(request: NextRequest) {
  let zodiac = '알 수 없음';
  let zodiacEmoji = '⭐';
  let birthDate = '';
  let gender = '';

  try {
    const body = await request.json();
    zodiac = body.zodiac || zodiac;
    zodiacEmoji = body.zodiacEmoji || zodiacEmoji;
    birthDate = body.birthDate || '';
    gender = body.gender || '';

    if (!zodiac || !gender || !birthDate) {
      return Response.json({ error: '필수 정보가 누락되었습니다.' }, { status: 400 });
    }

    const today = new Date().toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });

    const message = await client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `오늘 날짜: ${today}
별자리: ${zodiacEmoji} ${zodiac}
성별: ${gender === 'male' ? '남성' : '여성'}
생년월일: ${birthDate}

위 정보를 바탕으로 오늘의 운세를 JSON 형식으로 생성해주세요.`,
        },
      ],
    });

    const textContent = message.content.find((b) => b.type === 'text');
    if (!textContent || textContent.type !== 'text') throw new Error('응답 파싱 실패');

    const jsonText = textContent.text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const parsed = JSON.parse(jsonText);

    // Claude가 누락한 필드는 fallback에서 채워줌
    const fallback = getFallbackFortune(zodiac, zodiacEmoji, birthDate, gender);

    const result: FortuneResult = {
      zodiac,
      zodiacEmoji,
      fortune: parsed.fortune ?? fallback.fortune,
      score: parsed.score ?? fallback.score,
      luckyNumbers: parsed.luckyNumbers ?? fallback.luckyNumbers,
      luckyColor: parsed.luckyColor ?? fallback.luckyColor,
      luckyColorHex: parsed.luckyColorHex ?? fallback.luckyColorHex,
      luckyPlace: parsed.luckyPlace ?? fallback.luckyPlace,
      luckyTime: parsed.luckyTime ?? fallback.luckyTime,
      lottoNumbers: parsed.lottoNumbers ?? fallback.lottoNumbers,
    };

    return Response.json({ success: true, data: result });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[별로또] Fortune API error:', msg);

    if (error instanceof Anthropic.AuthenticationError) {
      console.error('[별로또] → API 키 오류. .env.local의 ANTHROPIC_API_KEY를 확인하세요.');
    } else if (error instanceof Anthropic.RateLimitError) {
      console.error('[별로또] → API 요청 한도 초과.');
    }

    // fallback: birthDate + gender 전달로 입력마다 다른 결과 생성
    const fallback = getFallbackFortune(zodiac, zodiacEmoji, birthDate, gender);
    return Response.json({
      success: true,
      data: fallback,
      fallback: true,
      ...(process.env.NODE_ENV === 'development' && { debugError: msg }),
    });
  }
}
