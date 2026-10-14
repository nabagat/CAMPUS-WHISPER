import React, { useState, useEffect } from 'react';
import {
  Shield,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Flag,
  Bot,
  History,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import CategoryBadge from '../components/common/CategoryBadge';
import StatusBadge from '../components/common/StatusBadge';

export default function ModeratorDashboardPage() {
  const { isModerator } = useAuth();
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingData, setPendingData] = useState({ posts: [], comments: [] });
  const [reports, setReports] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [actionNotes, setActionNotes] = useState({});
  const [processingId, setProcessingId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'pending') {
        const res = await api.getPendingQueue();
        if (res.success) setPendingData(res.data);
      } else if (activeTab === 'reports') {
        const res = await api.getReportsQueue();
        if (res.success) setReports(res.data);
      } else if (activeTab === 'logs') {
        const res = await api.getAuditLogs();
        if (res.success) setLogs(res.data);
      }
    } catch (err) {
      console.error('Error fetching moderator queue:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handlePostAction = async (postId, action) => {
    const note = actionNotes[postId] || '';
    try {
      setProcessingId(postId);
      const res = await api.moderatePost(postId, action, note);
      if (res.success) {
        setPendingData((prev) => ({
          ...prev,
          posts: prev.posts.filter((p) => p._id !== postId),
        }));
      }
    } catch (err) {
      alert(`Moderation action failed: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReportAction = async (reportId, action) => {
    const note = actionNotes[reportId] || '';
    try {
      setProcessingId(reportId);
      const res = await api.resolveReport(reportId, action, note);
      if (res.success) {
        setReports((prev) => prev.filter((r) => r._id !== reportId));
      }
    } catch (err) {
      alert(`Report action failed: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  if (!isModerator) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-14 h-14 rounded-3xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto shadow-glow-coral">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-black text-white font-display">Restricted Console</h2>
        <p className="text-xs text-slate-400">
          This dashboard requires Moderator permissions. Switch to the Moderator demo role in the navigation bar.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-slab border border-amber-500/30 text-amber-300 text-xs font-bold tracking-wide shadow-glow-amber/20">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>Campus Safety & Content Review Queue</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white font-display">
            Moderator Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Review Gemini 3.8 AI risk screening diagnostics, resolve user reports, and maintain constructive campus guidelines.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold glass-slab text-slate-200 hover:text-white transition-all shadow-md"
        >
          <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Tabs Segment */}
      <div className="flex items-center gap-3 border-b border-white/10 pb-3 text-xs">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold transition-all ${
            activeTab === 'pending'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-400/50 shadow-glow-amber'
              : 'glass-slab text-slate-400 hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Pending Submissions ({pendingData.posts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold transition-all ${
            activeTab === 'reports'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-400/50 shadow-glow-coral'
              : 'glass-slab text-slate-400 hover:text-white'
          }`}
        >
          <Flag className="w-4 h-4" />
          <span>User Reports ({reports.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold transition-all ${
            activeTab === 'logs'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/50 shadow-glow-violet'
              : 'glass-slab text-slate-400 hover:text-white'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Audit Log History</span>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400 space-y-3 font-mono">
          <div className="w-9 h-9 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p>Analyzing queue...</p>
        </div>
      ) : activeTab === 'pending' ? (
        <div className="space-y-6">
          {pendingData.posts.length === 0 ? (
            <div className="glass-slab rounded-3xl p-14 text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto shadow-glow-mint" />
              <h3 className="text-xl font-bold text-white font-display">Queue Clear</h3>
              <p className="text-xs text-slate-400">All submissions have been triaged by AI and moderators.</p>
            </div>
          ) : (
            pendingData.posts.map((post) => (
              <div
                key={post._id}
                className="glass-slab rounded-3xl p-6 sm:p-7 border border-white/10 space-y-5 shadow-2xl relative overflow-hidden"
              >
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-xs text-slate-200">
                      Author: <strong className="text-emerald-400">{post.pseudonym}</strong>
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-500 text-xs font-mono">
                      {new Date(post.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <CategoryBadge category={post.category} />
                    <StatusBadge status={post.status} />
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-white font-display">{post.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line bg-black/40 p-4 rounded-2xl border border-white/5 font-normal">
                    {post.body}
                  </p>
                </div>

                {/* AI Diagnostics Box */}
                {post.aiAnalysis && (
                  <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-200 flex items-center gap-2 font-display">
                        <Bot className="w-4 h-4 text-emerald-400" />
                        <span>Gemini 3.8 Flash Threat Diagnostics</span>
                      </span>
                      <span
                        className={`font-mono font-black px-3 py-1 rounded-full text-[11px] ${
                          post.aiAnalysis.overallRisk === 'LOW'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                            : post.aiAnalysis.overallRisk === 'MEDIUM'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow-glow-amber'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-400/40 shadow-glow-coral'
                        }`}
                      >
                        {post.aiAnalysis.overallRisk} RISK
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
                      <div className="p-2 rounded-xl bg-white/5 flex justify-between">
                        <span className="text-slate-400">Toxicity:</span>
                        <span className="text-white font-bold">{Math.round((post.aiAnalysis.toxicity || 0) * 100)}%</span>
                      </div>
                      <div className="p-2 rounded-xl bg-white/5 flex justify-between">
                        <span className="text-slate-400">Harass:</span>
                        <span className="text-white font-bold">{Math.round((post.aiAnalysis.harassment || 0) * 100)}%</span>
                      </div>
                      <div className="p-2 rounded-xl bg-white/5 flex justify-between">
                        <span className="text-slate-400">Spam:</span>
                        <span className="text-white font-bold">{Math.round((post.aiAnalysis.spam || 0) * 100)}%</span>
                      </div>
                      <div className="p-2 rounded-xl bg-white/5 flex justify-between">
                        <span className="text-slate-400">Threat:</span>
                        <span className="text-white font-bold">{Math.round((post.aiAnalysis.threat || 0) * 100)}%</span>
                      </div>
                    </div>

                    {post.aiAnalysis.reasoning && (
                      <div className="text-xs text-slate-300 bg-white/5 p-2.5 rounded-xl border border-white/5">
                        <strong className="text-slate-400 block mb-0.5">Model Reasoning:</strong>
                        {post.aiAnalysis.reasoning}
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/5">
                  <input
                    type="text"
                    value={actionNotes[post._id] || ''}
                    onChange={(e) =>
                      setActionNotes({ ...actionNotes, [post._id]: e.target.value })
                    }
                    placeholder="Internal reviewer notes..."
                    className="w-full sm:w-80 px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />

                  <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => handlePostAction(post._id, 'reject')}
                      disabled={processingId === post._id}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-rose-300 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 transition-colors"
                    >
                      Reject Content
                    </button>
                    <button
                      onClick={() => handlePostAction(post._id, 'approve')}
                      disabled={processingId === post._id}
                      className="btn-primary-vibrant px-5 py-2 rounded-xl text-xs font-black tracking-wide"
                    >
                      Approve & Publish
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : activeTab === 'reports' ? (
        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="glass-slab rounded-3xl p-14 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="text-xl font-bold text-white font-display">No Flagged Reports</h3>
              <p className="text-xs text-slate-400">All community reports have been addressed.</p>
            </div>
          ) : (
            reports.map((report) => (
              <div
                key={report._id}
                className="glass-slab rounded-3xl p-6 border border-white/10 space-y-4 shadow-xl"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-rose-400 uppercase tracking-widest px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30">
                    Reason: {report.reason}
                  </span>
                  <span className="text-slate-500 font-mono text-[11px]">
                    Reported: {new Date(report.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {report.reporterNotes && (
                  <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 text-xs text-slate-200">
                    <strong className="text-slate-400 block mb-1">Student Context:</strong>
                    "{report.reporterNotes}"
                  </div>
                )}

                {report.targetContent && (
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-xs space-y-1">
                    <span className="text-slate-400 font-mono text-[10px] uppercase">Targeted Content Preview:</span>
                    <div className="text-white font-bold text-sm">{report.targetContent.title || 'Comment Body'}</div>
                    <div className="text-slate-300">{report.targetContent.body}</div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/5">
                  <button
                    onClick={() => handleReportAction(report._id, 'dismiss')}
                    disabled={processingId === report._id}
                    className="px-4 py-2 rounded-xl text-xs font-bold glass-slab text-slate-300 hover:text-white"
                  >
                    Dismiss Report
                  </button>
                  <button
                    onClick={() => handleReportAction(report._id, 'action_taken')}
                    disabled={processingId === report._id}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-glow-coral"
                  >
                    Action & Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="glass-slab rounded-3xl p-6 border border-white/10 space-y-4">
          <h3 className="text-base font-black text-white font-display">
            Moderator Action Audit Trail
          </h3>
          <div className="space-y-2">
            {logs.map((log) => (
              <div
                key={log._id}
                className="p-3.5 rounded-2xl bg-black/40 border border-white/5 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="space-y-0.5">
                  <div className="font-bold text-white">
                    {log.moderatorEmail} <span className="text-emerald-400 font-mono">[{log.action}]</span>
                  </div>
                  <div className="text-slate-400 text-[11px]">{log.reason || 'Routine moderation action'}</div>
                </div>
                <div className="text-slate-500 font-mono text-[11px]">
                  {new Date(log.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
