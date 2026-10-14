import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, EyeOff, AlertTriangle, ExternalLink, HeartHandshake, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-[#03060f]/90 backdrop-blur-xl text-slate-400 text-xs sm:text-sm mt-24">
      {/* Subtle top glow line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand & Manifesto */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-400 to-teal-400 flex items-center justify-center shadow-glow-mint">
                <Shield className="w-5 h-5 text-slate-950 stroke-[2.5]" />
              </div>
              <span className="text-xl font-black text-white font-display tracking-tight">
                Campus<span className="text-gradient-aurora">Voice</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md font-medium">
              A privacy-by-design campus feedback and whistleblowing platform. Empowering university students with safe, constructive, and anonymous channels to address faculty concerns, infrastructure hurdles, mess quality, and campus life without fear of retaliation.
            </p>
            <div className="p-4 rounded-2xl glass-slab border border-amber-500/20 text-xs space-y-1.5 max-w-md">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px] uppercase tracking-wider">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Technical Anonymity Notice</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                CampusVoice employs mathematical pseudonymity, salted HMACs, and identity separation. In alignment with ethical engineering, we <strong>do not</strong> claim impossible "mathematically untraceable immunity" against ISP logging or compromised client hardware. Read our <Link to="/privacy" className="text-emerald-400 hover:underline font-bold">Privacy Architecture & Threat Model</Link>.
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-display">
              Platform Navigation
            </h4>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <Link to="/feed" className="hover:text-emerald-400 transition-colors">
                  Campus Feed & Discussions
                </Link>
              </li>
              <li>
                <Link to="/categories" className="hover:text-emerald-400 transition-colors">
                  Category Hubs & Statistics
                </Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-emerald-400 transition-colors">
                  Search Discussions & Tags
                </Link>
              </li>
              <li>
                <Link to="/guidelines" className="hover:text-emerald-400 transition-colors">
                  Community Code of Conduct
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-emerald-400 transition-colors">
                  Privacy & Threat Model Center
                </Link>
              </li>
              <li>
                <Link to="/report-issue" className="text-rose-400 hover:text-rose-300 font-bold transition-colors flex items-center gap-1">
                  <span>Submit Serious Grievance</span>
                  <span>&rarr;</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Campus Emergency Resources */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-display flex items-center gap-1.5">
              <HeartHandshake className="w-3.5 h-3.5 text-rose-400" />
              <span>Campus Hotlines</span>
            </h4>
            <ul className="space-y-2 text-xs text-slate-400 font-medium">
              <li>
                <span className="text-slate-200 font-semibold block">Campus Police & Emergency</span>
                <span className="text-rose-400 font-mono text-[11px] font-bold">911 / (800) 555-0199</span>
              </li>
              <li>
                <span className="text-slate-200 font-semibold block">Student Counseling Center</span>
                <span className="text-slate-400 font-mono text-[11px]">counseling@campus.edu</span>
              </li>
              <li>
                <span className="text-slate-200 font-semibold block">Campus Health Emergency</span>
                <span className="text-slate-400 font-mono text-[11px]">Bldg 12, Ground Floor</span>
              </li>
              <li>
                <span className="text-slate-200 font-semibold block">Student Ombudsman</span>
                <span className="text-emerald-400 font-mono text-[11px]">ombuds@campus.edu</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
          <div>
            &copy; {new Date().getFullYear()} CampusVoice Platform. Built with privacy-by-design principles for academic institutions.
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Gemini 3.8 Flash Moderation Active</span>
            </span>
            <span>•</span>
            <span className="text-cyan-400 font-semibold">Zero PII Retained</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
