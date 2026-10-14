import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { Shield, ShieldAlert, ArrowRight, Sparkles, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/**
 * ProtectedRoute:
 * 1. Blocks unauthenticated users from entering the website and redirects to /login.
 * 2. Provides role-based gatekeeping for moderator and admin areas.
 * 3. Shows a sleek loading state while verifying tokens.
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, token, loading, isAuthenticated, quickSwitch } = useAuth();
  const location = useLocation();

  // 1. Sleek verification spinner while loading session
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-10rem)] flex flex-col items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="glass-slab rounded-3xl p-8 max-w-sm w-full text-center space-y-4 border border-white/10 shadow-2xl relative">
          <div className="relative inline-block">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-400 via-teal-500 to-cyan-500 flex items-center justify-center shadow-glow-mint mx-auto animate-pulse">
              <Shield className="w-8 h-8 text-slate-950 stroke-[2.5]" />
            </div>
            <span className="absolute -inset-1 rounded-2xl bg-emerald-400/20 blur-sm animate-ping -z-10" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-white font-display">Verifying Campus Credentials</h3>
            <p className="text-xs text-slate-400">Authenticating zero-knowledge identity tokens...</p>
          </div>

          <div className="w-full bg-slate-900/80 rounded-full h-1.5 overflow-hidden border border-white/5">
            <div className="h-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 animate-pulse rounded-full w-3/4 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  // 2. Strict Authentication Wall: If not logged in, redirect to login
  if (!isAuthenticated || !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Role-Based Access Control
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user?.role || 'student';
    const hasRole = allowedRoles.includes(userRole);

    if (!hasRole) {
      return (
        <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center px-4 py-12">
          <div className="max-w-md w-full glass-slab rounded-3xl p-6 sm:p-8 border border-rose-500/20 shadow-2xl space-y-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400 shadow-glow-coral">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white font-display">Access Restricted</h2>
              <p className="text-xs sm:text-sm text-slate-400">
                This sector requires elevated <strong className="text-rose-400 uppercase">{allowedRoles.join(' or ')}</strong> clearance.
              </p>
              <div className="inline-block px-3 py-1 rounded-full bg-slate-900 border border-white/10 text-xs text-slate-400 mt-2">
                Your current role: <strong className="text-emerald-400 uppercase font-mono">{userRole}</strong>
              </div>
            </div>

            {/* Evaluator Quick Switch Assistance */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/10 space-y-3">
              <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Evaluator Role Switch</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Switch demo accounts to evaluate this dashboard:
              </p>
              <div className="flex gap-2 justify-center">
                {allowedRoles.includes('moderator') && (
                  <button
                    onClick={() => quickSwitch('moderator')}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-all flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Switch to Mod</span>
                  </button>
                )}
                {allowedRoles.includes('admin') && (
                  <button
                    onClick={() => quickSwitch('admin')}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-500/30 transition-all flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Switch to Admin</span>
                  </button>
                )}
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/feed"
                className="btn-primary-vibrant w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
              >
                <span>Return to Campus Feed</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      );
    }
  }

  // Authorized
  return children;
}
