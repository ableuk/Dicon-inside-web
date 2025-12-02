// 밥.net API 타입 정의

export interface MealData {
  date: string;
  breakfast?: string[];
  lunch?: string[];
  dinner?: string[];
}

export interface MealResponse {
  success: boolean;
  data?: MealData;
  error?: string;
  message?: string;
}

export interface MealSearchResponse {
  success: boolean;
  foodName: string;
  imageUrl?: string;
  description?: string;
  error?: string;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner';

export interface MealTypeInfo {
  type: MealType;
  label: string;
  emoji: string;
}
