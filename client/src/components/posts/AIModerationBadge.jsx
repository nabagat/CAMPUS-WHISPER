import React, { useState } from 'react';
import { Bot, ShieldCheck, AlertTriangle, ShieldAlert, ChevronDown, ChevronUp } from 'lucide-react';

export default function AIModerationBadge({ analysis, isModerator = false }) {
  const [expanded, setExpanded] = useState(false);

  if (!analysis) return null;

  const risk = analysis.overallRisk || 'LOW';

  const riskStyles = {
    LOW: {
      label: 'AI: Low Risk',
      bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      icon: ShieldCheck,
    },
    MEDIUM: {
      label: 'AI: Review Flagged',
      bg: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
      icon: AlertTriangle,
    },
    HIGH: {
      label: 'AI: High Risk',
      bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      icon: ShieldAlert,
    },
  }[risk] || {
    label: 'AI Checked',
    bg: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
    icon: Bot,
  };

  const Icon = riskStyles.icon;

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono border font-medium transition-all ${riskStyles.bg}`}
        title="Click to view AI safety breakdown"
      >
        <Icon className="w-3 h-3" />
        <span>{riskStyles.label}</span>
        {isModerator && (
          expanded ? <ChevronUp className="w-3 h-3 ml-0.5" /> : <ChevronDown className="w-3 h-3 ml-0.5" />
        )}
      </button>

      {/* Expanded Breakdown Popup for Moderators */}
      {expanded && isModerator && (
        <div className="absolute left-0 mt-1.5 w-64 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-3 z-30 text-xs space-y-2">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 text-slate-300 font-semibold">
            <span className="flex items-center gap-1">
              <Bot className="w-3.5 h-3.5 text-emerald-400" />
              Safety Analysis
            </span>
            <span className="font-mono text-[10px] text-slate-400 uppercase">Gemini 3.8</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px]">
            <div className="p-1.5 rounded bg-slate-950/60 border border-slate-800 flex justify-between">
              <span className="text-slate-400">Toxicity:</span>
              <span className={analysis.toxicity > 0.3 ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                {Math.round((analysis.toxicity || 0) * 100)}%
              </span>
            </div>
            <div className="p-1.5 rounded bg-slate-950/60 border border-slate-800 flex justify-between">
              <span className="text-slate-400">Harass:</span>
              <span className={analysis.harassment > 0.3 ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                {Math.round((analysis.harassment || 0) * 100)}%
              </span>
            </div>
            <div className="p-1.5 rounded bg-slate-950/60 border border-slate-800 flex justify-between">
              <span className="text-slate-400">Spam:</span>
              <span className={analysis.spam > 0.3 ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                {Math.round((analysis.spam || 0) * 100)}%
              </span>
            </div>
            <div className="p-1.5 rounded bg-slate-950/60 border border-slate-800 flex justify-between">
              <span className="text-slate-400">Threat:</span>
              <span className={analysis.threat > 0.2 ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                {Math.round((analysis.threat || 0) * 100)}%
              </span>
            </div>
          </div>

          {analysis.sentiment && (
            <div className="text-[11px] text-slate-300 flex items-center justify-between">
              <span className="text-slate-400">Detected Sentiment:</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-800 font-semibold text-emerald-400">
                {analysis.sentiment}
              </span>
            </div>
          )}

          {analysis.reasoning && (
            <div className="text-[11px] text-slate-400 bg-slate-950/80 p-2 rounded border border-slate-800/80 leading-snug">
              <strong className="text-slate-300 block mb-0.5">Rationale:</strong>
              {analysis.reasoning}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
