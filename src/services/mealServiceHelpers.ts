import type { MealResponse } from '@/types/meal';

export const handleMealResponse = async (
  response: Response,
  requestUrl: string
): Promise<MealResponse> => {
  console.log('[급식 API] 요청 URL:', requestUrl);
  console.log('[급식 API] 응답 상태:', response.status, response.statusText);
  console.log('[급식 API] 응답 OK:', response.ok);

  if (!response.ok) {
    const errorMsg = `HTTP ${response.status}: ${response.statusText}`;
    console.error('[급식 API] 에러:', errorMsg);

    let detailedMessage = 'API 연결 실패';
    if (response.status === 404) {
      detailedMessage = '해당 날짜의 급식 정보를 찾을 수 없습니다';
    } else if (response.status === 500) {
      detailedMessage = '서버 오류가 발생했습니다';
    } else if (response.status === 0 || response.status >= 400) {
      detailedMessage = 'API 서버에 연결할 수 없습니다 (CORS 또는 네트워크 오류)';
    }

    return {
      success: false,
      error: errorMsg,
      message: detailedMessage,
    };
  }

  try {
    const apiResponse = await response.json();
    console.log('[급식 API] 응답 데이터:', apiResponse);
    console.log('[급식 API] 응답 데이터 상세:', JSON.stringify(apiResponse, null, 2));
    console.log('[급식 API] 데이터 타입:', typeof apiResponse);
    console.log('[급식 API] 데이터 키:', Object.keys(apiResponse));

    // API 응답 구조 변환: data.data.breakfast.regular -> breakfast
    const transformedData = {
      date: apiResponse.date,
      breakfast: apiResponse.data?.breakfast?.regular || [],
      lunch: apiResponse.data?.lunch?.regular || [],
      dinner: apiResponse.data?.dinner?.regular || [],
    };

    console.log('[급식 API] 변환된 데이터:', transformedData);

    return {
      success: true,
      data: transformedData,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown parsing error';
    console.error('[급식 API] 데이터 파싱 실패:', errorMsg);
    return {
      success: false,
      error: errorMsg,
      message: '데이터 파싱 실패: 서버 응답이 올바르지 않습니다',
    };
  }
};

export const handleMealError = (error: unknown, requestUrl: string): MealResponse => {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
  console.error('[급식 API] 요청 실패:', requestUrl);
  console.error('[급식 API] 에러 내용:', errorMessage);
  console.error('[급식 API] 에러 객체:', error);

  let detailedMessage = 'API 연결 실패';
  if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
    detailedMessage = '네트워크 오류: API 서버에 연결할 수 없습니다 (CORS 문제 가능성)';
  } else if (errorMessage.includes('timeout')) {
    detailedMessage = '요청 시간 초과: 서버 응답이 없습니다';
  }

  return {
    success: false,
    error: errorMessage,
    message: detailedMessage,
  };
};
