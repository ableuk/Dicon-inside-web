// 기본 타입 정의

export interface Student {
  id: string;
  name: string;
  number: number;
  seat?: number;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: Date;
  isPinned: boolean;
  isImportant: boolean;
}

export type SuggestionCategory = '시설' | '급식' | '수업' | '기타';
export type SuggestionStatus = 'pending' | 'reviewed';

export interface Suggestion {
  id: string;
  category: SuggestionCategory;
  title: string;
  content: string;
  status: SuggestionStatus;
  createdAt: Date;
  adminNote?: string;
  userId?: string; // 작성자 식별용 (익명이지만 본인 건의사항 확인용)
}

export interface Meal {
  id: string;
  date: string;
  breakfast: string[];
  lunch: string[];
  dinner: string[];
}

export interface SeatMap {
  id: string;
  rows: number;
  cols: number;
  seats: (Student | null)[][];
  createdAt: Date;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  role: 'student' | 'admin';
  created_at: Date;
}

export interface RandomPickerConfig {
  pickCount: number;      // 뽑을 개수
  minRange: number;       // 최소값
  maxRange: number;       // 최대값
}

export interface RandomPickerResult {
  id: string;            // 타임스탬프 기반 ID
  config: RandomPickerConfig;
  picks: number[];       // 뽑힌 숫자 배열 (정렬됨)
  generatedAt: Date;
}

export interface RandomPickerHistory {
  results: RandomPickerResult[];
  maxHistorySize: number; // 기본값: 10
}
