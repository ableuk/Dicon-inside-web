import { useState, useEffect } from 'react';
import type { Suggestion, SuggestionCategory } from '@/types';
import { createSuggestion, getUserSuggestions } from '@/services/suggestionService';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import BackgroundBlur from '@/components/BackgroundBlur';

const StudentSuggestions = () => {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // 폼 상태
  const [category, setCategory] = useState<SuggestionCategory>('시설');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const categories: SuggestionCategory[] = ['시설', '급식', '수업', '기타'];

  useEffect(() => {
    if (user) {
      loadSuggestions();
    }
  }, [user]);

  const loadSuggestions = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await getUserSuggestions(user.id);
      setSuggestions(data);
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      await createSuggestion({
        category,
        title,
        content,
        status: 'pending',
        createdAt: new Date(),
        userId: user.id
      });

      // 폼 초기화
      setTitle('');
      setContent('');
      setCategory('시설');
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);

      // 목록 새로고침
      await loadSuggestions();
    } catch (error) {
      console.error('Failed to submit suggestion:', error);
      alert('건의사항 제출에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  const getStatusBadge = (status: string) => {
    if (status === 'pending') {
      return <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">대기중</span>;
    }
    return <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">확인완료</span>;
  };

  const getCategoryColor = (cat: SuggestionCategory) => {
    const colors = {
      '시설': 'bg-blue-100 text-blue-800',
      '급식': 'bg-green-100 text-green-800',
      '수업': 'bg-purple-100 text-purple-800',
      '기타': 'bg-gray-100 text-gray-800'
    };
    return colors[cat];
  };

  if (!user) {
    return (
      <div className="min-h-screen relative">
        <BackgroundBlur />
        <Sidebar />
        <main className="ml-[300px] p-6 min-h-screen flex items-center justify-center">
          <div className="bg-white/80 backdrop-blur-md border border-[#FFE1B6] rounded-2xl p-12 text-center">
            <p className="text-gray-600">로그인이 필요합니다.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <BackgroundBlur />
      <Sidebar />

      <main className="ml-[300px] p-6 min-h-screen">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* 헤더 */}
          <div className="mb-8">
            <h1 className="text-4xl font-extrabold text-black mb-2">건의 사항</h1>
            <p className="text-gray-600">
              자유롭게 의견을 남겨주세요. 모든 건의사항은 익명으로 처리됩니다.
            </p>
          </div>

          {/* 탭 */}
          <div className="flex gap-3">
            <button
              onClick={() => setShowForm(true)}
              className={`px-6 py-3 rounded-lg font-bold transition-colors ${
                showForm
                  ? 'bg-dicon-orange text-white'
                  : 'bg-white/80 border border-[#FFE1B6] text-gray-700 hover:bg-white'
              }`}
            >
              건의사항 작성
            </button>
            <button
              onClick={() => setShowForm(false)}
              className={`px-6 py-3 rounded-lg font-bold transition-colors ${
                !showForm
                  ? 'bg-dicon-orange text-white'
                  : 'bg-white/80 border border-[#FFE1B6] text-gray-700 hover:bg-white'
              }`}
            >
              내 건의사항 ({suggestions.length})
            </button>
          </div>

          {/* 성공 메시지 */}
          {showSuccessMessage && (
            <div className="bg-green-100 border border-green-400 text-green-800 p-4 rounded-lg font-medium">
              ✅ 건의사항이 성공적으로 제출되었습니다!
            </div>
          )}

          {/* 컨텐츠 */}
          <div className="bg-white/80 backdrop-blur-md border border-[#FFE1B6] rounded-2xl p-8">
            {showForm ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-gray-700 mb-2 font-semibold">카테고리</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                          category === cat
                            ? 'bg-dicon-orange text-white'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2 font-semibold">제목</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-white border-2 border-gray-300 text-black rounded-lg px-4 py-3 focus:outline-none focus:border-dicon-orange"
                    placeholder="건의사항 제목을 입력하세요"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2 font-semibold">내용</label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full bg-white border-2 border-gray-300 text-black rounded-lg px-4 py-3 focus:outline-none focus:border-dicon-orange min-h-[200px]"
                    placeholder="건의사항 내용을 자세히 작성해주세요"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-dicon-orange hover:bg-dicon-orange/90 text-white px-6 py-3 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '제출 중...' : '제출하기'}
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin h-12 w-12 border-4 border-dicon-orange border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-gray-600 mt-4">로딩 중...</p>
                  </div>
                ) : suggestions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">💬</div>
                    <p className="text-gray-500 text-lg">
                      아직 작성한 건의사항이 없습니다.
                    </p>
                  </div>
                ) : (
                  suggestions.map((suggestion) => (
                    <div
                      key={suggestion.id}
                      className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${getCategoryColor(suggestion.category)}`}>
                            {suggestion.category}
                          </span>
                          {getStatusBadge(suggestion.status)}
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDate(suggestion.createdAt)}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-black mb-2">
                        {suggestion.title}
                      </h3>
                      <p className="text-gray-700 mb-4">{suggestion.content}</p>
                      {suggestion.adminNote && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <p className="text-sm font-bold text-green-700 mb-1">관리자 답변</p>
                          <p className="text-gray-800">{suggestion.adminNote}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentSuggestions;
