import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Notice } from '@/types';
import { getNotice, deleteNotice } from '@/services/noticeService';
import { useAuth } from '@/contexts/AuthContext';

const NoticeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    loadNotice();
  }, [id]);

  const loadNotice = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const data = await getNotice(id);
      setNotice(data);
    } catch (error) {
      console.error('Failed to load notice:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    try {
      await deleteNotice(id);
      navigate('/notices');
    } catch (error) {
      console.error('Failed to delete notice:', error);
      alert('공지사항 삭제에 실패했습니다.');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-slate-900 p-8">
        <div className="container mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 text-center">
            <p className="text-white/60">로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!notice) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-slate-900 p-8">
        <div className="container mx-auto">
          <div className="mb-8">
            <Link to="/notices" className="text-white hover:text-purple-300 transition-colors">
              ← 목록으로 돌아가기
            </Link>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 text-center">
            <p className="text-white/60">공지사항을 찾을 수 없습니다.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-slate-900 p-8">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8 flex justify-between items-center">
          <Link to="/notices" className="text-white hover:text-purple-300 transition-colors">
            ← 목록으로 돌아가기
          </Link>
          {isAdmin && (
            <div className="flex gap-2">
              <Link
                to={`/notices/${id}/edit`}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                수정
              </Link>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                삭제
              </button>
            </div>
          )}
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8">
          <div className="mb-6 pb-6 border-b border-white/20">
            <div className="flex items-center gap-2 mb-4">
              {notice.isPinned && (
                <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded">
                  고정
                </span>
              )}
              {notice.isImportant && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                  중요
                </span>
              )}
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">{notice.title}</h1>
            <div className="flex items-center gap-4 text-sm text-white/60">
              <span>{notice.author}</span>
              <span>•</span>
              <span>{formatDate(notice.createdAt)}</span>
            </div>
          </div>

          <div className="prose prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1 className="text-3xl font-bold text-white mb-4 mt-6">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-2xl font-bold text-white mb-3 mt-5">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-xl font-bold text-white mb-2 mt-4">{children}</h3>
                ),
                p: ({ children }) => (
                  <p className="text-white/90 mb-4 leading-relaxed">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside text-white/90 mb-4 space-y-2">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside text-white/90 mb-4 space-y-2">{children}</ol>
                ),
                li: ({ children }) => (
                  <li className="text-white/90">{children}</li>
                ),
                strong: ({ children }) => (
                  <strong className="text-white font-bold">{children}</strong>
                ),
                code: ({ children }) => (
                  <code className="bg-white/10 px-2 py-1 rounded text-purple-300">{children}</code>
                ),
                pre: ({ children }) => (
                  <pre className="bg-white/10 p-4 rounded-lg overflow-x-auto mb-4">{children}</pre>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-purple-500 pl-4 italic text-white/80 mb-4">
                    {children}
                  </blockquote>
                ),
              }}
            >
              {notice.content}
            </ReactMarkdown>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-white mb-4">공지사항 삭제</h2>
            <p className="text-white/80 mb-6">
              정말로 이 공지사항을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoticeDetail;
