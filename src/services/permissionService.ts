import { getUserRole } from './authService';

/**
 * 사용자가 관리자인지 확인
 */
export const checkIsAdmin = async (userId: string): Promise<boolean> => {
  const role = await getUserRole(userId);
  return role === 'admin';
};

/**
 * 관리자 권한 확인 및 오류 발생
 * 백엔드 검증용
 */
export const requireAdmin = async (userId: string): Promise<void> => {
  const isAdmin = await checkIsAdmin(userId);
  if (!isAdmin) {
    throw new Error('관리자 권한이 필요합니다.');
  }
};

/**
 * 특정 작업에 대한 권한 확인 함수들
 */
export const Permissions = {
  // 공지사항 권한
  canCreateNotice: async (userId: string) => checkIsAdmin(userId),
  canEditNotice: async (userId: string) => checkIsAdmin(userId),
  canDeleteNotice: async (userId: string) => checkIsAdmin(userId),

  // 자리 배치 권한
  canConfigureSeating: async (userId: string) => checkIsAdmin(userId),
  canGenerateSeating: async (userId: string) => checkIsAdmin(userId),

  // 건의사항 권한
  canViewAllSuggestions: async (userId: string) => checkIsAdmin(userId),
  canUpdateSuggestionStatus: async (userId: string) => checkIsAdmin(userId),
  canAddAdminNote: async (userId: string) => checkIsAdmin(userId),

  // 사용자 관리 권한
  canManageUsers: async (userId: string) => checkIsAdmin(userId),
  canUpdateUserRole: async (userId: string) => checkIsAdmin(userId),
};
