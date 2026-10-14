import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/**
 * PublicOnlyRoute:
 * Restricts access to guests/unauthenticated visitors (e.g. /login and /register).
 * If the user is already authenticated, redirects them into the main app.
 */
export default function PublicOnlyRoute({ children }) {
  const { user, token, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-10rem)] flex flex-col items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="glass-slab rounded-3xl p-8 max-w-sm w-full text-center space-y-4 border border-white/10 shadow-2xl relative">
          <div className="relative inline-block">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-400 via-teal-500 to-cyan-500 flex items-center justify-center shadow-glow-mint mx-auto animate-pulse">
              <Shield className="w-8 h-8 text-slate-950 stroke-[2.5]" />
            </div>
          </div>
          <p className="text-xs text-slate-400">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && token) {
    const destination =
      location.state?.from?.pathname ||
      (user?.role === 'moderator' ? '/moderator' : user?.role === 'admin' ? '/admin' : '/feed');
    return <Navigate to={destination} replace />;
  }

  return children;
}
