import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Mandi from './pages/Mandi';
import Advisory from './pages/Advisory';
import Weather from './pages/Weather';
import Market from './pages/Market';
import Profile from './pages/Profile';
import { useAuthStore } from './store/authStore';

function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const { phone, onboarded } = useAuthStore();
  if (!phone) return <Navigate to="/login" replace />;
  if (!onboarded) return <Navigate to="/onboarding" replace />;
  return children;
}

export default function App() {
  const { i18n } = useTranslation();
  const language = useAuthStore((s) => s.language);

  useEffect(() => {
    if (language && i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [language, i18n]);

  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          style: { fontSize: 14, borderRadius: 12 },
        }}
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mandi"
          element={
            <ProtectedRoute>
              <Mandi />
            </ProtectedRoute>
          }
        />
        <Route
          path="/advisory"
          element={
            <ProtectedRoute>
              <Advisory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/weather"
          element={
            <ProtectedRoute>
              <Weather />
            </ProtectedRoute>
          }
        />
        <Route
          path="/market"
          element={
            <ProtectedRoute>
              <Market />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
