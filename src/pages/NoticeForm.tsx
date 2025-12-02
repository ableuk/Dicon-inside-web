import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Notice } from '@/types';
import { getNotice, createNotice, updateNotice } from '@/services/noticeService';
import { useAuth } from '@/contexts/AuthContext';

const NoticeForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const isEditMode = !!id;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [isImportant, setIsImportant] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      alert('관리자 권한이 필요합니다.');
      navigate('/notices');
    }
  }, [isAdmin, navigate]);

  useEffect(() => {
    if (isEditMode && id) {
      loadNotice();
    }
  }, [id, isEditMode]);

  const loadNotice = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const notice = await getNotice(id);
      if (notice) {
        setTitle(notice.title);
        setContent(notice.content);
        setIsPinned(notice.isPinned);
        setIsImportant(notice.isImportant);
      }
    } catch (error) {
      console.error('Failed to load notice:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }

    try {
      setLoading(true);

      if (isEditMode && id) {
        await updateNotice(id, {
          title,
          content,
          isPinned,
          isImportant
        });
        alert('공지사항이 수정되었습니다.');
        navigate(`/notices/${id}`);
      } else {
        const newNotice: Omit<Notice, 'id'> = {
          title,
          content,
          author: user?.name || user?.email || 'Unknown', // This will be replaced by join in service
          createdAt: new Date(),
          isPinned,
          isImportant
        };
        const newId = await createNotice(newNotice);
        alert('공지사항이 작성되었습니다.');
        navigate(`/notices/${newId}`);
      }
    } catch (error) {
      console.error('Failed to save notice:', error);
      alert('공지사항 저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-slate-900 p-8">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <Link
            to={isEditMode ? `/notices/${id}` : '/notices'}
            className="text-white hover:text-purple-300 transition-colors"
          >
            ← {isEditMode ? '상세보기로 돌아가기' : '목록으로 돌아가기'}
          </Link>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-white mb-8">
            {isEditMode ? '공지사항 수정' : '공지사항 작성'}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white mb-2">제목</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white/10 text-white border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
                placeholder="공지사항 제목을 입력하세요"
                required
              />
            </div>

            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="w-5 h-5 accent-purple-600"
                />
                <span className="text-white">상단 고정</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isImportant}
                  onChange={(e) => setIsImportant(e.target.checked)}
                  className="w-5 h-5 accent-red-600"
                />
                <span className="text-white">중요 공지</span>
              </label>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-white">내용 (마크다운 지원)</label>
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="text-purple-300 hover:text-purple-200 text-sm transition-colors"
                >
                  {showPreview ? '편집 모드' : '미리보기 모드'}
                </button>
              </div>

              {showPreview ? (
                <div className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 min-h-[400px] prose prose-invert max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ children }) => (
                        <h1 className="text-2xl font-bold text-white mb-3 mt-4">{children}</h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-xl font-bold text-white mb-2 mt-3">{children}</h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-lg font-bold text-white mb-2 mt-2">{children}</h3>
                      ),
                      p: ({ children }) => (
                        <p className="text-white/90 mb-3 leading-relaxed">{children}</p>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc list-inside text-white/90 mb-3 space-y-1">{children}</ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal list-inside text-white/90 mb-3 space-y-1">{children}</ol>
                      ),
                      strong: ({ children }) => (
                        <strong className="text-white font-bold">{children}</strong>
                      ),
                      code: ({ children }) => (
                        <code className="bg-white/10 px-2 py-1 rounded text-purple-300">{children}</code>
                      ),
                    }}
                  >
                    {content || '*내용을 입력하면 여기에 미리보기가 표시됩니다.*'}
                  </ReactMarkdown>
                </div>
              ) : (
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-white/10 text-white border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 min-h-[400px] font-mono"
                  placeholder="공지사항 내용을 입력하세요. 마크다운 문법을 사용할 수 있습니다."
                  required
                />
              )}

              <div className="mt-2 text-sm text-white/60">
                <p>마크다운 문법 팁:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li># 제목1, ## 제목2, ### 제목3</li>
                  <li>**굵게**, *기울임*</li>
                  <li>- 목록 항목 또는 1. 번호 목록</li>
                  <li>`코드`</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-4 justify-end">
              <Link
                to={isEditMode ? `/notices/${id}` : '/notices'}
                className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
              >
                취소
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '저장 중...' : isEditMode ? '수정하기' : '작성하기'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NoticeForm;
