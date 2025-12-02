import type { MealData, MealResponse, MealSearchResponse } from '@/types/meal';
import { handleMealError, handleMealResponse } from './mealServiceHelpers';

// xn--rh3b.net = 밥.net (Punycode)
// 개발 환경: Vite 프록시 사용 (/api -> https://api.xn--rh3b.net)
// 프로덕션: 직접 API 호출
const API_BASE_URL = import.meta.env.DEV ? '/api' : 'https://api.xn--rh3b.net';
console.log('[급식 API] Base URL:', API_BASE_URL);
console.log('[급식 API] 환경:', import.meta.env.DEV ? '개발(프록시)' : '프로덕션(직접)');
console.log('[급식 API] 실제 API:', 'https://api.xn--rh3b.net (밥.net의 Punycode)');

// 날짜 형식 변환: YYYYMMDD -> YYYY-MM-DD
const formatDateForAPI = (date: string): string => {
  if (date.length !== 8) return date;
  return `${date.substring(0, 4)}-${date.substring(4, 6)}-${date.substring(6, 8)}`;
};

// 테스트용 더미 데이터
const getDummyMealData = (date: string): MealData => {
  return {
    date,
    breakfast: ['흰쌀밥', '미역국', '계란후라이', '김치', '우유'],
    lunch: ['현미밥', '된장찌개', '제육볶음', '시금치나물', '배추김치', '과일'],
    dinner: ['흰쌀밥', '김치찌개', '생선구이', '콩나물무침', '깍두기'],
  };
};

export const fetchMealData = async (date: string): Promise<MealResponse> => {
  const formattedDate = formatDateForAPI(date);
  const url = `${API_BASE_URL}/${formattedDate}`;
  console.log('[급식 API] 요청:', { 원본날짜: date, 변환날짜: formattedDate, URL: url });
  try {
    const response = await fetch(url);
    const result = await handleMealResponse(response, url);

    // API 실패 시 더미 데이터 반환 (개발 중)
    if (!result.success) {
      console.warn('[급식 API] API 실패, 테스트 데이터 사용');
      return {
        success: true,
        data: getDummyMealData(date),
        message: '⚠️ 테스트 데이터 (API 연결 실패)',
      };
    }

    return result;
  } catch (error) {
    console.warn('[급식 API] 네트워크 에러, 테스트 데이터 사용');
    return {
      success: true,
      data: getDummyMealData(date),
      message: '⚠️ 테스트 데이터 (네트워크 오류)',
    };
  }
};

export const getMealDataServerSide = async (date: string): Promise<MealResponse | null> => {
  const formattedDate = formatDateForAPI(date);
  const url = `${API_BASE_URL}/${formattedDate}`;
  try {
    const response = await fetch(url, {
      cache: 'no-store',
    });
    return await handleMealResponse(response, url);
  } catch (error) {
    return handleMealError(error, url);
  }
};

export const refreshMealData = async (date: string): Promise<MealResponse> => {
  const formattedDate = formatDateForAPI(date);
  const url = `${API_BASE_URL}/refresh/${formattedDate}`;
  try {
    const response = await fetch(url, {
      method: 'POST',
    });
    const result = await handleMealResponse(response, url);

    // API 실패 시 더미 데이터 반환
    if (!result.success) {
      console.warn('[급식 API] 새로고침 실패, 테스트 데이터 사용');
      return {
        success: true,
        data: getDummyMealData(date),
        message: '⚠️ 테스트 데이터 (새로고침 실패)',
      };
    }

    return result;
  } catch (error) {
    console.warn('[급식 API] 새로고침 에러, 테스트 데이터 사용');
    return {
      success: true,
      data: getDummyMealData(date),
      message: '⚠️ 테스트 데이터 (새로고침 오류)',
    };
  }
};

export const searchFoodImage = async (foodName: string): Promise<MealSearchResponse | null> => {
  const url = `${API_BASE_URL}/search/${encodeURIComponent(foodName)}`;
  try {
    console.log('[급식 API] 음식 이미지 검색:', foodName, '| URL:', url);
    const response = await fetch(url);
    if (!response.ok) {
      console.warn('[급식 API] 이미지 검색 실패:', response.status);
      return null;
    }
    const data = await response.json();
    console.log('[급식 API] 이미지 검색 결과:', data);
    return data as MealSearchResponse;
  } catch (error) {
    console.error('[급식 API] 이미지 검색 에러:', error);
    return null;
  }
};
