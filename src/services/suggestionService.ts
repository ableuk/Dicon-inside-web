import type { Suggestion, SuggestionCategory, SuggestionStatus } from '@/types';
import { supabase } from '@/config/supabase';

// 모든 건의사항 가져오기 (관리자용 - RLS가 자동으로 처리)
export const getAllSuggestions = async (): Promise<Suggestion[]> => {
  const { data, error } = await supabase
    .from('suggestions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching suggestions:', error);
    throw error;
  }

  return (data || []).map(row => ({
    id: row.id,
    category: row.category as SuggestionCategory,
    title: row.title,
    content: row.content,
    status: row.status as SuggestionStatus,
    createdAt: new Date(row.created_at),
    adminNote: row.admin_note,
    userId: row.user_id
  }));
};

// 사용자별 건의사항 가져오기 (학생용)
export const getUserSuggestions = async (userId: string): Promise<Suggestion[]> => {
  const { data, error } = await supabase
    .from('suggestions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user suggestions:', error);
    throw error;
  }

  return (data || []).map(row => ({
    id: row.id,
    category: row.category as SuggestionCategory,
    title: row.title,
    content: row.content,
    status: row.status as SuggestionStatus,
    createdAt: new Date(row.created_at),
    adminNote: row.admin_note,
    userId: row.user_id
  }));
};

// 건의사항 상세 가져오기
export const getSuggestion = async (id: string): Promise<Suggestion | null> => {
  const { data, error } = await supabase
    .from('suggestions')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Not found
      return null;
    }
    console.error('Error fetching suggestion:', error);
    throw error;
  }

  if (!data) return null;

  return {
    id: data.id,
    category: data.category as SuggestionCategory,
    title: data.title,
    content: data.content,
    status: data.status as SuggestionStatus,
    createdAt: new Date(data.created_at),
    adminNote: data.admin_note,
    userId: data.user_id
  };
};

// 건의사항 작성
export const createSuggestion = async (
  suggestion: Omit<Suggestion, 'id'>
): Promise<string> => {
  if (!suggestion.userId) {
    throw new Error('User ID is required to create a suggestion');
  }

  const { data, error } = await supabase
    .from('suggestions')
    .insert({
      category: suggestion.category,
      title: suggestion.title,
      content: suggestion.content,
      status: suggestion.status || 'pending',
      user_id: suggestion.userId
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating suggestion:', error);
    throw error;
  }

  return data.id;
};

// 건의사항 상태 변경 (관리자용)
export const updateSuggestionStatus = async (
  id: string,
  status: SuggestionStatus,
  adminNote?: string
): Promise<void> => {
  const updateData: any = { status };

  if (adminNote !== undefined) {
    updateData.admin_note = adminNote;
  }

  const { error } = await supabase
    .from('suggestions')
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error('Error updating suggestion status:', error);
    throw error;
  }
};

// 상태별 건의사항 필터링 (클라이언트 측)
export const filterSuggestionsByStatus = (
  suggestions: Suggestion[],
  status?: SuggestionStatus
): Suggestion[] => {
  if (!status) return suggestions;
  return suggestions.filter(s => s.status === status);
};

// 카테고리별 건의사항 필터링 (클라이언트 측)
export const filterSuggestionsByCategory = (
  suggestions: Suggestion[],
  category?: SuggestionCategory
): Suggestion[] => {
  if (!category) return suggestions;
  return suggestions.filter(s => s.category === category);
};

// 건의사항 검색 (클라이언트 측)
export const searchSuggestions = (
  suggestions: Suggestion[],
  searchTerm: string
): Suggestion[] => {
  if (!searchTerm.trim()) return suggestions;
  const term = searchTerm.toLowerCase();
  return suggestions.filter(
    s => s.title.toLowerCase().includes(term) || s.content.toLowerCase().includes(term)
  );
};
