import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import PageShell from './components/layout/PageShell';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import ShowDetailPage from './pages/ShowDetailPage';
import LibraryPage from './pages/LibraryPage';
import ListsPage from './pages/ListsPage';
import ListDetailPage from './pages/ListDetailPage';
import UpcomingPage from './pages/UpcomingPage';
import StatsPage from './pages/StatsPage';
import ProfilePage from './pages/ProfilePage';
import MoviesPage from './pages/MoviesPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div style={{ background: '#000', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          {/* TV Time style loader: yellow spinner */}
          <div style={{
            width: 40, height: 40,
            border: '3px solid rgba(245,197,24,0.2)',
            borderTopColor: '#F5C518',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: '#888', fontSize: 13 }}>Loading...</p>
        </div>
      </div>
    );
  }
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <PageShell>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/explore" element={<SearchPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/show/:id" element={<ShowDetailPage />} />
                <Route path="/library" element={<LibraryPage />} />
                <Route path="/lists" element={<ListsPage />} />
                <Route path="/lists/:id" element={<ListDetailPage />} />
                <Route path="/upcoming" element={<UpcomingPage />} />
                <Route path="/stats" element={<StatsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/movies" element={<MoviesPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </PageShell>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 2500,
              style: {
                background: '#1a1a1a',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                fontSize: '14px',
                maxWidth: 380,
              },
              success: { iconTheme: { primary: '#4CAF50', secondary: '#1a1a1a' } },
              error: { iconTheme: { primary: '#E53935', secondary: '#1a1a1a' } },
            }}
          />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
