import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  path: string;
}

export default function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();

  const menuItems: MenuItem[] = [
    { id: 'meals', label: '급식 정보', icon: 'restaurant', path: '/meals' },
    { id: 'notices', label: '공지 사항', icon: 'campaign', path: '/notices' },
    { id: 'suggestions', label: '건의 사항', icon: 'forum', path: '/suggestions' },
    { id: 'seats', label: '자리 배치', icon: 'grid_view', path: '/seats' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="fixed left-0 top-0 h-screen w-[300px] bg-white/80 backdrop-blur-md border-r border-[#FFE1B6] p-8 flex flex-col gap-16 z-10">
      {/* 로고 및 사용자 정보 */}
      <div className="flex flex-col items-center gap-3">
        {/* 로고 */}
        <Link to="/meals" className="w-full flex justify-center">
          <img
            src="/logo.png"
            alt="DICON INSIDE"
            className="h-12 w-auto object-contain"
          />
        </Link>

        {/* 사용자 이름 */}
        {user && (
          <div className="flex items-center gap-5 mt-3">
            <span className="text-2xl font-extrabold text-black">
              {user.name || user.email?.split('@')[0]}
            </span>
            {/* 학생 배지 */}
            <div className="flex items-center gap-1 px-2 py-1 border border-dicon-orange rounded-full">
              <span className="material-symbols-outlined text-[18px] text-dicon-brown">school</span>
              <span className="text-xs font-semibold text-dicon-brown">학생</span>
            </div>
          </div>
        )}
      </div>

      {/* 네비게이션 메뉴 */}
      <nav className="flex flex-col gap-8">
        {menuItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`flex items-center gap-3 transition-colors ${
                active ? 'text-dicon-orange' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <span className="material-symbols-outlined text-[32px]">{item.icon}</span>
              <span
                className={`text-xl ${
                  active ? 'font-bold' : 'font-medium'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
