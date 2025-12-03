import { createClient } from '@supabase/supabase-js';

// Supabase 설정
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  const error = 'Supabase credentials are missing. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.';
  console.error(error);
  throw new Error(error);
}

// Supabase 클라이언트 생성 (캐시 최적화 설정)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // 세션 자동 갱신
    autoRefreshToken: true,
    // 세션 지속성 설정 (localStorage 사용)
    persistSession: true,
    // 세션 감지 활성화
    detectSessionInUrl: true,
  },
  // Realtime 비활성화 (필요하지 않다면)
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
