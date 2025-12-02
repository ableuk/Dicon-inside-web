import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function UserHeader() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">DCinside Web</h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              {user.avatar_url && (
                <img
                  src={user.avatar_url}
                  alt={user.name || user.email}
                  className="h-8 w-8 rounded-full"
                />
              )}
              <div className="flex flex-col">
                {user.name && (
                  <span className="text-sm font-medium text-gray-900">{user.name}</span>
                )}
                <span className="text-xs text-gray-500">{user.email}</span>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
