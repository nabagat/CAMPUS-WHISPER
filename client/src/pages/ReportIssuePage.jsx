import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  AlertOctagon,
  Shield,
  PhoneCall,
  HeartHandshake,
  Send,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Lock,
  Radio,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ReportIssuePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('Infrastructure');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setError('Please log in with any student or demo account to submit an urgent grievance.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const res = await api.createPost({
        title: title.trim(),
        body: body.trim(),
        category,
        tags: ['#UrgentGrievance', '#SafetyHazard'],
        isSeriousIssue: true, // Priority escalation
      });

      if (res.success) {
        alert('Serious campus grievance registered confidentially. It has been routed to the priority moderation queue.');
        navigate(`/post/${res.post._id}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit issue.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Radiant Crimson Background Aura */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[650px] h-[500px] bg-rose-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-rose-500/15 border border-rose-500/30 text-rose-400">
          <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
          <span>Priority Whistleblowing & Urgent Hazard Channel</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white font-display">
          Report a <span className="text-gradient-sunset">Critical Hazard</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl font-medium">
          Use this priority pathway to flag acute physical safety hazards, electrical shocks, severe dining contamination, or laboratory emergencies with instant moderator escalation.
        </p>
      </div>

      {/* Emergency First Responders Banner */}
      <div className="glass-slab rounded-3xl p-6 sm:p-7 border border-rose-500/30 bg-rose-950/20 space-y-4 shadow-xl">
        <div className="flex items-center gap-2 text-rose-400 font-bold text-base font-display">
          <PhoneCall className="w-5 h-5 shrink-0 animate-bounce" />
          <span>Immediate Danger or Medical Emergency?</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 font-medium">
          CampusVoice is an asynchronous platform. If anyone is in immediate physical danger, contact on-duty first responders immediately:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-white/10 space-y-1">
            <span className="text-slate-400 block font-mono text-[10px] uppercase font-bold">Campus Police (24/7)</span>
            <span className="text-rose-400 font-bold font-mono text-sm">911 / (800) 555-0199</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-white/10 space-y-1">
            <span className="text-slate-400 block font-mono text-[10px] uppercase font-bold">Health Center Ward</span>
            <span className="text-white font-bold font-mono text-sm">(800) 555-0112</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-white/10 space-y-1">
            <span className="text-slate-400 block font-mono text-[10px] uppercase font-bold">Crisis Counselor</span>
            <span className="text-emerald-400 font-bold font-mono text-sm">Text "CAMPUS" to 741741</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-3 shadow-lg shadow-rose-950/40">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Grievance Composer Form */}
      <form onSubmit={handleSubmit} className="glass-slab rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Affected Campus Domain <span className="text-rose-400">*</span>
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-3.5 rounded-xl bg-slate-950/90 border border-white/10 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-rose-500 font-medium transition-all"
          >
            <option value="Infrastructure">Infrastructure (Water, Electrical Shocks, Structural, Defective Elevators)</option>
            <option value="Mess">Mess / Dining (Food poisoning outbreak, pest infestation, unsanitary water)</option>
            <option value="Hostel">Hostel (Washroom hazards, heater electrical sparks, warden misconduct)</option>
            <option value="Academics">Academics (Severe grading discrimination, paper leaks, accreditation risks)</option>
            <option value="Administration">Administration (Missing bursary funds, unauthorized fees, transit safety)</option>
            <option value="General">General Campus Life & Student Safety</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Grievance Headline / Summary <span className="text-rose-400">*</span>
            </label>
            <span className="text-[11px] text-slate-500 font-mono">{title.length}/200</span>
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            minLength={5}
            maxLength={200}
            placeholder="e.g. Exposed 220V wiring emitting sparks near Chem Lab 3 entrance"
            className="w-full px-4 py-3.5 rounded-xl bg-slate-950/90 border border-white/10 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500/70 font-medium transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Detailed Context & Specific Location <span className="text-rose-400">*</span>
            </label>
            <span className="text-[11px] text-slate-500 font-mono">{body.length}/5000</span>
          </div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            minLength={15}
            maxLength={5000}
            rows={6}
            placeholder="Include building name, floor number, room code, date/time observed, and what immediate preventive action is necessary. (Avoid naming individual students to maintain ethical decorum)."
            className="w-full px-4 py-3.5 rounded-xl bg-slate-950/90 border border-white/10 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500/70 resize-y font-medium transition-all"
          />
        </div>

        {/* Cryptographic Protection Badge */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/20 flex items-start gap-3 text-xs">
          <Shield className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="text-emerald-300 font-bold block">Cryptographic Identity Severance Engaged</span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              This grievance will be dispatched with an HMAC pseudonym. Your university email and student identity are never visible to campus moderators or peer reviewers.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <Link
            to="/feed"
            className="text-xs text-slate-400 hover:text-white font-bold transition-colors"
          >
            &larr; Return to Discussions
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-7 py-3 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 shadow-glow-coral disabled:opacity-50 transition-all flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? 'Dispatching to Priority Queue...' : 'Dispatch Priority Grievance'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
