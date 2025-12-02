import StudentSuggestions from './StudentSuggestions';
import AdminSuggestions from './AdminSuggestions';
import { useAuth } from '@/contexts/AuthContext';

const Suggestions = () => {
  const { isAdmin } = useAuth();

  return (
    <div className="relative">
      {/* 역할에 따라 다른 페이지 렌더링 */}
      {isAdmin ? <AdminSuggestions /> : <StudentSuggestions />}
    </div>
  );
};

export default Suggestions;
