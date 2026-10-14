import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, AlertTriangle, Sparkles, CheckCircle2, KeyRound, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, quickSwitch } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Destination to return after authenticating
  const redirectTarget = location.state?.from?.pathname;

  const navigateAfterAuth = (user) => {
    if (redirectTarget && redirectTarget !== '/login' && redirectTarget !== '/') {
      navigate(redirectTarget, { replace: true });
    } else if (user.role === 'moderator') {
      navigate('/moderator', { replace: true });
    } else if (user.role === 'admin') {
      navigate('/admin', { replace: true });
    } else {
      navigate('/feed', { replace: true });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const loggedUser = await login(email, password);
      navigateAfterAuth(loggedUser);
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role) => {
    try {
      setLoading(true);
      setError('');
      const loggedUser = await quickSwitch(role);
      navigateAfterAuth(loggedUser);
    } catch (err) {
      setError(err.message || 'Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-12rem)] flex items-center justify-center px-4 py-16">
      {/* Radiant Background Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-emerald-500/15 via-cyan-500/10 to-violet-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="w-full max-w-md space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2.5">
          <div className="relative inline-block">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-400 via-teal-400 to-cyan-500 flex items-center justify-center shadow-glow-mint mx-auto transform transition-transform hover:scale-105">
              <Shield className="w-7 h-7 text-slate-950 stroke-[2.5]" />
            </div>
            <div className="absolute -inset-1 bg-emerald-400/20 rounded-2xl blur-sm -z-10 animate-pulse" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white font-display">
            Welcome to <span className="text-gradient-aurora">CampusVoice</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium">
            Sign in to enter the anonymous campus community, submit grievances, and vote.
          </p>
        </div>

        {/* Redirect Notice if user was stopped from entering protected route */}
        {redirectTarget && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-center gap-2.5 shadow-lg shadow-amber-950/20 animate-in fade-in">
            <Info className="w-4 h-4 shrink-0 text-amber-400" />
            <div>
              <span className="font-bold">Login required to enter:</span> Please sign in below or select a 1-click evaluator role to continue.
            </div>
          </div>
        )}

        {/* 1-Click Evaluator Login Pill Tray */}
        <div className="glass-slab rounded-2xl p-4 space-y-2.5 border border-white/10 shadow-glass-slab">
          <div className="text-[11px] font-bold text-slate-300 flex items-center justify-between tracking-wide">
            <span className="flex items-center gap-1.5 text-emerald-400 uppercase">
              <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
              <span>1-Click Evaluator Roles</span>
            </span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[10px] font-mono font-bold">
              INSTANT ENTRY
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              id="quick-login-student"
              onClick={() => handleQuickDemo('student')}
              disabled={loading}
              className="group relative px-2.5 py-2.5 rounded-xl text-xs font-bold bg-slate-900/90 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:border-emerald-400/60 shadow-sm transition-all duration-200 flex flex-col items-center gap-1 disabled:opacity-50"
            >
              <span className="text-base group-hover:scale-110 transition-transform">🎓</span>
              <span>Student</span>
            </button>
            <button
              type="button"
              id="quick-login-moderator"
              onClick={() => handleQuickDemo('moderator')}
              disabled={loading}
              className="group relative px-2.5 py-2.5 rounded-xl text-xs font-bold bg-slate-900/90 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:border-amber-400/60 shadow-sm transition-all duration-200 flex flex-col items-center gap-1 disabled:opacity-50"
            >
              <span className="text-base group-hover:scale-110 transition-transform">🛡️</span>
              <span>Moderator</span>
            </button>
            <button
              type="button"
              id="quick-login-admin"
              onClick={() => handleQuickDemo('admin')}
              disabled={loading}
              className="group relative px-2.5 py-2.5 rounded-xl text-xs font-bold bg-slate-900/90 hover:bg-violet-500/20 text-violet-300 border border-violet-500/30 hover:border-violet-400/60 shadow-sm transition-all duration-200 flex flex-col items-center gap-1 disabled:opacity-50"
            >
              <span className="text-base group-hover:scale-110 transition-transform">👑</span>
              <span>Admin</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2.5 shadow-lg shadow-rose-950/30 animate-shake">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="glass-slab rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="login-email" className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              University Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="student@campus.edu"
                className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-slate-950/80 border border-white/10 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50 transition-all font-medium"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="login-password" className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Password
              </label>
              <span className="text-[11px] text-slate-500 font-mono">Demo: Password123!</span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••••••"
                className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-slate-950/80 border border-white/10 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50 transition-all font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            id="login-submit-btn"
            disabled={loading}
            className="w-full py-3.5 rounded-xl text-xs sm:text-sm font-bold text-slate-950 btn-primary-vibrant disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-2 shadow-glow-mint"
          >
            <span>{loading ? 'Verifying Credentials...' : 'Sign In & Enter'}</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>

          {/* Privacy & Register Footnotes */}
          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
            <span>Don't have an account?</span>
            <Link to="/register" className="text-emerald-400 font-bold hover:text-emerald-300 hover:underline transition-colors">
              Create student account &rarr;
            </Link>
          </div>
        </form>

        {/* Security Assurances */}
        <div className="flex items-center justify-center gap-6 text-[11px] text-slate-500 font-medium">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>256-bit Identity Shrouding</span>
          </span>
          <span className="flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
            <span>No Plaintext Credentials</span>
          </span>
        </div>
      </div>
    </div>
  );
}
