import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Users,
  Shield,
  Bot,
  RefreshCw,
  Search,
  Lock,
  Layers,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboardPage() {
  const { user, isAdmin } = useAuth();

  const [metrics, setMetrics] = useState(null);
  const [pulse, setPulse] = useState(null);
  const [recurringIssues, setRecurringIssues] = useState([]);
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [mRes, pRes, rRes, uRes] = await Promise.all([
        api.getSystemMetrics(),
        api.getCampusPulse(),
        api.getRecurringIssues(),
        api.getUsers({ search: userSearch || undefined }),
      ]);

      if (mRes.success) setMetrics(mRes.data);
      if (pRes.success) setPulse(pRes.data);
      if (rRes.success) setRecurringIssues(rRes.data);
      if (uRes.success) setUsers(uRes.data);
    } catch (err) {
      console.error('Failed to load admin telemetry:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [userSearch]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await api.updateUserRole(userId, newRole);
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
        );
      }
    } catch (err) {
      alert(`Failed to update role: ${err.message}`);
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    const targetStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      const res = await api.updateUserStatus(userId, targetStatus);
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, status: targetStatus } : u))
        );
      }
    } catch (err) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-14 h-14 rounded-3xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto shadow-glow-violet">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-black text-white font-display">Administrator Access Required</h2>
        <p className="text-xs text-slate-400">
          This portal is restricted to Campus Administrators. Switch to the Admin role in the navbar.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-slab border border-indigo-500/30 text-indigo-300 text-xs font-bold tracking-wide shadow-glow-violet/20">
            <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Campus Health Telemetry & Governance</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white font-display">
            Executive Admin Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Monitor campus pulse sentiment, detect recurring facility issues, and administer accounts.
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold glass-slab text-slate-200 hover:text-white transition-all shadow-md"
        >
          <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* KPI Stats Slabs */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          <div className="glass-slab rounded-3xl p-6 border border-white/10 space-y-2 hover:border-indigo-500/40 transition-all">
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider font-mono">User Base</div>
            <div className="text-4xl font-black text-white font-display">{metrics.totalUsers}</div>
            <div className="text-[11px] text-indigo-400 font-medium">Verified accounts</div>
          </div>

          <div className="glass-slab rounded-3xl p-6 border border-white/10 space-y-2 hover:border-cyan-500/40 transition-all">
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider font-mono">Issues Filed</div>
            <div className="text-4xl font-black text-cyan-300 font-display">{metrics.totalPosts}</div>
            <div className="text-[11px] text-cyan-400 font-medium">{metrics.seriousIssues} serious grievances</div>
          </div>

          <div className="glass-slab rounded-3xl p-6 border border-white/10 space-y-2 hover:border-emerald-500/40 transition-all">
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider font-mono">Resolution Rate</div>
            <div className="text-4xl font-black text-emerald-300 font-display">
              {metrics.resolutionRate}%
            </div>
            <div className="text-[11px] text-emerald-400 font-medium">{metrics.resolvedPosts} verified resolutions</div>
          </div>

          <div className="glass-slab rounded-3xl p-6 border border-white/10 space-y-2 hover:border-amber-500/40 transition-all">
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider font-mono">Active Triage</div>
            <div className="text-4xl font-black text-amber-300 font-display">
              {metrics.underReviewPosts + metrics.pendingReports}
            </div>
            <div className="text-[11px] text-amber-400 font-medium">Items awaiting moderation</div>
          </div>
        </div>
      )}

      {/* Analytics & Recurring Issues Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: AI Executive Briefing */}
        <div className="lg:col-span-1 glass-slab rounded-3xl p-6 border border-white/10 space-y-5 shadow-2xl">
          <div className="flex items-center gap-2.5 text-emerald-400 font-bold font-display text-sm pb-2 border-b border-white/10">
            <Bot className="w-5 h-5" />
            <span>AI Executive Briefing</span>
          </div>

          {pulse?.aiSummary ? (
            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <p className="bg-black/40 p-4 rounded-2xl border border-white/5 font-normal">
                {pulse.aiSummary.summary}
              </p>

              <div className="space-y-3 pt-2">
                <span className="font-mono font-bold text-white text-xs uppercase tracking-widest block">
                  Sentiment Spectrum
                </span>
                {Object.entries(pulse.sentiments || {}).map(([key, val]) => (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-400">{key}</span>
                      <span className="text-white font-mono">{val}%</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden p-0.5 border border-white/5">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-teal-400 h-full rounded-full"
                        style={{ width: `${val}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400">Loading AI telemetry...</p>
          )}
        </div>

        {/* Right: Recurring Campus Issue Clusters */}
        <div className="lg:col-span-2 glass-slab rounded-3xl p-6 border border-white/10 space-y-5 shadow-2xl">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2 text-white font-bold font-display text-base">
              <Layers className="w-5 h-5 text-cyan-400" />
              <span>Detected Recurring Campus Issues</span>
            </div>
            <span className="text-[10px] font-mono text-cyan-300 font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30">
              Clustered by Gemini NLP
            </span>
          </div>

          <div className="space-y-3">
            {recurringIssues.map((cluster) => (
              <div
                key={cluster._id}
                className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-2.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white font-display text-base">
                    {cluster.title}
                  </span>
                  <span className="px-3 py-1 rounded-full font-mono text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    {cluster.recurrenceCount} Reports
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  {cluster.summary}
                </p>

                {cluster.actionableAdvice && (
                  <div className="text-xs text-emerald-300 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 font-medium">
                    <strong className="block text-emerald-200 mb-0.5 font-bold">Recommended Administration Action:</strong>
                    {cluster.actionableAdvice}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Management Island Table */}
      <div className="glass-slab rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5 text-white font-bold font-display text-lg">
            <Users className="w-6 h-6 text-emerald-400" />
            <span>User Account Administration ({users.length})</span>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Search by student email..."
              className="w-full pl-10 pr-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-400"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-white/5 text-slate-400 uppercase font-mono text-[10px] tracking-widest border-b border-white/5">
              <tr>
                <th className="py-3.5 px-4">User Account</th>
                <th className="py-3.5 px-4">Department / Year</th>
                <th className="py-3.5 px-4">Assigned Role</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white">
                    {u.email}
                    {u._id === user?.id && (
                      <span className="text-[10px] text-indigo-400 font-mono ml-2 font-bold">(You)</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {u.department} • {u.academicYear}
                  </td>
                  <td className="py-3.5 px-4">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      disabled={u._id === user?.id}
                      className="bg-black/50 border border-white/10 text-slate-100 text-xs rounded-xl px-2.5 py-1 focus:outline-none focus:border-indigo-400 disabled:opacity-40"
                    >
                      <option value="student">Student</option>
                      <option value="moderator">Moderator</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${
                        u.status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleStatusToggle(u._id, u.status)}
                      disabled={u._id === user?.id}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all disabled:opacity-30 ${
                        u.status === 'active'
                          ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30 hover:bg-rose-500/20'
                          : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20'
                      }`}
                    >
                      {u.status === 'active' ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
