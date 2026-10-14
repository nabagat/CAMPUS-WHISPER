import React from 'react';
import {
  BookOpen,
  GraduationCap,
  Home,
  Utensils,
  Building2,
  Landmark,
  Calendar,
  MessageSquare,
} from 'lucide-react';

const CATEGORY_STYLES = {
  Academics: {
    bg: 'bg-indigo-500/15 text-indigo-200 border-indigo-400/40 shadow-[0_0_15px_rgba(99,102,241,0.25)]',
    dot: 'bg-indigo-400',
    icon: BookOpen,
  },
  Faculty: {
    bg: 'bg-purple-500/15 text-purple-200 border-purple-400/40 shadow-[0_0_15px_rgba(168,85,247,0.25)]',
    dot: 'bg-purple-400',
    icon: GraduationCap,
  },
  Hostel: {
    bg: 'bg-amber-500/15 text-amber-200 border-amber-400/40 shadow-[0_0_15px_rgba(245,158,11,0.25)]',
    dot: 'bg-amber-400',
    icon: Home,
  },
  Mess: {
    bg: 'bg-rose-500/15 text-rose-200 border-rose-400/40 shadow-[0_0_15px_rgba(244,63,94,0.25)]',
    dot: 'bg-rose-400',
    icon: Utensils,
  },
  Infrastructure: {
    bg: 'bg-cyan-500/15 text-cyan-200 border-cyan-400/40 shadow-[0_0_15px_rgba(6,182,212,0.25)]',
    dot: 'bg-cyan-400',
    icon: Building2,
  },
  Administration: {
    bg: 'bg-sky-500/15 text-sky-200 border-sky-400/40 shadow-[0_0_15px_rgba(14,165,233,0.25)]',
    dot: 'bg-sky-400',
    icon: Landmark,
  },
  Events: {
    bg: 'bg-emerald-500/15 text-emerald-200 border-emerald-400/40 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
    dot: 'bg-emerald-400',
    icon: Calendar,
  },
  General: {
    bg: 'bg-slate-500/15 text-slate-200 border-slate-400/40 shadow-[0_0_15px_rgba(148,163,184,0.15)]',
    dot: 'bg-slate-400',
    icon: MessageSquare,
  },
};

export default function CategoryBadge({ category, size = 'sm', className = '' }) {
  const config = CATEGORY_STYLES[category] || CATEGORY_STYLES.General;
  const Icon = config.icon;

  const sizeClasses = {
    xs: 'text-[10px] px-2 py-0.5 gap-1.5',
    sm: 'text-xs px-2.5 py-1 gap-1.5 font-semibold',
    md: 'text-xs px-3 py-1.5 gap-2 font-bold',
  }[size] || 'text-xs px-2.5 py-1 gap-1.5 font-semibold';

  return (
    <span
      className={`inline-flex items-center rounded-full border backdrop-blur-md transition-all ${config.bg} ${sizeClasses} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} shadow-sm animate-pulse`} />
      <Icon className={size === 'xs' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{category}</span>
    </span>
  );
}
