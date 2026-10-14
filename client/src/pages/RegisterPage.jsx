import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, AlertTriangle, Building, GraduationCap, Sparkles, CheckCircle2, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { register } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [academicYear, setAcademicYear] = useState('2nd Year');
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const redirectTarget = location.state?.from?.pathname;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const newUser = await register({
        email,
        password,
        department,
        academicYear,
        role,
      });

      const destination =
        redirectTarget ||
        (newUser.role === 'moderator' ? '/moderator' : newUser.role === 'admin' ? '/admin' : '/feed');
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-12rem)] flex items-center justify-center px-4 py-16">
      {/* Radiant Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-cyan-500/15 via-emerald-500/10 to-violet-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center space-y-2.5">
          <div className="relative inline-block">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-400 via-teal-400 to-emerald-400 flex items-center justify-center shadow-glow-cyan mx-auto transform transition-transform hover:scale-105">
              <Shield className="w-7 h-7 text-slate-950 stroke-[2.5]" />
            </div>
            <div className="absolute -inset-1 bg-cyan-400/20 rounded-2xl blur-sm -z-10 animate-pulse" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white font-display">
            Create Campus <span className="text-gradient-aurora">Passport</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto font-medium">
            Your university email is verified strictly for anti-spam. Your posts remain completely pseudonymous.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2.5 shadow-lg shadow-rose-950/30 animate-shake">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="glass-slab rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="register-email" className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              University Email Address <span className="text-emerald-400">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="register-email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="student.name@campus.edu"
                className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-slate-950/80 border border-white/10 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50 transition-all font-medium"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="register-password" className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Password (min 8 characters) <span className="text-emerald-400">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="register-password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Choose a strong password"
                className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-slate-950/80 border border-white/10 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50 transition-all font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label htmlFor="register-department" className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Department</label>
              <select
                id="register-department"
                name="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-3 rounded-xl bg-slate-950/80 border border-white/10 text-xs text-slate-100 focus:outline-none focus:border-emerald-400"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Electrical Engineering">Electrical Engineering</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="Bioengineering">Bioengineering</option>
                <option value="Business & Finance">Business & Finance</option>
                <option value="Humanities & Arts">Humanities & Arts</option>
                <option value="General Campus">General Campus</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="register-year" className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Academic Level</label>
              <select
                id="register-year"
                name="academicYear"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full px-3 py-3 rounded-xl bg-slate-950/80 border border-white/10 text-xs text-slate-100 focus:outline-none focus:border-emerald-400"
              >
                <option value="1st Year">1st Year (Freshman)</option>
                <option value="2nd Year">2nd Year (Sophomore)</option>
                <option value="3rd Year">3rd Year (Junior)</option>
                <option value="4th Year">4th Year (Senior)</option>
                <option value="Graduate">Graduate / Master's</option>
                <option value="Staff">Faculty / Staff</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Select Registration Role</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'student', label: 'Student', icon: '🎓' },
                { id: 'moderator', label: 'Moderator', icon: '🛡️' },
                { id: 'admin', label: 'Admin', icon: '👑' },
              ].map((r) => (
                <button
                  type="button"
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    role === r.id
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-glow-mint/30'
                      : 'bg-slate-900/60 border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>{r.icon}</span>
                  <span>{r.label}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            id="register-submit-btn"
            disabled={loading}
            className="w-full py-3.5 rounded-xl text-xs sm:text-sm font-bold text-slate-950 btn-primary-vibrant disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-3 shadow-glow-mint"
          >
            <span>{loading ? 'Initializing Account...' : 'Complete Registration & Enter'}</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span>Already have an account?</span>
            <Link to="/login" className="text-emerald-400 font-bold hover:text-emerald-300 hover:underline transition-colors">
              Sign In Instead &rarr;
            </Link>
          </div>
        </form>

        {/* Security Disclaimers */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/5 space-y-2 text-xs text-slate-400">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px] uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Identity Severance Guarantee</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-400">
            Your university email address is securely salted with bcrypt and kept in an isolated authentication table. It is mathematically severed from your authored discussions, comments, and votes.
          </p>
        </div>
      </div>
    </div>
  );
}
