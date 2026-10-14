import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Shield,
  Plus,
  Search,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  BarChart3,
  Sparkles,
  ChevronDown,
  AlertOctagon,
  Flame,
  Info,
  User,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, logout, quickSwitch, isModerator, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleRoleSwitch = async (targetRole) => {
    setRoleDropdownOpen(false);
    await quickSwitch(targetRole);
    if (targetRole === 'moderator') navigate('/moderator');
    else if (targetRole === 'admin') navigate('/admin');
    else navigate('/feed');
  };

  const navLinks = [
    { name: 'Feed', path: '/feed', icon: Flame },
    { name: 'Categories', path: '/categories' },
    { name: 'Search', path: '/search' },
    { name: 'Guidelines', path: '/guidelines' },
    { name: 'Privacy Center', path: '/privacy' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full px-4 sm:px-6 lg:px-8 pt-3 pb-2">
      <div className="max-w-7xl mx-auto">
        <div className="glass-slab rounded-2xl px-4 sm:px-6 h-16 flex items-center justify-between border border-white/10 shadow-2xl relative">
          {/* Subtle Top Glow Line */}
          <div className="absolute -top-[1px] left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/80 to-transparent" />

          {/* Left: Brand Logo */}
          <div className="flex items-center gap-8">
            <Link to={isAuthenticated ? '/feed' : '/login'} className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 flex items-center justify-center shadow-glow-mint group-hover:scale-105 transition-all duration-300">
                  <Shield className="w-5 h-5 text-slate-950 stroke-[2.8]" />
                </div>
                {isAuthenticated && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-slate-950 rounded-full animate-pulse" />
                )}
              </div>

              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-white font-display flex items-center gap-0.5">
                  Campus<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Voice</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400/80 -mt-1 font-mono">
                  Anonymous Campus Pulse
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links (Only shown when authenticated) */}
            {isAuthenticated && (
              <nav className="hidden lg:flex items-center gap-1">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`relative px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                        isActive
                          ? 'text-white bg-white/10 shadow-inner'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {link.name}
                      {isActive && (
                        <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-emerald-400 rounded-full shadow-glow-mint" />
                      )}
                    </Link>
                  );
                })}

                {isModerator && (
                  <Link
                    to="/moderator"
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      location.pathname === '/moderator'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-glow-amber'
                        : 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10'
                    }`}
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>Mod Queue</span>
                  </Link>
                )}

                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      location.pathname === '/admin'
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-glow-violet'
                        : 'text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Admin Hub</span>
                  </Link>
                )}
              </nav>
            )}
          </div>

          {/* Right: Actions */}
          <div className="hidden sm:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* 1-Click Interactive Role Switcher Pill */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 transition-all hover:border-emerald-500/40"
                    title="Switch demo evaluation role"
                  >
                    <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-glow-mint animate-pulse" />
                    <span className="text-slate-400">Role:</span>
                    <span className="font-bold uppercase text-emerald-300 tracking-wider">
                      {user?.role || 'Student'}
                    </span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {roleDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl glass-slab border border-white/15 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-2 py-1 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest border-b border-white/5 mb-1">
                        Demo Role Switcher
                      </div>
                      <button
                        onClick={() => handleRoleSwitch('student')}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                          user?.role === 'student' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-300 hover:bg-white/5'
                        }`}
                      >
                        <span>Student Role</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono">
                          Feed/Vote
                        </span>
                      </button>
                      <button
                        onClick={() => handleRoleSwitch('moderator')}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                          user?.role === 'moderator' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-300 hover:bg-white/5'
                        }`}
                      >
                        <span>Moderator Role</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                          Queue
                        </span>
                      </button>
                      <button
                        onClick={() => handleRoleSwitch('admin')}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                          user?.role === 'admin' ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-300 hover:bg-white/5'
                        }`}
                      >
                        <span>Admin Role</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
                          All Access
                        </span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Report Serious Issue Quick Link */}
                <Link
                  to="/report-issue"
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-300 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 hover:border-rose-500/50 transition-all flex items-center gap-1.5 shadow-glow-coral/30"
                >
                  <AlertOctagon className="w-3.5 h-3.5" />
                  <span>Grievance</span>
                </Link>

                {/* Create Post Button */}
                <Link
                  to="/create"
                  className="btn-primary-vibrant flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black tracking-wide"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>NEW POST</span>
                </Link>

                {/* Logged in User Pill & Logout Button */}
                <div className="flex items-center gap-2 pl-2 border-l border-white/10">
                  <div
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900/60 border border-white/5 text-xs text-slate-300"
                    title={`Signed in as ${user?.email}`}
                  >
                    <User className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="max-w-[110px] truncate font-medium text-[11px]">{user?.email?.split('@')[0]}</span>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Log out of campus account"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              /* Public / Unauthenticated Navigation */
              <div className="flex items-center gap-2">
                <Link
                  to="/about"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>About</span>
                </Link>
                <Link
                  to="/login"
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    location.pathname === '/login'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-glow-mint/30'
                      : 'text-slate-200 hover:text-white hover:bg-white/10 border border-white/10'
                  }`}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn-primary-vibrant px-4 py-2 rounded-xl text-xs font-bold text-slate-950 transition-all shadow-glow-mint"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex sm:hidden items-center gap-2">
            {isAuthenticated && (
              <Link
                to="/create"
                className="btn-primary-vibrant p-2 rounded-xl"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden mt-2 max-w-7xl mx-auto glass-slab rounded-2xl p-4 border border-white/10 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
          {isAuthenticated ? (
            <>
              <div className="flex items-center justify-between pb-2 border-b border-white/5 text-xs text-slate-400">
                <span>Role: <strong className="text-emerald-400 uppercase font-mono">{user?.role}</strong></span>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleRoleSwitch('student')}
                    className="px-2 py-1 rounded-lg bg-white/5 text-[10px] font-bold text-emerald-400"
                  >
                    Student
                  </button>
                  <button
                    onClick={() => handleRoleSwitch('moderator')}
                    className="px-2 py-1 rounded-lg bg-white/5 text-[10px] font-bold text-amber-400"
                  >
                    Mod
                  </button>
                  <button
                    onClick={() => handleRoleSwitch('admin')}
                    className="px-2 py-1 rounded-lg bg-white/5 text-[10px] font-bold text-indigo-400"
                  >
                    Admin
                  </button>
                </div>
              </div>

              <div className="flex flex-col space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-xl text-sm font-semibold text-slate-200 hover:bg-white/5"
                  >
                    {link.name}
                  </Link>
                ))}
                <Link
                  to="/report-issue"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-500/10"
                >
                  Report Serious Grievance
                </Link>
                {isModerator && (
                  <Link
                    to="/moderator"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-xl text-sm font-semibold text-amber-300 hover:bg-amber-500/10"
                  >
                    Moderator Queue
                  </Link>
                )}
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-xl text-sm font-semibold text-indigo-300 hover:bg-indigo-500/10"
                  >
                    Admin Hub
                  </Link>
                )}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 mt-2 pt-2 border-t border-white/5"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out ({user?.email})</span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col space-y-2">
              <Link
                to="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:bg-white/5"
              >
                About CampusVoice
              </Link>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-primary-vibrant text-center py-2.5 rounded-xl text-sm font-bold text-slate-950"
              >
                Sign In to Enter
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2.5 rounded-xl text-sm font-bold text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/10"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
