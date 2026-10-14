import React, { useState } from 'react';
import { ShieldAlert, X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const REASONS = [
  { id: 'harassment', label: 'Harassment or Bullying', desc: 'Targeting an individual student, instructor, or staff member' },
  { id: 'hate_speech', label: 'Hate Speech', desc: 'Discrimination based on race, gender, religion, or background' },
  { id: 'threat', label: 'Safety Threat / Violence', desc: 'Threats of harm, physical danger, or weapon mentions' },
  { id: 'doxxing', label: 'Personal Information / Doxxing', desc: 'Sharing private phone numbers, roll numbers, or addresses' },
  { id: 'misinformation', label: 'Misinformation', desc: 'Demonstrably false rumors about campus closures or exams' },
  { id: 'spam', label: 'Spam or Commercial Ad', desc: 'Promotional links, crypto scams, or commercial advertisements' },
  { id: 'other', label: 'Other Guideline Violation', desc: 'Other behavior violating community guidelines' },
];

export default function ReportModal({ isOpen, onClose, targetId, targetType = 'post', title = '' }) {
  const { isAuthenticated } = useAuth();
  const [reason, setReason] = useState('harassment');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setError('Please log in with any student account to submit a report.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await api.createReport({
        targetId,
        targetType,
        reason,
        reporterNotes: notes,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-rose-400 font-semibold font-['Outfit']">
            <ShieldAlert className="w-5 h-5" />
            <span>Report Anonymous Content</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white font-['Outfit']">
              Report Submitted Securely
            </h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Our human moderation team and automated safety filters have received your report. Your identity remains protected.
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-colors"
            >
              Close Window
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {title && (
              <div className="text-xs text-slate-400 truncate bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 block font-mono text-[10px] uppercase">Target Content:</span>
                "{title}"
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">
                Primary Reason for Report
              </label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {REASONS.map((r) => (
                  <label
                    key={r.id}
                    className={`flex items-start gap-2.5 p-2 rounded-lg border cursor-pointer transition-colors ${
                      reason === r.id
                        ? 'bg-rose-500/10 border-rose-500/50 text-white'
                        : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={r.id}
                      checked={reason === r.id}
                      onChange={(e) => setReason(e.target.value)}
                      className="mt-0.5 text-rose-500 focus:ring-rose-500"
                    />
                    <div>
                      <div className="text-xs font-medium text-slate-200">{r.label}</div>
                      <div className="text-[11px] text-slate-400 leading-tight">{r.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 block">
                Additional Details (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Provide context for our moderators..."
                rows={2}
                maxLength={500}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500/60 resize-none"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-950 transition-colors disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
