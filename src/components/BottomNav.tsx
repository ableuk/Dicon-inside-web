import { Link, useLocation } from 'react-router-dom';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
}

export default function BottomNav() {
  const location = useLocation();

  const navItems: NavItem[] = [
    { id: 'meals', label: '급식', icon: 'restaurant', path: '/meals' },
    { id: 'notices', label: '공지', icon: 'campaign', path: '/notices' },
    { id: 'suggestions', label: '건의', icon: 'forum', path: '/suggestions' },
    { id: 'seats', label: '자리', icon: 'grid_view', path: '/seats' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg z-50">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all ${
                active
                  ? 'text-dicon-orange'
                  : 'text-gray-400'
              }`}
            >
              <span className={`material-symbols-outlined ${active ? 'text-[28px]' : 'text-[24px]'}`}>
                {item.icon}
              </span>
              <span className={`text-xs ${active ? 'font-bold' : 'font-medium'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
