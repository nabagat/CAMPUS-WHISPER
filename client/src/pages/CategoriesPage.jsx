import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  GraduationCap,
  Home,
  Utensils,
  Building2,
  Landmark,
  Calendar,
  MessageSquare,
  ArrowRight,
  Plus,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';

const CATEGORY_META = [
  {
    name: 'Academics',
    icon: BookOpen,
    glow: 'border-indigo-500/30 hover:border-indigo-400/60 shadow-[0_0_30px_rgba(99,102,241,0.15)] hover:shadow-[0_0_40px_rgba(99,102,241,0.3)]',
    iconBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-400/40',
    description: 'Course registration issues, grading curves, midterm policies, syllabus pacing, and exam schedules.',
    examples: ['24/7 Library Hours', 'Midterm grade delays', 'Credit transfer issues'],
  },
  {
    name: 'Faculty',
    icon: GraduationCap,
    glow: 'border-purple-500/30 hover:border-purple-400/60 shadow-[0_0_30px_rgba(168,85,247,0.15)] hover:shadow-[0_0_40px_rgba(168,85,247,0.3)]',
    iconBg: 'bg-purple-500/20 text-purple-300 border-purple-400/40',
    description: 'Teaching quality, office hours availability, TA mentorship, and academic advisor guidance.',
    examples: ['Cancelled office hours', 'Lab TA support', 'Course evaluations'],
  },
  {
    name: 'Hostel',
    icon: Home,
    glow: 'border-amber-500/30 hover:border-amber-400/60 shadow-[0_0_30px_rgba(245,158,11,0.15)] hover:shadow-[0_0_40px_rgba(245,158,11,0.3)]',
    iconBg: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
    description: 'Room conditions, water heaters, washroom hygiene, laundry curfews, and warden policies.',
    examples: ['Geyser malfunctions', 'Laundry access', 'Hostel Wi-Fi coverage'],
  },
  {
    name: 'Mess',
    icon: Utensils,
    glow: 'border-rose-500/30 hover:border-rose-400/60 shadow-[0_0_30px_rgba(244,63,94,0.15)] hover:shadow-[0_0_40px_rgba(244,63,94,0.3)]',
    iconBg: 'bg-rose-500/20 text-rose-300 border-rose-400/40',
    description: 'Dining hall food quality, hygiene inspections, vendor accountability, and dietary variety.',
    examples: ['Food safety audit', 'Vegan protein options', 'Clean drinking water'],
  },
  {
    name: 'Infrastructure',
    icon: Building2,
    glow: 'border-cyan-500/30 hover:border-cyan-400/60 shadow-[0_0_30px_rgba(6,182,212,0.15)] hover:shadow-[0_0_40px_rgba(6,182,212,0.3)]',
    iconBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40',
    description: 'Campus internet/Wi-Fi, lab equipment, athletic facilities, classrooms, and study spaces.',
    examples: ['Library packet loss', 'Lab oscilloscope calibrations', 'Gym equipment safety'],
  },
  {
    name: 'Administration',
    icon: Landmark,
    glow: 'border-sky-500/30 hover:border-sky-400/60 shadow-[0_0_30px_rgba(14,165,233,0.15)] hover:shadow-[0_0_40px_rgba(14,165,233,0.3)]',
    iconBg: 'bg-sky-500/20 text-sky-300 border-sky-400/40',
    description: 'Financial aid disbursement, registrar deadlines, billing errors, and shuttle bus routes.',
    examples: ['Campus shuttle congestion', 'Library penalty appeals', 'Scholarship delays'],
  },
  {
    name: 'Events',
    icon: Calendar,
    glow: 'border-emerald-500/30 hover:border-emerald-400/60 shadow-[0_0_30px_rgba(16,185,129,0.15)] hover:shadow-[0_0_40px_rgba(16,185,129,0.3)]',
    iconBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
    description: 'Tech fests, cultural nights, hackathons, sports meets, and guest speaker symposiums.',
    examples: ['Hackathon network crashes', 'Cultural night ticketing', 'Club budget allocations'],
  },
  {
    name: 'General',
    icon: MessageSquare,
    glow: 'border-slate-500/30 hover:border-slate-400/60 shadow-[0_0_30px_rgba(148,163,184,0.1)] hover:shadow-[0_0_40px_rgba(148,163,184,0.2)]',
    iconBg: 'bg-slate-500/20 text-slate-300 border-slate-400/40',
    description: 'Campus life discussions, stray animal welfare, student well-being, and general feedback.',
    examples: ['Bicycle sharing', 'Stray dog vaccinations', 'Night canteen hours'],
  },
];

export default function CategoriesPage() {
  const [pulseData, setPulseData] = useState(null);

  useEffect(() => {
    async function fetchPulse() {
      try {
        const res = await api.getCampusPulse();
        if (res.success) setPulseData(res.data);
      } catch (err) {
        console.error('Error fetching pulse:', err.message);
      }
    }
    fetchPulse();
  }, []);

  const getCategoryCount = (catName) => {
    if (!pulseData || !pulseData.categories) return 0;
    const found = pulseData.categories.find((c) => c.category === catName);
    return found ? found.count : 0;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="space-y-3 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-slab border border-emerald-500/30 text-emerald-300 text-xs font-bold tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Organized Campus Feedback Hubs</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-black text-white font-display">
          Browse by Category
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Targeted channels dedicated to academics, hostel amenities, dining health, and campus infrastructure.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {CATEGORY_META.map((cat) => {
          const Icon = cat.icon;
          const count = getCategoryCount(cat.name);

          return (
            <div
              key={cat.name}
              className={`glass-slab rounded-3xl p-6 border transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1 ${cat.glow}`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-md ${cat.iconBg}`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white">
                    {count} {count === 1 ? 'thread' : 'threads'}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-xl font-bold text-white font-display group-hover:text-emerald-300 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-300/90 leading-relaxed font-normal">
                    {cat.description}
                  </p>
                </div>

                <div className="space-y-1.5 pt-2">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                    Common Concerns:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.examples.map((ex) => (
                      <span
                        key={ex}
                        className="text-[10px] px-2.5 py-0.5 rounded-lg bg-black/40 border border-white/5 text-slate-300 font-mono"
                      >
                        {ex}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-white/5 flex items-center justify-between gap-2">
                <Link
                  to={`/feed?category=${cat.name}`}
                  className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors group/btn"
                >
                  <span>Explore Feed</span>
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/create"
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                  title={`Create post in ${cat.name}`}
                >
                  <Plus className="w-4 h-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
