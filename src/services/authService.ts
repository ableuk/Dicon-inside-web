import { supabase } from '@/config/supabase';
import type { User } from '@/types';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  role: 'student' | 'admin';
}

interface RetryConfig {
  maxRetries: number;
  timeoutMs: number;
  retryDelayMs: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  timeoutMs: 5000, // 5초로 증가
  retryDelayMs: 1000,
};

/**
 * Google OAuth를 통한 로그인
 */
export const signInWithGoogle = async () => {
  try {
    // Validate environment
    if (!window?.location?.origin) {
      throw new Error('브라우저 환경을 확인할 수 없습니다. 페이지를 새로고침해주세요.');
    }

    const redirectTo = `${window.location.origin}/auth/callback`;
    console.log('[signInWithGoogle] Redirect URL:', redirectTo);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      console.error('[signInWithGoogle] OAuth 오류:', error);
      throw new Error(`Google 로그인 실패: ${error.message}`);
    }

    console.log('[signInWithGoogle] OAuth 리다이렉트 준비 완료');
    return data;
  } catch (error) {
    console.error('[signInWithGoogle] 예외 발생:', error);
    throw error;
  }
};

/**
 * 로그아웃
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(`로그아웃 실패: ${error.message}`);
  }
};

/**
 * 현재 로그인한 사용자 정보 가져오기
 */
export const getCurrentUser = async (): Promise<AuthUser | null> => {
  console.log('[authService] getCurrentUser 시작');
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    console.log('[authService] 사용자 없음 또는 에러:', error);
    return null;
  }

  console.log('[authService] Supabase 사용자:', user.id);

  // 먼저 프로필 존재 여부 확인
  let role = await getUserRole(user.id);
  console.log('[authService] 사용자 역할:', role);

  // 사용자 프로필이 없으면 생성 (첫 로그인 시)
  if (role === null) {
    console.log('[authService] 사용자 프로필 없음. 생성 시작...');
    try {
      await upsertUserProfile({
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.name || user.user_metadata?.full_name,
        avatar_url: user.user_metadata?.avatar_url,
      });
      // 프로필 생성 후 재시도 로직으로 역할 조회
      role = await getUserRoleWithRetry(user.id);
      console.log('[authService] 프로필 생성 후 역할:', role);
    } catch (err) {
      console.error('[authService] 프로필 생성 실패:', err);
      role = 'student'; // 실패 시 기본값
    }
  } else {
    // 프로필이 이미 존재하면 재시도 없이 바로 사용
    role = role || 'student';
  }

  return {
    id: user.id,
    email: user.email || '',
    name: user.user_metadata?.name || user.user_metadata?.full_name,
    avatar_url: user.user_metadata?.avatar_url,
    role: role,
  };
};

/**
 * 사용자 세션 확인
 */
export const getSession = async () => {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw new Error(`세션 확인 실패: ${error.message}`);
  }

  return session;
};

/**
 * 인증 상태 변경 구독
 */
export const onAuthStateChange = (callback: (user: AuthUser | null) => void) => {
  return supabase.auth.onAuthStateChange(async (_event, session) => {
    if (session?.user) {
      // Fetch role from database
      const role = await getUserRole(session.user.id);

      const authUser: AuthUser = {
        id: session.user.id,
        email: session.user.email || '',
        name: session.user.user_metadata?.name || session.user.user_metadata?.full_name,
        avatar_url: session.user.user_metadata?.avatar_url,
        role: role || 'student', // null일 경우 기본값 사용
      };
      callback(authUser);
    } else {
      callback(null);
    }
  });
};

/**
 * 사용자 역할 가져오기 (Supabase DB에서)
 */
export const getUserRole = async (userId: string): Promise<'student' | 'admin' | null> => {
  console.log('[authService] getUserRole 시작, userId:', userId);

  try {
    // 5초 타임아웃 설정 (2초에서 증가)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .abortSignal(controller.signal)
      .single();

    clearTimeout(timeoutId);

    if (error) {
      console.error('[authService] 역할 조회 실패:', error);

      // PGRST116: 데이터가 없음 (사용자 프로필이 생성되지 않음)
      if (error.code === 'PGRST116') {
        console.warn('[authService] 사용자 프로필이 없습니다.');
        return null; // 프로필 없음
      }

      return 'student'; // 기본값
    }

    console.log('[authService] 역할 조회 성공:', data);
    return data?.role || 'student';
  } catch (error) {
    console.error('[authService] getUserRole 예외:', error);
    // 타임아웃 또는 다른 에러 - 프로필 없음으로 간주
    return null;
  }
};

