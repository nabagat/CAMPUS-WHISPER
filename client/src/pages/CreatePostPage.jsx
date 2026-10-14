import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Send,
  Sparkles,
  Shield,
  Bot,
  AlertOctagon,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Flame,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  'Academics',
  'Faculty',
  'Hostel',
  'Mess',
  'Infrastructure',
  'Administration',
  'Events',
  'General',
];

export default function CreatePostPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('Academics');
  const [tagsInput, setTagsInput] = useState('');
  const [isSeriousIssue, setIsSeriousIssue] = useState(false);

  // AI Pre-check State
  const [prechecking, setPrechecking] = useState(false);
  const [precheckResult, setPrecheckResult] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleAiPrecheck = async () => {
    if (title.length < 5 || body.length < 15) {
      setError('Please provide at least 5 characters for title and 15 characters for body before running AI pre-check.');
      return;
    }

    try {
      setPrechecking(true);
      setError('');
      const res = await api.aiPrecheck({ title, body });
      if (res.success) {
        setPrecheckResult(res.data);
        if (res.data.suggestedCategory && !category) {
          setCategory(res.data.suggestedCategory);
        }
      }
    } catch (err) {
      setError(`AI Pre-check unavailable: ${err.message}`);
    } finally {
      setPrechecking(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setError('Please log in with any student or demo account to publish a post.');
      return;
    }

    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    try {
      setSubmitting(true);
      setError('');

      const res = await api.createPost({
        title: title.trim(),
        body: body.trim(),
        category,
        tags: parsedTags,
        isSeriousIssue,
      });

      if (res.success) {
        alert(res.message);
        navigate(`/post/${res.post._id}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to publish post.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-3 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-slab border border-emerald-500/30 text-emerald-300 text-xs font-bold tracking-wide shadow-glow-mint/20">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>Identity Severance Active • Safe Whistleblowing</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white font-display">
          Create Anonymous Post
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
          Your actual name and email are strictly unlinked. Submissions will be displayed under a rotating pseudonym (e.g. <em>"Curious Falcon #42"</em>).
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Creation Slab */}
      <form onSubmit={handleSubmit} className="glass-slab rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6 shadow-2xl">
        {/* Category Picker */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono block">
            Category Hub <span className="text-emerald-400">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                type="button"
                key={cat}
                onClick={() => setCategory(cat)}
                className={`py-2 px-3 rounded-2xl text-xs font-bold tracking-wide border transition-all text-center ${
                  category === cat
                    ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-400/60 shadow-glow-mint/30'
                    : 'bg-black/30 border-white/5 text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs font-mono font-semibold">
            <label className="text-slate-300 uppercase tracking-widest text-[11px]">
              Post Title <span className="text-emerald-400">*</span>
            </label>
            <span className="text-slate-500">{title.length}/200</span>
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            minLength={5}
            maxLength={200}
            placeholder="e.g. WiFi drops on Library 3rd Floor during exam hours"
            className="w-full px-4 py-3.5 rounded-2xl bg-black/40 border border-white/10 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50 transition-all font-medium"
          />
        </div>

        {/* Body */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs font-mono font-semibold">
            <label className="text-slate-300 uppercase tracking-widest text-[11px]">
              Description <span className="text-emerald-400">*</span>
            </label>
            <span className="text-slate-500">{body.length}/5000</span>
          </div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            minLength={15}
            maxLength={5000}
            rows={6}
            placeholder="Describe the issue in detail. What building? What time? What constructive solution do you recommend? Do NOT include personal names or phone numbers."
            className="w-full px-4 py-3.5 rounded-2xl bg-black/40 border border-white/10 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50 transition-all font-normal leading-relaxed resize-y"
          />
        </div>

        {/* Tags */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono block">
            Topics / Tags (Optional)
          </label>
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="Comma-separated topics (e.g. WiFi, Library, Exams)"
            className="w-full px-4 py-2.5 rounded-2xl bg-black/40 border border-white/10 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-all"
          />
        </div>

        {/* Serious Issue Toggle */}
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3.5 shadow-glow-coral/20">
          <input
            type="checkbox"
            id="serious-checkbox"
            checked={isSeriousIssue}
            onChange={(e) => setIsSeriousIssue(e.target.checked)}
            className="mt-1 rounded border-slate-700 bg-slate-950 text-rose-500 focus:ring-rose-500 h-4 w-4"
          />
          <div className="space-y-0.5">
            <label htmlFor="serious-checkbox" className="text-xs font-black text-rose-300 cursor-pointer flex items-center gap-1.5">
              <AlertOctagon className="w-4 h-4 text-rose-400" />
              <span>Mark as Serious / Urgent Campus Hazard</span>
            </label>
            <p className="text-[11px] text-slate-300 leading-snug">
              Check this for acute safety threats, electrical hazards, or food poisoning. Posts marked serious receive priority administrator review.
            </p>
          </div>
        </div>

        {/* AI Pre-Check Panel */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
              <Bot className="w-4 h-4 text-emerald-400" />
              <span>Gemini 3.8 AI Guideline Pre-Check</span>
            </div>
            <button
              type="button"
              onClick={handleAiPrecheck}
              disabled={prechecking || title.length < 5 || body.length < 15}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-emerald-300 border border-emerald-500/30 disabled:opacity-30 flex items-center gap-1.5 transition-all shadow-glow-mint/20"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{prechecking ? 'Analyzing...' : 'Run AI Pre-Check'}</span>
            </button>
          </div>

          {precheckResult && (
            <div className="pt-2 border-t border-white/5 space-y-2 text-xs animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Predicted Safety Tier:</span>
                <span
                  className={`font-mono font-bold px-2.5 py-0.5 rounded-full text-xs ${
                    precheckResult.moderation.overallRisk === 'LOW'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                      : precheckResult.moderation.overallRisk === 'MEDIUM'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-400/40'
                  }`}
                >
                  {precheckResult.moderation.overallRisk} RISK
                </span>
              </div>
              <p className="text-[11px] text-slate-300 bg-white/5 p-2.5 rounded-xl border border-white/5 leading-relaxed">
                {precheckResult.moderation.reasoning || 'Content meets community guidelines.'}
              </p>
              {precheckResult.detectedTopics && precheckResult.detectedTopics.length > 0 && (
                <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
                  <span>AI Detected Tags:</span>
                  <div className="flex gap-1.5">
                    {precheckResult.detectedTopics.map((t) => (
                      <span key={t} className="font-mono text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5">
          <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Low-risk posts publish immediately. Real identities are never revealed.</span>
          </span>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Link
              to="/feed"
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary-vibrant w-full sm:w-auto px-6 py-3 rounded-2xl text-xs font-black tracking-wide flex items-center justify-center gap-2 disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Publishing...' : 'PUBLISH ANONYMOUSLY'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
