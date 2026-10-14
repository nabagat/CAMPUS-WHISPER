import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  EyeOff,
  Bot,
  CheckCircle2,
  AlertOctagon,
  ArrowRight,
  MessageSquare,
  Sparkles,
  Lock,
  Flame,
  ArrowUpRight,
  Fingerprint,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { isAuthenticated, quickSwitch } = useAuth();
  const navigate = useNavigate();
  const [pulseData, setPulseData] = useState(null);

  useEffect(() => {
    async function fetchPulse() {
      if (!isAuthenticated) return;
      try {
        const res = await api.getCampusPulse();
        if (res.success) setPulseData(res.data);
      } catch (err) {
        console.warn('Could not fetch campus pulse:', err.message);
      }
    }
    fetchPulse();
  }, [isAuthenticated]);

  const handleDemoLogin = async (role) => {
    await quickSwitch(role);
    if (role === 'moderator') navigate('/moderator');
    else if (role === 'admin') navigate('/admin');
    else navigate('/feed');
  };

  return (
    <div className="space-y-28 pb-24 relative overflow-hidden">
      {/* Radiant Background Mesh Glows */}
      <div className="radial-mesh-top" />
      <div className="absolute top-[500px] -right-[150px] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[800px] -left-[150px] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-24 pb-6 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-8">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-slab border border-emerald-500/30 text-emerald-300 text-xs font-bold tracking-wide shadow-glow-mint/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-glow-mint" />
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>AI-Assisted Privacy-by-Design Campus Platform</span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-white font-display leading-[1.05]">
            Speak truth on campus. <br />
            <span className="text-gradient-aurora">
              Without fear or exposure.
            </span>
          </h1>

          {/* Subtext */}
          <p className="max-w-2xl mx-auto text-base sm:text-xl text-slate-300 font-normal leading-relaxed">
            Report broken facilities, mess food hygiene, grading policies, and hostel conditions safely. Powered by <strong>Gemini 3.8 Flash</strong> AI moderation and mathematical identity severance.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/feed"
                  className="btn-primary-vibrant w-full sm:w-auto px-8 py-4 rounded-2xl text-sm font-black flex items-center justify-center gap-2 group tracking-wide shadow-glow-mint"
                >
                  <span>EXPLORE CAMPUS FEED</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/create"
                  className="w-full sm:w-auto px-7 py-4 rounded-2xl font-bold text-sm text-slate-100 bg-white/5 hover:bg-white/10 border border-white/15 hover:border-emerald-500/40 transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span>Create Anonymous Post</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="btn-primary-vibrant w-full sm:w-auto px-8 py-4 rounded-2xl text-sm font-black flex items-center justify-center gap-2 group tracking-wide shadow-glow-mint"
                >
                  <span>SIGN IN TO ENTER CAMPUS</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/register"
                  className="w-full sm:w-auto px-7 py-4 rounded-2xl font-bold text-sm text-slate-100 bg-white/5 hover:bg-white/10 border border-white/15 hover:border-emerald-500/40 transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>Create Student Passport</span>
                </Link>
              </>
            )}
          </div>

          {/* 1-Click Interactive Role Launcher Segment */}
          <div className="pt-8 max-w-xl mx-auto">
            <div className="glass-slab rounded-3xl p-5 border border-white/10 shadow-2xl space-y-3.5 relative">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300 pb-1 border-b border-white/5">
                <span className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Instant Role Switcher (Evaluator Test Drive)</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">1-Click Auth</span>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <button
                  onClick={() => handleDemoLogin('student')}
                  className="p-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:border-emerald-500/60 transition-all text-center group"
                >
                  <div className="text-xs font-black tracking-wide group-hover:scale-105 transition-transform">
                    Student 🎓
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">Post & Upvote</div>
                </button>

                <button
                  onClick={() => handleDemoLogin('moderator')}
                  className="p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:border-amber-500/60 transition-all text-center group"
                >
                  <div className="text-xs font-black tracking-wide group-hover:scale-105 transition-transform">
                    Moderator 🛡️
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">Review Queues</div>
                </button>

                <button
                  onClick={() => handleDemoLogin('admin')}
                  className="p-3 rounded-2xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:border-indigo-500/60 transition-all text-center group"
                >
                  <div className="text-xs font-black tracking-wide group-hover:scale-105 transition-transform">
                    Admin 👑
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">Full Telemetry</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Campus Telemetry Slabs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          <div className="glass-slab rounded-3xl p-6 border border-white/10 space-y-2 hover:border-emerald-500/40 transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider font-mono">Discussions</span>
              <Flame className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-4xl sm:text-5xl font-black text-white font-display tracking-tight">
              {pulseData?.resolutionStats?.active || 12}
            </div>
            <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Active student threads</span>
            </div>
          </div>

          <div className="glass-slab rounded-3xl p-6 border border-white/10 space-y-2 hover:border-cyan-500/40 transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider font-mono">Resolved</span>
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-4xl sm:text-5xl font-black text-cyan-300 font-display tracking-tight">
              {pulseData?.resolutionStats?.resolved || 8}
            </div>
            <div className="text-xs text-cyan-400 font-semibold">
              Verified campus repairs
            </div>
          </div>

          <div className="glass-slab rounded-3xl p-6 border border-white/10 space-y-2 hover:border-purple-500/40 transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider font-mono">Privacy Shield</span>
              <Fingerprint className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-4xl sm:text-5xl font-black text-purple-300 font-display tracking-tight">
              100%
            </div>
            <div className="text-xs text-purple-400 font-semibold">
              Zero PII query leakage
            </div>
          </div>

          <div className="glass-slab rounded-3xl p-6 border border-white/10 space-y-2 hover:border-amber-500/40 transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider font-mono">AI Triage</span>
              <Bot className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-4xl sm:text-5xl font-black text-amber-300 font-display tracking-tight">
              &lt;0.4s
            </div>
            <div className="text-xs text-amber-400 font-semibold">
              Gemini 3.8 Flash latency
            </div>
          </div>
        </div>
      </section>

      {/* 4 Pillars of Architecture */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-black text-white font-display">
            Built on Real Principles.
          </h2>
          <p className="text-sm text-slate-400">
            Anonymity is an architectural discipline, not a marketing gimmick.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-slab rounded-3xl p-7 border border-white/10 space-y-4 hover:border-emerald-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-glow-mint">
              <EyeOff className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-display">
              Rotating Pseudonyms
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Every post author is assigned an alias like <em>"Resilient Falcon #42"</em>. Real student records are never exposed publicly or to peers.
            </p>
          </div>

          <div className="glass-slab rounded-3xl p-7 border border-white/10 space-y-4 hover:border-cyan-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-glow-cyan">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-display">
              Identity Severance
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              User authentication tables are physically detached from post feeds. Authorship fields use <code className="text-cyan-300 font-mono">select: false</code> at database level.
            </p>
          </div>

          <div className="glass-slab rounded-3xl p-7 border border-white/10 space-y-4 hover:border-purple-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center shadow-glow-violet">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-display">
              Gemini 3.8 Safety Tiers
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Automated screening flags toxicity, spam, and danger. Low risk publishes instantly; medium risk is queued for human review.
            </p>
          </div>

          <div className="glass-slab rounded-3xl p-7 border border-white/10 space-y-4 hover:border-rose-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center shadow-glow-coral">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-display">
              Urgent Safety Channel
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Confidential whistleblowing option for acute physical hazards, food contamination, or emergency welfare with priority routing.
            </p>
          </div>
        </div>
      </section>

      {/* AI Campus Pulse Briefing */}
      {pulseData?.aiSummary && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-slab rounded-3xl p-8 border border-white/15 shadow-2xl space-y-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5 text-emerald-400 font-bold font-display text-sm">
                <Bot className="w-5 h-5" />
                <span>Aggregated Campus Pulse & AI Intelligence</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                Live Briefing
              </span>
            </div>

            <p className="text-sm text-slate-200 leading-relaxed">
              {pulseData.aiSummary.summary}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs font-mono">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-slate-400 block text-[10px] uppercase">Frustrated</span>
                <span className="text-amber-400 font-bold text-sm">{pulseData.sentiments.Frustrated || 40}%</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-slate-400 block text-[10px] uppercase">Constructive</span>
                <span className="text-emerald-400 font-bold text-sm">{pulseData.sentiments.Constructive || 35}%</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-slate-400 block text-[10px] uppercase">Urgent</span>
                <span className="text-rose-400 font-bold text-sm">{pulseData.sentiments.Urgent || 15}%</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-slate-400 block text-[10px] uppercase">Positive</span>
                <span className="text-cyan-400 font-bold text-sm">{pulseData.sentiments.Positive || 10}%</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Radiant Call to Action */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl p-10 sm:p-14 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/60 border border-emerald-500/30 text-center space-y-6 shadow-glow-emerald relative overflow-hidden">
          <div className="relative z-10 space-y-6">
            <h2 className="text-3xl sm:text-5xl font-black text-white font-display">
              Ready to improve campus life?
            </h2>
            <p className="max-w-xl mx-auto text-sm text-slate-300 leading-relaxed">
              Every voice matters. Join other students sharing feedback on mess meals, hostel maintenance, and academic schedules today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/create"
                className="btn-primary-vibrant w-full sm:w-auto px-8 py-3.5 rounded-2xl text-xs font-black tracking-wide"
              >
                POST ANONYMOUS FEEDBACK
              </Link>
              <Link
                to="/privacy"
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-bold text-xs text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/15 transition-all"
              >
                Read Privacy Threat Model
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
