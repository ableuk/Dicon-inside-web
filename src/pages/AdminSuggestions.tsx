import { useState, useEffect } from 'react';
import type { Suggestion, SuggestionCategory, SuggestionStatus } from '@/types';
import {
  getAllSuggestions,
  updateSuggestionStatus,
  filterSuggestionsByStatus,
  filterSuggestionsByCategory,
  searchSuggestions
} from '@/services/suggestionService';
import Sidebar from '@/components/Sidebar';
import BackgroundBlur from '@/components/BackgroundBlur';

const AdminSuggestions = () => {
  const [allSuggestions, setAllSuggestions] = useState<Suggestion[]>([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [showModal, setShowModal] = useState(false);

  // 필터 상태
  const [statusFilter, setStatusFilter] = useState<SuggestionStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<SuggestionCategory | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'oldest'>('latest');

  const categories: SuggestionCategory[] = ['시설', '급식', '수업', '기타'];

  useEffect(() => {
    loadSuggestions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [allSuggestions, statusFilter, categoryFilter, searchTerm, sortBy]);

  const loadSuggestions = async () => {
    try {
      setLoading(true);
      const data = await getAllSuggestions();
      setAllSuggestions(data);
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allSuggestions];

    if (statusFilter !== 'all') {
      filtered = filterSuggestionsByStatus(filtered, statusFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filterSuggestionsByCategory(filtered, categoryFilter);
    }

    if (searchTerm) {
      filtered = searchSuggestions(filtered, searchTerm);
    }

    if (sortBy === 'latest') {
      filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } else {
      filtered.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    }

    setFilteredSuggestions(filtered);
  };

  const handleOpenModal = (suggestion: Suggestion) => {
    setSelectedSuggestion(suggestion);
    setAdminNote(suggestion.adminNote || '');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedSuggestion(null);
    setAdminNote('');
  };

  const handleStatusChange = async (newStatus: SuggestionStatus) => {
    if (!selectedSuggestion) return;

    try {
      setLoading(true);
      await updateSuggestionStatus(selectedSuggestion.id, newStatus, adminNote);
      await loadSuggestions();
      handleCloseModal();
    } catch (error) {
      console.error('Failed to update suggestion status:', error);
      alert('상태 변경에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}.${month}.${day} ${hours}:${minutes}`;
  };

  const getStatusBadge = (status: SuggestionStatus) => {
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

  const pendingCount = allSuggestions.filter(s => s.status === 'pending').length;
  const reviewedCount = allSuggestions.filter(s => s.status === 'reviewed').length;

  return (
    <div className="min-h-screen relative">
      <BackgroundBlur />
      <Sidebar />

      <main className="ml-[300px] p-6 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* 헤더 */}
          <div className="mb-8">
            <h1 className="text-4xl font-extrabold text-black mb-2">건의사항 관리</h1>
            <p className="text-gray-600">학생들의 건의사항을 확인하고 답변하세요</p>
          </div>

          {/* 통계 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/80 backdrop-blur-md border border-[#FFE1B6] rounded-2xl p-6">
              <p className="text-gray-600 text-sm mb-1">전체 건의사항</p>
              <p className="text-4xl font-bold text-black">{allSuggestions.length}</p>
            </div>
            <div className="bg-yellow-50 border-2 border-yellow-400 rounded-2xl p-6">
              <p className="text-yellow-700 text-sm mb-1 font-semibold">대기중</p>
              <p className="text-4xl font-bold text-yellow-600">{pendingCount}</p>
            </div>
            <div className="bg-green-50 border-2 border-green-400 rounded-2xl p-6">
              <p className="text-green-700 text-sm mb-1 font-semibold">확인완료</p>
              <p className="text-4xl font-bold text-green-600">{reviewedCount}</p>
            </div>
          </div>

          {/* 필터 */}
          <div className="bg-white/80 backdrop-blur-md border border-[#FFE1B6] rounded-2xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">상태</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as SuggestionStatus | 'all')}
                  className="w-full bg-white border-2 border-gray-300 text-black rounded-lg px-3 py-2 focus:outline-none focus:border-dicon-orange"
                >
                  <option value="all">전체</option>
                  <option value="pending">대기중</option>
                  <option value="reviewed">확인완료</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">카테고리</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value as SuggestionCategory | 'all')}
                  className="w-full bg-white border-2 border-gray-300 text-black rounded-lg px-3 py-2 focus:outline-none focus:border-dicon-orange"
                >
                  <option value="all">전체</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">정렬</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'latest' | 'oldest')}
                  className="w-full bg-white border-2 border-gray-300 text-black rounded-lg px-3 py-2 focus:outline-none focus:border-dicon-orange"
                >
                  <option value="latest">최신순</option>
                  <option value="oldest">오래된순</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">검색</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border-2 border-gray-300 text-black rounded-lg px-3 py-2 focus:outline-none focus:border-dicon-orange"
                  placeholder="제목 또는 내용 검색"
                />
              </div>
            </div>
          </div>

          {/* 건의사항 목록 */}
          <div className="bg-white/80 backdrop-blur-md border border-[#FFE1B6] rounded-2xl p-6">
            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin h-12 w-12 border-4 border-dicon-orange border-t-transparent rounded-full mx-auto"></div>
                  <p className="text-gray-600 mt-4">로딩 중...</p>
                </div>
              ) : filteredSuggestions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">💬</div>
                  <p className="text-gray-500 text-lg">
                    {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                      ? '검색 결과가 없습니다.'
                      : '등록된 건의사항이 없습니다.'}
                  </p>
                </div>
              ) : (
                filteredSuggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    onClick={() => handleOpenModal(suggestion)}
                    className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-bold px-2 py-1 rounded ${getCategoryColor(suggestion.category)}`}>
                          {suggestion.category}
                        </span>
                        {getStatusBadge(suggestion.status)}
                      </div>
                      <span className="text-sm text-gray-500 whitespace-nowrap">
                        {formatDate(suggestion.createdAt)}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-black mb-2">
                      {suggestion.title}
                    </h3>
                    <p className="text-gray-700 line-clamp-2">{suggestion.content}</p>
                    {suggestion.adminNote && (
                      <div className="mt-3 text-sm text-green-600 font-medium">
                        ✅ 답변 완료
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* 상세보기 모달 */}
      {showModal && selectedSuggestion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-3xl font-bold text-black">건의사항 상세</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-black text-3xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="space-y-6 mb-6">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2 py-1 rounded ${getCategoryColor(selectedSuggestion.category)}`}>
                  {selectedSuggestion.category}
                </span>
                {getStatusBadge(selectedSuggestion.status)}
              </div>

              <div>
                <p className="text-gray-600 text-sm font-semibold mb-1">제목</p>
                <p className="text-black text-xl font-bold">{selectedSuggestion.title}</p>
              </div>

              <div>
                <p className="text-gray-600 text-sm font-semibold mb-1">내용</p>
                <p className="text-gray-800 whitespace-pre-wrap">{selectedSuggestion.content}</p>
              </div>

              <div>
                <p className="text-gray-600 text-sm font-semibold mb-1">작성일</p>
                <p className="text-gray-800">{formatDate(selectedSuggestion.createdAt)}</p>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">관리자 답변</label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="w-full bg-white border-2 border-gray-300 text-black rounded-lg px-4 py-3 focus:outline-none focus:border-dicon-orange min-h-[100px]"
                  placeholder="학생에게 전달할 답변을 작성하세요"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleStatusChange('pending')}
                disabled={loading || selectedSuggestion.status === 'pending'}
                className="flex-1 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                대기중으로 변경
              </button>
              <button
                onClick={() => handleStatusChange('reviewed')}
                disabled={loading || selectedSuggestion.status === 'reviewed'}
                className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                확인완료로 변경
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSuggestions;
