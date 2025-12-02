import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getCurrentUser, signOut as authSignOut } from '@/services/authService';
import { supabase } from '@/config/supabase';
import type { AuthUser } from '@/services/authService';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  error: Error | null;
  isAdmin: boolean;
  signOut: () => Promise<void>;
  retry: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Derive isAdmin from user role
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    let mounted = true;
    let initialized = false;

    // 1. 초기 세션 확인 (최초 로드 시 한 번만)
    const initializeAuth = async () => {
      console.log('[AuthContext] 초기화 시작...');
      setIsLoading(true);
      setError(null);

      try {
        const user = await getCurrentUser();
        console.log('[AuthContext] 초기화 완료, 사용자:', user);
        if (mounted) {
          setUser(user);
          initialized = true; // 초기화 완료 표시
        }
      } catch (err) {
        console.error('[AuthContext] 초기화 실패:', err);
        if (mounted) {
          setError(err instanceof Error ? err : new Error('인증 초기화 실패'));
          setUser(null);
          initialized = true;
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // 2. 인증 상태 변경 구독 (로그인/로그아웃 이벤트용)
    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('[AuthContext] 인증 상태 변경:', event);

      // 초기 세션과 초기화 중 발생하는 SIGNED_IN은 무시
      if (event === 'INITIAL_SESSION' || !initialized) {
        console.log('[AuthContext] 초기화 중이므로 이벤트 무시:', event);
        return;
      }

      if (event === 'SIGNED_OUT') {
        console.log('[AuthContext] 로그아웃 감지');
        setUser(null);
        setError(null);
        return;
      }

      // 실제 로그인 또는 토큰 갱신만 처리 (초기 로드 제외)
      if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        console.log('[AuthContext] 로그인/토큰 갱신 감지 (초기화 이후)');
        try {
          const user = await getCurrentUser();
          if (mounted) {
            setUser(user);
            setError(null);
          }
        } catch (err) {
          console.error('[AuthContext] 사용자 정보 조회 실패:', err);
          if (mounted) {
            setError(err instanceof Error ? err : new Error('사용자 정보 조회 실패'));
            setUser(null);
          }
        }
      }
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []); // 빈 의존성 배열 - 한 번만 실행!

  const retry = useCallback(async () => {
    console.log('[AuthContext] 수동 재시도 시작...');
    setIsLoading(true);
    setError(null);

    try {
      const user = await getCurrentUser();
      console.log('[AuthContext] 재시도 성공, 사용자:', user);
      setUser(user);
    } catch (err) {
      console.error('[AuthContext] 재시도 실패:', err);
      setError(err instanceof Error ? err : new Error('인증 초기화 실패'));
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = async () => {
    await authSignOut();
    setUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, error, isAdmin, signOut, retry }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
