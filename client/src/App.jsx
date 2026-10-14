import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

// Pages
import LandingPage from './pages/LandingPage';
import FeedPage from './pages/FeedPage';
import PostDetailPage from './pages/PostDetailPage';
import CreatePostPage from './pages/CreatePostPage';
import CategoriesPage from './pages/CategoriesPage';
import SearchPage from './pages/SearchPage';
import PrivacyCenterPage from './pages/PrivacyCenterPage';
import GuidelinesPage from './pages/GuidelinesPage';
import ReportIssuePage from './pages/ReportIssuePage';
import ModeratorDashboardPage from './pages/ModeratorDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Route Guards
import ProtectedRoute from './components/common/ProtectedRoute';
import PublicOnlyRoute from './components/common/PublicOnlyRoute';

// Scroll to top helper on navigation
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <div className="flex flex-col min-h-screen bg-[#070b13] text-slate-100 selection:bg-emerald-500 selection:text-slate-950">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public Authentication Pages (Only for unauthenticated users) */}
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <LoginPage />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicOnlyRoute>
                <RegisterPage />
              </PublicOnlyRoute>
            }
          />

          {/* Informational About / Overview Page */}
          <Route path="/about" element={<LandingPage />} />

          {/* Root Entry: Requires login. If unauthenticated, redirected to /login immediately */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <FeedPage />
              </ProtectedRoute>
            }
          />

          {/* Protected Application Routes: STRICT LOGIN REQUIRED */}
          <Route
            path="/feed"
            element={
              <ProtectedRoute>
                <FeedPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/post/:id"
            element={
              <ProtectedRoute>
                <PostDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create"
            element={
              <ProtectedRoute>
                <CreatePostPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/categories"
            element={
              <ProtectedRoute>
                <CategoriesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/search"
            element={
              <ProtectedRoute>
                <SearchPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/privacy"
            element={
              <ProtectedRoute>
                <PrivacyCenterPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/guidelines"
            element={
              <ProtectedRoute>
                <GuidelinesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/report-issue"
            element={
              <ProtectedRoute>
                <ReportIssuePage />
              </ProtectedRoute>
            }
          />

          {/* Role-Restricted Protected Routes */}
          <Route
            path="/moderator"
            element={
              <ProtectedRoute allowedRoles={['moderator', 'admin']}>
                <ModeratorDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Catch-all fallback: Protected */}
          <Route
            path="*"
            element={
              <ProtectedRoute>
                <FeedPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
