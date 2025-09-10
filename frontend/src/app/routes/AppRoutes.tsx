import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { Layout } from '@/shared/components/Layout';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { WeatherPage } from '@/features/weather/pages/WeatherPage';
import { HistoryPage } from '@/features/history/pages/HistoryPage';

export function AppRoutes() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
        }
      />
      <Route
        path="/register"
        element={
          isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<WeatherPage />} />
        <Route path="history" element={<HistoryPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
