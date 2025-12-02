import type { Notice } from '@/types';
import { supabase } from '@/config/supabase';

// 공지사항 목록 가져오기
export const getNotices = async (): Promise<Notice[]> => {
  const { data, error } = await supabase
    .from('notices')
    .select(`
      id,
      title,
      content,
      created_at,
      is_pinned,
      is_important,
      author_id,
      users:author_id (
        name,
        email
      )
    `)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching notices:', error);
    throw error;
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    title: row.title,
    content: row.content,
    author: row.users?.name || row.users?.email || 'Unknown',
    createdAt: new Date(row.created_at),
    isPinned: row.is_pinned,
    isImportant: row.is_important
  }));
};

// 공지사항 상세 가져오기
export const getNotice = async (id: string): Promise<Notice | null> => {
  const { data, error } = await supabase
    .from('notices')
    .select(`
      id,
      title,
      content,
      created_at,
      is_pinned,
      is_important,
      author_id,
      users:author_id (
        name,
        email
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Not found
      return null;
    }
    console.error('Error fetching notice:', error);
    throw error;
  }

  if (!data) return null;

  const row: any = data;
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    author: row.users?.name || row.users?.email || 'Unknown',
    createdAt: new Date(row.created_at),
    isPinned: row.is_pinned,
    isImportant: row.is_important
  };
};

// 공지사항 작성
export const createNotice = async (notice: Omit<Notice, 'id'>): Promise<string> => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User must be authenticated to create a notice');
  }

  const { data, error } = await supabase
    .from('notices')
    .insert({
      title: notice.title,
      content: notice.content,
      author_id: user.id,
      is_pinned: notice.isPinned,
      is_important: notice.isImportant
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating notice:', error);
    throw error;
  }

  return data.id;
};

// 공지사항 수정
export const updateNotice = async (id: string, notice: Partial<Omit<Notice, 'id'>>): Promise<void> => {
  const updateData: any = {};

  if (notice.title !== undefined) updateData.title = notice.title;
  if (notice.content !== undefined) updateData.content = notice.content;
  if (notice.isPinned !== undefined) updateData.is_pinned = notice.isPinned;
  if (notice.isImportant !== undefined) updateData.is_important = notice.isImportant;

  const { error } = await supabase
    .from('notices')
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error('Error updating notice:', error);
    throw error;
  }
};

// 공지사항 삭제
export const deleteNotice = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('notices')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting notice:', error);
    throw error;
  }
};
