import React, { useState } from 'react';
import {
  Shield,
  EyeOff,
  Lock,
  AlertTriangle,
  FileText,
  Server,
  KeyRound,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Cpu,
  Fingerprint,
  Radio,
  ChevronDown,
} from 'lucide-react';

export default function PrivacyCenterPage() {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const faqs = [
    {
      q: 'Can university deans or faculty members identify who posted a grievance?',
      a: 'No. University administrators and faculty have zero administrative access to the platform database. Furthermore, public API endpoints strip author IDs and IP addresses before transmission. Even campus moderators only see cryptographic pseudonyms and avatars.',
    },
    {
      q: 'Can I edit or delete my post if it is posted anonymously?',
      a: 'Yes. When you publish a post, our backend creates a one-way HMAC author hash tied to your user session secret. When you request an edit or deletion, our server verifies ownership cryptographically without ever exposing your user record to other students.',
    },
    {
      q: 'How does the platform prevent duplicate upvotes without tracking reading habits?',
      a: 'Votes use per-target HMAC salting. Instead of storing a log of all posts a student read, each vote creates a deterministic hash: HMAC(userId + targetPostId). The system checks if this hash exists to prevent multiple votes, without revealing your voting history to anyone.',
    },
    {
      q: 'What happens if someone submits a credible threat of physical violence or terror?',
      a: 'Content containing explicit threats of physical assault or mass casualty is intercepted by our Google Gemini AI screening pipeline and quarantined. The platform maintains zero tolerance for physical violence and cooperates with mandatory law enforcement subpoenas regarding immediate bodily harm.',
    },
  ];

  return (
    <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Background Aura */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
          <Shield className="w-4 h-4" />
          <span>Security Architecture & Threat Model</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white font-display">
          Privacy by <span className="text-gradient-aurora">Cryptographic Design</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl font-medium">
          CampusVoice is built on rigorous identity severance and transparent privacy engineering. We explicitly reject marketing slogans claiming "untraceable cryptographic immunity."
        </p>
      </div>

      {/* Mandatory Technical Disclaimer Banner */}
      <div className="glass-slab rounded-3xl p-6 sm:p-8 border border-amber-500/30 bg-amber-500/[0.04] space-y-4 shadow-xl">
        <div className="flex items-center gap-2.5 text-amber-400 font-bold text-base font-display">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>The Limits of Technical Anonymity: A Mandatory Disclaimer</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
          No web application operating over the public internet can guarantee 100% untraceable anonymity. While CampusVoice eliminates server-side linkages between your user account and your published content, students should understand real-world boundaries:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-white/5 space-y-1 text-xs">
            <span className="text-amber-300 font-bold flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5" />
              <span>Campus Wi-Fi Network Logs</span>
            </span>
            <p className="text-slate-400 text-[11px] leading-normal">
              University IT departments log IP connections and DNS lookups. They can see when an IP connects to CampusVoice, even if HTTPS encrypts content.
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-white/5 space-y-1 text-xs">
            <span className="text-amber-300 font-bold flex items-center gap-1.5">
              <Fingerprint className="w-3.5 h-3.5" />
              <span>Stylometry & Personal Clues</span>
            </span>
            <p className="text-slate-400 text-[11px] leading-normal">
              Phrasing like <em>"I am the TA who teaches Lab 3 on Wednesdays"</em> deanonymizes you regardless of cryptographic defenses.
            </p>
          </div>
        </div>
      </div>

      {/* Comparison: Stored Safely vs Explicitly Discarded */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stored Safely */}
        <div className="glass-slab rounded-3xl p-6 sm:p-7 border border-emerald-500/30 shadow-glow-mint/20 space-y-4">
          <div className="flex items-center gap-2.5 text-emerald-400 font-bold font-display text-lg">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <span>What We Store Safely</span>
          </div>
          <ul className="space-y-3 text-xs text-slate-300">
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
              <span>
                <strong className="text-white">Hashed Passwords:</strong> Salted bcrypt (12 rounds) stored in isolated credentials table.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
              <span>
                <strong className="text-white">Aggregated Demographics:</strong> Department and academic year for campus-wide statistics; never linked to post records.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
              <span>
                <strong className="text-white">HMAC Author Hash:</strong> One-way cryptographic token (<code className="text-emerald-400 font-mono bg-emerald-950/60 px-1 py-0.5 rounded">select: false</code>) used strictly to verify edit/delete ownership.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
              <span>
                <strong className="text-white">Salted Target Hashes:</strong> Per-post voting hash preventing double-voting without tracking student browsing history.
              </span>
            </li>
          </ul>
        </div>

        {/* Explicitly Discarded */}
        <div className="glass-slab rounded-3xl p-6 sm:p-7 border border-rose-500/30 shadow-glow-coral/20 space-y-4">
          <div className="flex items-center gap-2.5 text-rose-400 font-bold font-display text-lg">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-rose-400" />
            </div>
            <span>What We Explicitly Discard</span>
          </div>
          <ul className="space-y-3 text-xs text-slate-300">
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
              <span>
                <strong className="text-white">No IP Address Logs:</strong> Server access logs strip client IP addresses and user agents completely.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
              <span>
                <strong className="text-white">Zero Third-Party Trackers:</strong> No Google Analytics, no Meta Pixels, no behavioral trackers.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
              <span>
                <strong className="text-white">No Public Author IDs:</strong> Public feed queries and post responses completely exclude author references.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
              <span>
                <strong className="text-white">PII Scrubbing:</strong> Phone numbers, student roll numbers, and names are sanitized before sending to Gemini AI.
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Logical Separation Architecture Diagram */}
      <div className="glass-slab rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-white font-display flex items-center gap-2.5">
            <Server className="w-5 h-5 text-cyan-400" />
            <span>Logical Separation of Identity Architecture</span>
          </h3>
          <p className="text-xs text-slate-400 font-medium">
            How CampusVoice mathematically isolates who you are from what you post.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-950/95 font-mono text-xs text-slate-300 border border-white/10 space-y-4 leading-relaxed overflow-x-auto shadow-inner">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-emerald-400 font-bold">// 1. AUTHENTICATION DOMAIN (Completely Isolated)</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">PRIVATE DB</span>
          </div>
          <div className="text-slate-300 pl-4 border-l-2 border-emerald-500/40">
            User Table: &#123; _id, email, passwordHash, role, department, academicYear, status &#125;
            <div className="text-slate-500 text-[11px] pt-1">
              &rarr; Kept strictly behind bcrypt auth walls; never returned in public post schemas.
            </div>
          </div>

          <div className="flex items-center justify-between pb-2 pt-2 border-b border-slate-800">
            <span className="text-cyan-400 font-bold">// 2. CONTENT DOMAIN (Pseudonymous Only)</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">PUBLIC FEED</span>
          </div>
          <div className="text-slate-300 pl-4 border-l-2 border-cyan-500/40">
            Post Table: &#123; title, body, category, pseudonym, tags, score, authorRef [UNSELECTED] &#125;
            <div className="text-slate-500 text-[11px] pt-1">
              &rarr; Queries enforce select: false. Public API responses omit authorRef entirely.
            </div>
          </div>

          <div className="flex items-center justify-between pb-2 pt-2 border-b border-slate-800">
            <span className="text-violet-400 font-bold">// 3. MODERATOR BOUNDARY (Blind Review)</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-violet-500/10 text-violet-300 border border-violet-500/20">STAFF GATE</span>
          </div>
          <div className="text-slate-300 pl-4 border-l-2 border-violet-500/40">
            Moderation Queue: &#123; post: &#123; title, body, aiAnalysis, pseudonym &#125;, reports &#125;
            <div className="text-slate-500 text-[11px] pt-1">
              &rarr; Moderators and Admins CANNOT unmask an author from their dashboard.
            </div>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white font-display">
          Frequently Asked Questions
        </h3>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="glass-slab rounded-2xl border border-white/10 overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-white/[0.02]"
                >
                  <span className="text-sm font-bold text-white flex items-center gap-2.5">
                    <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{faq.q}</span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-emerald-400' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-slate-400 leading-relaxed pl-11 border-t border-white/5">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
