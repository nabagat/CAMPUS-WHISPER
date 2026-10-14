import React from 'react';
import { CheckCircle2, Clock, ShieldAlert } from 'lucide-react';

const STATUS_CONFIGS = {
  active: {
    label: 'Active Discussion',
    bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/40 shadow-[0_0_12px_rgba(16,185,129,0.25)]',
    dot: 'bg-emerald-400',
    icon: CheckCircle2,
  },
  under_review: {
    label: 'Under Review',
    bg: 'bg-amber-500/15 text-amber-300 border-amber-400/40 shadow-[0_0_12px_rgba(245,158,11,0.25)]',
    dot: 'bg-amber-400',
    icon: Clock,
  },
  resolved: {
    label: 'Resolved by Admin',
    bg: 'bg-indigo-500/20 text-indigo-200 border-indigo-400/40 shadow-[0_0_12px_rgba(99,102,241,0.25)]',
    dot: 'bg-indigo-400',
    icon: CheckCircle2,
  },
  rejected: {
    label: 'Held / Flagged',
    bg: 'bg-rose-500/20 text-rose-300 border-rose-400/40 shadow-[0_0_12px_rgba(244,63,94,0.25)]',
    dot: 'bg-rose-400',
    icon: ShieldAlert,
  },
};

export default function StatusBadge({ status, className = '' }) {
  const config = STATUS_CONFIGS[status] || STATUS_CONFIGS.active;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border backdrop-blur-md ${config.bg} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} shadow-sm`} />
      <span>{config.label}</span>
    </span>
  );
}
