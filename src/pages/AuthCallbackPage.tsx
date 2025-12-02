import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/config/supabase';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // 세션 확인만 수행 (프로필 생성은 AuthContext에서 자동 처리)
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (data.session?.user) {
          console.log('[AuthCallbackPage] 인증 성공, 홈으로 이동');
          // 홈으로 리다이렉트 (프로필 생성은 AuthContext의 getCurrentUser에서 자동 처리)
          navigate('/', { replace: true });
        } else {
          throw new Error('인증 정보를 찾을 수 없습니다.');
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
