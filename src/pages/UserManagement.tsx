import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getAllUsers, updateUserRole } from '@/services/authService';
import type { User } from '@/types';

const UserManagement = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!isAdmin) {
      alert('관리자 권한이 필요합니다.');
      navigate('/');
      return;
    }
    loadUsers();
  }, [isAdmin, navigate]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
      alert('사용자 목록을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'student' | 'admin') => {
    if (!user) return;

    // Prevent last admin removal
    if (newRole === 'student') {
      const adminCount = users.filter((u) => u.role === 'admin').length;
      if (adminCount <= 1) {
        alert('마지막 관리자는 권한을 제거할 수 없습니다.');
        return;
      }
    }

    const action = newRole === 'admin' ? '관리자로 승격' : '일반 사용자로 변경';
    if (!confirm(`정말로 이 사용자를 ${action}하시겠습니까?`)) {
      return;
    }

    try {
      await updateUserRole(userId, newRole);
      alert('역할이 변경되었습니다.');
      loadUsers();
    } catch (error) {
      console.error('Failed to update role:', error);
      alert(error instanceof Error ? error.message : '역할 변경에 실패했습니다.');
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 to-slate-900">
        <p className="text-white">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-slate-900 p-8">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <Link to="/" className="text-white hover:text-indigo-300 transition-colors">
            ← 홈으로 돌아가기
          </Link>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8">
          <h1 className="text-4xl font-bold text-white mb-8">👥 사용자 관리</h1>

          <div className="mb-6">
            <input
              type="text"
              placeholder="이메일 또는 이름으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/50 border border-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left p-4 text-white">이메일</th>
                  <th className="text-left p-4 text-white">이름</th>
                  <th className="text-left p-4 text-white">역할</th>
                  <th className="text-left p-4 text-white">가입일</th>
                  <th className="text-left p-4 text-white">작업</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="border-b border-white/10 hover:bg-white/5">
                    <td className="p-4 text-white/90">{u.email}</td>
                    <td className="p-4 text-white/90">{u.name || '-'}</td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          u.role === 'admin'
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-500 text-white'
                        }`}
                      >
                        {u.role === 'admin' ? '관리자' : '학생'}
                      </span>
                    </td>
                    <td className="p-4 text-white/90">
                      {new Date(u.created_at).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="p-4">
                      {u.id !== user?.id ? (
                        <button
                          onClick={() =>
                            handleRoleChange(u.id, u.role === 'admin' ? 'student' : 'admin')
                          }
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            u.role === 'admin'
                              ? 'bg-red-600 hover:bg-red-700 text-white'
                              : 'bg-purple-600 hover:bg-purple-700 text-white'
                          }`}
                        >
                          {u.role === 'admin' ? '권한 제거' : '관리자 승격'}
                        </button>
                      ) : (
                        <span className="text-white/40 text-sm">본인</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-white/60">사용자를 찾을 수 없습니다.</p>
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-500/20 border border-blue-500 rounded-lg">
            <p className="text-blue-200 text-sm">
              💡 <strong>팁:</strong> 사용자의 역할을 변경하면 해당 사용자는 다음 로그인 시 변경된
              권한이 적용됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
