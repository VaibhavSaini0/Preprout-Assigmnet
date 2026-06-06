import { Routes, Route, Navigate } from 'react-router-dom';
import { useTestContext } from './context/TestContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CreateTestPage from './pages/CreateTestPage';
import TestViewPage from './pages/TestViewPage';
import ConfirmationPage from './pages/ConfirmationPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useTestContext();
  
  // If not authenticated, redirect to login
  if (!token && !localStorage.getItem('preproute_token')) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

export default function App() {
  const { token } = useTestContext();
  const isLoggedIn = token || localStorage.getItem('preproute_token');

  return (
    <Routes>
      <Route path="/login" element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/create-test"
        element={
          <ProtectedRoute>
            <CreateTestPage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/edit-test/:id"
        element={
          <ProtectedRoute>
            <CreateTestPage />
          </ProtectedRoute>
        }
      />
      
      <Route path="/test-view" element={<Navigate to="/dashboard" replace />} />
      
      <Route
        path="/test-view/:id"
        element={
          <ProtectedRoute>
            <TestViewPage />
          </ProtectedRoute>
        }
      />
      
      <Route path="/confirmation" element={<Navigate to="/dashboard" replace />} />

      <Route
        path="/confirmation/:id"
        element={
          <ProtectedRoute>
            <ConfirmationPage />
          </ProtectedRoute>
        }
      />
      
      <Route path="/" element={<Navigate to={isLoggedIn ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
}

