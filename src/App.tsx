import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Seats from './pages/Seats';
import RandomPicker from './pages/RandomPicker';
import Meals from './pages/Meals';
import NoticeList from './pages/NoticeList';
import NoticeDetail from './pages/NoticeDetail';
import NoticeForm from './pages/NoticeForm';
import Suggestions from './pages/Suggestions';
import UserManagement from './pages/UserManagement';
import LoginPage from './pages/LoginPage';
import AuthCallbackPage from './pages/AuthCallbackPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* 공개 라우트 */}
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* 보호된 라우트 */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Navigate to="/meals" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seats"
            element={
              <ProtectedRoute>
                <Seats />
              </ProtectedRoute>
            }
          />
          <Route
            path="/random"
            element={
              <ProtectedRoute>
                <RandomPicker />
              </ProtectedRoute>
            }
          />
          <Route
            path="/meals"
            element={
              <ProtectedRoute>
                <Meals />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notices"
            element={
              <ProtectedRoute>
                <NoticeList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notices/new"
            element={
              <ProtectedRoute>
                <NoticeForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notices/:id"
            element={
              <ProtectedRoute>
                <NoticeDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notices/:id/edit"
            element={
              <ProtectedRoute>
                <NoticeForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/suggestions"
            element={
              <ProtectedRoute>
                <Suggestions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <UserManagement />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
