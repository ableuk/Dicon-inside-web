import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Notice } from '@/types';
import { getNotices } from '@/services/noticeService';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import BackgroundBlur from '@/components/BackgroundBlur';

const NoticeList = () => {
  const { isAdmin } = useAuth();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const noticesPerPage = 10;

  useEffect(() => {
    loadNotices();
  }, []);

  const loadNotices = async () => {
    try {
      setLoading(true);
      const data = await getNotices();
      setNotices(data);
    } catch (error) {
      console.error('Failed to load notices:', error);
    } finally {
      setLoading(false);
    }
  };

  // 페이지네이션
  const indexOfLastNotice = currentPage * noticesPerPage;
  const indexOfFirstNotice = indexOfLastNotice - noticesPerPage;
  const currentNotices = notices.slice(indexOfFirstNotice, indexOfLastNotice);
  const totalPages = Math.ceil(notices.length / noticesPerPage);

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen relative">
      <BackgroundBlur />
      <Sidebar />

      <main className="ml-[300px] p-6 min-h-screen">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* 헤더 */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-extrabold text-black mb-2">공지 사항</h1>
              <p className="text-gray-600">중요한 공지사항을 확인하세요</p>
            </div>
            {isAdmin && (
              <Link
                to="/notices/new"
                className="bg-dicon-orange hover:bg-dicon-orange/90 text-white px-6 py-3 rounded-lg font-bold transition-colors"
              >
                + 공지사항 작성
              </Link>
            )}
          </div>

          {/* 로딩 */}
          {loading ? (
            <div className="bg-white/80 backdrop-blur-md border border-[#FFE1B6] rounded-2xl p-12 text-center">
              <div className="animate-spin h-12 w-12 border-4 border-dicon-orange border-t-transparent rounded-full mx-auto"></div>
              <p className="text-gray-600 mt-4">로딩 중...</p>
            </div>
          ) : (
            <div className="bg-white/80 backdrop-blur-md border border-[#FFE1B6] rounded-2xl p-8">
              {notices.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="text-6xl mb-4">📢</div>
                  <p className="text-gray-500 text-lg">등록된 공지사항이 없습니다.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {currentNotices.map((notice) => (
                      <Link
                        key={notice.id}
                        to={`/notices/${notice.id}`}
                        className="block bg-white hover:bg-gray-50 border border-gray-200 rounded-xl p-6 transition-all hover:shadow-md"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {notice.isPinned && (
                                <span className="bg-dicon-orange text-white text-xs font-bold px-2 py-1 rounded">
                                  고정
                                </span>
                              )}
                              {notice.isImportant && (
                                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                                  중요
                                </span>
                              )}
                              <h2 className="text-xl font-bold text-black">
                                {notice.title}
                              </h2>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                              <span className="font-medium">{notice.author}</span>
                              <span>•</span>
                              <span>{formatDate(notice.createdAt)}</span>
                            </div>
                          </div>
                          <div className="text-gray-400">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="mt-8 flex justify-center gap-2">
                      <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors font-medium"
                      >
                        이전
                      </button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                        <button
                          key={number}
                          onClick={() => paginate(number)}
                          className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                            currentPage === number
                              ? 'bg-dicon-orange text-white'
                              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {number}
                        </button>
                      ))}

                      <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors font-medium"
                      >
                        다음
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default NoticeList;
