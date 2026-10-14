import React from 'react';
import {
  BookOpen,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Bot,
  Scale,
  RotateCcw,
  Mail,
  Shield,
  Sparkles,
  LifeBuoy,
  FileCheck2,
} from 'lucide-react';

export default function GuidelinesPage() {
  return (
    <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Background Glow */}
      <div className="absolute top-10 left-1/3 w-[600px] h-[500px] bg-violet-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-violet-500/10 border border-violet-500/30 text-violet-400">
          <Scale className="w-4 h-4" />
          <span>Campus Code of Conduct & Ethics</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white font-display">
          Community <span className="text-gradient-aurora">Guidelines</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl font-medium">
          Anonymity exists to foster constructive truth, accountability, and institutional improvement — never to facilitate bullying, harassment, or malice.
        </p>
      </div>

      {/* Side-by-Side Permitted vs Prohibited */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Permitted */}
        <div className="glass-slab rounded-3xl p-6 sm:p-8 border border-emerald-500/30 shadow-glow-mint/20 space-y-5">
          <div className="flex items-center gap-2.5 text-emerald-400 font-bold font-display text-lg">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <span>Encouraged Submissions</span>
          </div>
          <ul className="space-y-3 text-xs text-slate-300">
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
              <span>
                <strong className="text-white">Facility & Infrastructure Hazards:</strong> Defective elevators, lab safety concerns, dorm heating, campus Wi-Fi outages.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
              <span>
                <strong className="text-white">Mess & Dining Hall Standards:</strong> Food hygiene, water filtration, vendor contractual duties, nutritional balance.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
              <span>
                <strong className="text-white">Curriculum & Academic Policies:</strong> Bottlenecks in course enrollment, scheduling clashes, inconsistent grading standards.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
              <span>
                <strong className="text-white">Administrative Accountability:</strong> Disproportionate fines, missing scholarships, student transit schedule delays.
              </span>
            </li>
          </ul>
        </div>

        {/* Prohibited */}
        <div className="glass-slab rounded-3xl p-6 sm:p-8 border border-rose-500/30 shadow-glow-coral/20 space-y-5">
          <div className="flex items-center gap-2.5 text-rose-400 font-bold font-display text-lg">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-rose-400" />
            </div>
            <span>Strictly Prohibited</span>
          </div>
          <ul className="space-y-3 text-xs text-slate-300">
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-rose-400 mt-1.5 shrink-0" />
              <span>
                <strong className="text-white">Targeted Doxxing & Bullying:</strong> Calling out student names, sharing personal phone numbers, or private room numbers.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-rose-400 mt-1.5 shrink-0" />
              <span>
                <strong className="text-white">Hate Speech & Discrimination:</strong> Slurs, prejudice, or attacks targeted at gender, ethnicity, religion, or sexual orientation.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-rose-400 mt-1.5 shrink-0" />
              <span>
                <strong className="text-white">Threats of Violence:</strong> Incitement of physical harm, weapon mentions, or self-harm encouragement.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-rose-400 mt-1.5 shrink-0" />
              <span>
                <strong className="text-white">Commercial Spam & Academic Fraud:</strong> Selling test banks, essay ghostwriting mills, or non-campus commercial promos.
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* AI Moderation Pipeline Spectrum */}
      <div className="glass-slab rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
            <Bot className="w-4 h-4" />
            <span>Automated AI Screening Matrix</span>
          </div>
          <h3 className="text-xl font-black text-white font-display">
            3-Tier Gemini AI Moderation Pipeline
          </h3>
          <p className="text-xs text-slate-400 font-medium">
            Every submission is screened using Google Gemini with PII sanitization. Risk scores determine automatic action:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          {/* Tier 1 */}
          <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
            <div className="flex items-center justify-between text-emerald-400 font-bold">
              <span>TIER 1: LOW RISK</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-[11px]">&lt; 0.35</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div className="w-1/4 h-full bg-emerald-400" />
            </div>
            <p className="font-sans text-xs text-slate-300 leading-relaxed font-medium">
              Standard constructive feedback without flagged terms. Published directly to the live campus feed instantly.
            </p>
          </div>

          {/* Tier 2 */}
          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between text-amber-300 font-bold">
              <span>TIER 2: REVIEW QUEUE</span>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-[11px]">0.35 - 0.75</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div className="w-3/5 h-full bg-amber-400" />
            </div>
            <p className="font-sans text-xs text-slate-300 leading-relaxed font-medium">
              Submissions with contentious language, profanity, or marked as Serious. Held in Moderator Queue for human review.
            </p>
          </div>

          {/* Tier 3 */}
          <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-3">
            <div className="flex items-center justify-between text-rose-400 font-bold">
              <span>TIER 3: HIGH RISK</span>
              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-[11px]">&gt; 0.75</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div className="w-full h-full bg-rose-500" />
            </div>
            <p className="font-sans text-xs text-slate-300 leading-relaxed font-medium">
              Content containing threats of harm, targeted harassment, or acute policy breach. Automatically quarantined.
            </p>
          </div>
        </div>
      </div>

      {/* Ombudsman Appeals Card */}
      <div className="glass-slab rounded-3xl p-6 sm:p-8 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
            <RotateCcw className="w-4 h-4" />
            <span>False Positives & Appeals Process</span>
          </div>
          <p className="text-xs text-slate-400 max-w-xl leading-relaxed font-medium">
            AI language models can occasionally misclassify sarcastic remarks or technical critique. If your post was mistakenly filtered, campus student moderators review appeals within 4 hours.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="mailto:moderation@campus.edu"
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-950 btn-primary-vibrant flex items-center gap-2"
          >
            <Mail className="w-4 h-4" />
            <span>Contact Ombudsman</span>
          </a>
        </div>
      </div>
    </div>
  );
}
