/**
 * 개발 환경에서 캐시 관련 문제 해결을 위한 유틸리티
 */

/**
 * Supabase 세션 캐시 클리어
 * 로그인 문제가 발생하면 이 함수를 호출하세요
 */
export const clearSupabaseCache = () => {
  if (typeof window === 'undefined') return;

  console.log('[캐시 클리어] Supabase 세션 데이터 삭제 시작...');

  // LocalStorage에서 Supabase 관련 데이터 제거
  const keys = Object.keys(localStorage);
  keys.forEach((key) => {
    if (key.includes('supabase') || key.includes('sb-')) {
      localStorage.removeItem(key);
      console.log('[캐시 클리어] 삭제됨:', key);
    }
  });

  // SessionStorage에서 Supabase 관련 데이터 제거
  const sessionKeys = Object.keys(sessionStorage);
  sessionKeys.forEach((key) => {
    if (key.includes('supabase') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
      console.log('[캐시 클리어] 세션 삭제됨:', key);
    }
  });

  console.log('[캐시 클리어] 완료! 페이지를 새로고침하세요.');
};

/**
 * 전체 앱 캐시 클리어 (개발용)
 * 개발자 도구 콘솔에서 window.clearAppCache() 호출 가능
 */
export const clearAppCache = () => {
  if (typeof window === 'undefined') return;

  console.log('[캐시 클리어] 전체 앱 캐시 삭제 시작...');

  // LocalStorage 전체 클리어
  localStorage.clear();
  console.log('[캐시 클리어] LocalStorage 클리어됨');

  // SessionStorage 전체 클리어
  sessionStorage.clear();
  console.log('[캐시 클리어] SessionStorage 클리어됨');

  console.log('[캐시 클리어] 완료! 페이지를 새로고침하세요.');
};

// 개발 환경에서만 전역 함수로 노출
if (import.meta.env.DEV) {
  (window as any).clearSupabaseCache = clearSupabaseCache;
  (window as any).clearAppCache = clearAppCache;
  console.log('[개발 모드] 캐시 클리어 함수 사용 가능:');
  console.log('  - window.clearSupabaseCache() : Supabase 세션만 클리어');
  console.log('  - window.clearAppCache() : 전체 캐시 클리어');
}