/**
 * 재시도 로직이 포함된 역할 조회
 */
export const getUserRoleWithRetry = async (
  userId: string,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<'student' | 'admin'> => {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < config.maxRetries; attempt++) {
    try {
      console.log(`[getUserRoleWithRetry] 시도 ${attempt + 1}/${config.maxRetries}`);
      const role = await getUserRole(userId);

      // 프로필이 없는 경우(null)도 정상적인 상황으로 간주하고 즉시 반환
      if (role === null) {
        console.log('[getUserRoleWithRetry] 프로필 없음 (null 반환)');
        return 'student'; // 기본값 반환 (무한 루프 방지)
      }

      console.log('[getUserRoleWithRetry] 역할 조회 성공:', role);
      return role;
    } catch (error) {
      lastError = error as Error;
      console.warn(`[getUserRoleWithRetry] 시도 ${attempt + 1} 실패:`, error);

      // 마지막 시도가 아니면 대기 후 재시도
      if (attempt < config.maxRetries - 1) {
        console.log(`[getUserRoleWithRetry] ${config.retryDelayMs}ms 대기 후 재시도...`);
        await new Promise((resolve) => setTimeout(resolve, config.retryDelayMs));
      }
    }
  }

  console.error('[getUserRoleWithRetry] 모든 재시도 실패:', lastError);
  // 모든 재시도 실패 시 기본값 반환 (무한 로딩 방지)
  return 'student';
};

// 진행 중인 upsert 작업을 추적 (중복 실행 방지)
const upsertPromises = new Map<string, Promise<void>>();

/**
 * 사용자 프로필 생성 또는 업데이트 (내부 구현)
 */
async function executeUpsert(user: Omit<AuthUser, 'role'>): Promise<void> {
  // Check if user already exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('id, role')
    .eq('id', user.id)
    .single();

  // If user exists, just update profile (not role)
  if (existingUser) {
    const { error } = await supabase
      .from('users')
      .update({
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) {
      console.error('프로필 업데이트 실패:', error);
      throw new Error(`프로필 업데이트 실패: ${error.message}`);
    }
    return;
  }

  // New user: check if this is the first user
  const { count } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true });

  const defaultRole = count === 0 ? 'admin' : 'student';

  // Insert new user with role
  const { error } = await supabase.from('users').insert({
    id: user.id,
    email: user.email,
    name: user.name,
    avatar_url: user.avatar_url,
    role: defaultRole,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  if (error) {
    // 중복 키 에러는 무시 (다른 요청에서 이미 생성됨)
    if (error.code === '23505') {
      console.log('[upsertUserProfile] 프로필이 이미 존재합니다 (중복 키 에러 무시)');
      return;
    }
    console.error('프로필 생성 실패:', error);
    throw new Error(`프로필 생성 실패: ${error.message}`);
  }
}

/**
 * 사용자 프로필 생성 또는 업데이트 (중복 방지)
 */
export const upsertUserProfile = async (user: Omit<AuthUser, 'role'>): Promise<void> => {
  // 이미 진행 중인 작업이 있으면 해당 Promise 반환
  const existingPromise = upsertPromises.get(user.id);
  if (existingPromise) {
    console.log('[upsertUserProfile] 이미 진행 중인 작업 대기...');
    return existingPromise;
  }

  // 새 작업 시작
  const promise = executeUpsert(user);
  upsertPromises.set(user.id, promise);

  try {
    await promise;
  } finally {
    // 완료 후 Map에서 제거
    upsertPromises.delete(user.id);
  }
};

/**
 * 모든 사용자 목록 가져오기 (관리자 전용)
 */
export const getAllUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`사용자 목록 조회 실패: ${error.message}`);
  }

  return data || [];
};

/**
 * 사용자 역할 변경 (관리자 전용)
 */
export const updateUserRole = async (
  userId: string,
  newRole: 'student' | 'admin'
): Promise<void> => {
  const { error } = await supabase
    .from('users')
    .update({
      role: newRole,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) {
    throw new Error(`역할 변경 실패: ${error.message}`);
  }
};
