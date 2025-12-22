import { Link } from 'react-router-dom';
import UserHeader from '@/components/UserHeader';
import { useAuth } from '@/contexts/AuthContext';

interface FeatureItem {
  title: string;
  description: string;
  icon: string;
  link: string;
  gradient: string;
}

const Home = () => {
  const { isAdmin } = useAuth();

  const features: FeatureItem[] = [
    {
      title: '자리 배치표',
      description: '우리 반 학생들의 자리를 확인하고 관리합니다',
      icon: '🪑',
      link: '/seats',
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      title: '급식 정보',
      description: '오늘의 급식 메뉴를 확인하세요',
      icon: '🍱',
      link: '/meals',
      gradient: 'from-green-500 to-green-600',
    },
    {
      title: '공지사항',
      description: '중요한 공지사항을 확인하세요',
      icon: '📢',
      link: '/notices',
      gradient: 'from-purple-500 to-purple-600',
    },
    {
      title: '건의사항',
      description: '자유롭게 의견을 남겨주세요',
      icon: '💬',
      link: '/suggestions',
      gradient: 'from-orange-500 to-orange-600',
    },
    {
      title: '랜덤 뽑기',
      description: '번호를 랜덤으로 뽑아보세요',
      icon: '🎲',
      link: '/random',
      gradient: 'from-pink-500 to-pink-600',
    },
  ];

  // Admin-only features
  const adminFeatures: FeatureItem[] = isAdmin
    ? [
        {
          title: '사용자 관리',
          description: '사용자 역할 및 권한을 관리합니다',
          icon: '👥',
          link: '/users',
          gradient: 'from-indigo-500 to-purple-600',
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 사용자 헤더 */}
      <UserHeader />

      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="text-4xl">🏫</div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">학급 관리 시스템</h1>
              <p className="text-sm text-gray-600">우리 반을 위한 스마트 관리 플랫폼</p>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...features, ...adminFeatures].map((feature, index) => (
            <Link
              key={index}
              to={feature.link}
              className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100"
            >
              {/* 그라데이션 헤더 */}
              <div className={`bg-gradient-to-r ${feature.gradient} p-6`}>
                <div className="flex items-center gap-4">
                  <div className="text-5xl transform group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h2 className="text-2xl font-bold text-white">{feature.title}</h2>
                </div>
              </div>

              {/* 콘텐츠 */}
              <div className="p-6">
                <p className="text-gray-600 text-lg">{feature.description}</p>
                <div className="mt-4 flex items-center text-blue-600 font-medium group-hover:translate-x-2 transition-transform duration-300">
                  바로가기
                  <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Home;
