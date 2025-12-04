import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/config/supabase';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('[AuthCallbackPage] OAuth 콜백 처리 시작');
        console.log('[AuthCallbackPage] URL:', window.location.href);

        // URL에서 해시 프래그먼트 확인
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        console.log('[AuthCallbackPage] Access token 존재:', !!accessToken);
        console.log('[AuthCallbackPage] Refresh token 존재:', !!refreshToken);

        // Supabase가 자동으로 세션 처리하도록 대기
        // (hash fragment의 토큰을 자동으로 처리함)
        await new Promise(resolve => setTimeout(resolve, 500));

        // 세션 확인
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('[AuthCallbackPage] getSession 오류:', error);
          throw error;
        }

        console.log('[AuthCallbackPage] 세션 데이터:', data.session ? '존재함' : '없음');

        if (data.session?.user) {
          console.log('[AuthCallbackPage] 인증 성공, 사용자 ID:', data.session.user.id);
          // 홈으로 리다이렉트 (프로필 생성은 AuthContext의 getCurrentUser에서 자동 처리)
          navigate('/', { replace: true });
        } else {
          // 토큰은 있지만 세션이 없는 경우, 토큰으로 세션 설정 시도
          if (accessToken && refreshToken) {
            console.log('[AuthCallbackPage] 토큰으로 세션 설정 시도');
            const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (sessionError) {
              console.error('[AuthCallbackPage] setSession 오류:', sessionError);
              throw sessionError;
            }

            if (sessionData.session) {
              console.log('[AuthCallbackPage] 세션 설정 성공');
              navigate('/', { replace: true });
              return;
            }
          }

          throw new Error('인증 정보를 찾을 수 없습니다. Supabase 설정을 확인해주세요.');
        }
      } catch (err) {
        console.error('[AuthCallbackPage] 인증 콜백 처리 오류:', err);
        setError(err instanceof Error ? err.message : '인증 처리 중 오류가 발생했습니다.');
        // 3초 후 로그인 페이지로 리다이렉트
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 3000);
      }
    };

    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">인증 오류</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-sm text-gray-500">잠시 후 로그인 페이지로 이동합니다...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">로그인 처리 중...</h2>
          <p className="text-gray-600 mt-2">잠시만 기다려주세요.</p>
        </div>
      </div>
    </div>
  );
}
