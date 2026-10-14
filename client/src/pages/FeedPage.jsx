import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Flame,
  Clock,
  ThumbsUp,
  MessageSquare,
  CheckCircle2,
  Filter,
  Search,
  AlertOctagon,
  Sparkles,
  Shield,
  ChevronLeft,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { api } from '../services/api';
import PostCard from '../components/posts/PostCard';

const CATEGORIES = [
  'All',
  'Academics',
  'Faculty',
  'Hostel',
  'Mess',
  'Infrastructure',
  'Administration',
  'Events',
  'General',
];

const SORT_OPTIONS = [
  { id: 'trending', label: 'Trending', icon: Flame },
  { id: 'latest', label: 'Latest', icon: Clock },
  { id: 'top', label: 'Top Voted', icon: ThumbsUp },
  { id: 'discussed', label: 'Discussed', icon: MessageSquare },
];

export default function FeedPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const currentCategory = searchParams.get('category') || 'All';
  const currentSort = searchParams.get('sort') || 'trending';
  const currentStatus = searchParams.get('status') || '';
  const currentSerious = searchParams.get('serious') === 'true';
  const currentPage = parseInt(searchParams.get('page')) || 1;
  const currentSearch = searchParams.get('q') || '';

  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(currentSearch);
  const [pulseData, setPulseData] = useState(null);

  useEffect(() => {
    async function fetchFeed() {
      setLoading(true);
      try {
        const queryParams = {
          category: currentCategory === 'All' ? undefined : currentCategory,
          sort: currentSort,
          status: currentStatus || undefined,
          isSeriousIssue: currentSerious ? 'true' : undefined,
          page: currentPage,
          limit: 10,
          search: currentSearch || undefined,
        };

        const [postsRes, pulseRes] = await Promise.all([
          api.getPosts(queryParams),
          api.getCampusPulse(),
        ]);

        if (postsRes.success) {
          setPosts(postsRes.data);
          setPagination(postsRes.pagination);
        }
        if (pulseRes.success) {
          setPulseData(pulseRes.data);
        }
      } catch (err) {
        console.error('Failed to load feed:', err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchFeed();
  }, [currentCategory, currentSort, currentStatus, currentSerious, currentPage, currentSearch]);

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === undefined || value === null || value === '' || value === 'All' || value === false) {
      newParams.delete(key);
    } else {
      newParams.set(key, value.toString());
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateFilter('q', searchInput);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Category Pills Slider */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isSelected = currentCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => updateFilter('category', cat)}
              className={`shrink-0 px-4 py-2 rounded-2xl text-xs font-bold tracking-wide transition-all duration-200 ${
                isSelected
                  ? 'bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 shadow-glow-mint scale-105'
                  : 'glass-slab text-slate-300 hover:text-white hover:border-emerald-500/40'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Feed Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Controls: Search, Sort Tabs, Serious Toggle */}
          <div className="glass-slab rounded-3xl p-5 border border-white/10 space-y-4 shadow-xl">
            {/* Search Input Bar */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="w-4 h-4 text-emerald-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search campus discussions by keywords (e.g. WiFi, water heater, mess food)..."
                className="w-full pl-11 pr-24 py-3 rounded-2xl bg-black/40 border border-white/10 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50 transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-xl text-xs font-bold btn-primary-vibrant"
              >
                Search
              </button>
            </form>

            {/* Sub-Filters: Sort Tabs & Serious Issues Checkbox */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5">
              <div className="flex items-center gap-1 bg-black/40 p-1.5 rounded-2xl border border-white/5">
                {SORT_OPTIONS.map((sort) => {
                  const Icon = sort.icon;
                  const isActive = currentSort === sort.id;
                  return (
                    <button
                      key={sort.id}
                      onClick={() => updateFilter('sort', sort.id)}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-white/10 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : ''}`} />
                      <span>{sort.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-3">
                {/* Resolved Status Toggle */}
                <button
                  type="button"
                  onClick={() => updateFilter('status', currentStatus === 'resolved' ? '' : 'resolved')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    currentStatus === 'resolved'
                      ? 'bg-indigo-500/25 text-indigo-200 border-indigo-400/50 shadow-[0_0_15px_rgba(99,102,241,0.25)]'
                      : 'bg-black/30 border-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Resolved Only</span>
                </button>

                {/* Serious Issues Toggle */}
                <label className="flex items-center gap-2 cursor-pointer select-none bg-black/30 border border-white/5 px-3 py-1.5 rounded-xl">
                  <input
                    type="checkbox"
                    checked={currentSerious}
                    onChange={(e) => updateFilter('serious', e.target.checked)}
                    className="rounded border-slate-700 bg-slate-950 text-rose-500 focus:ring-rose-500"
                  />
                  <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                    <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
                    <span>Serious Only</span>
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Posts Feed */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="glass-slab rounded-3xl p-6 animate-pulse space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/10" />
                    <div className="h-4 w-32 bg-white/10 rounded" />
                  </div>
                  <div className="h-6 w-3/4 bg-white/10 rounded" />
                  <div className="h-14 w-full bg-white/5 rounded" />
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="glass-slab rounded-3xl p-14 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mx-auto text-slate-400">
                <Filter className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-white font-display">
                No matching discussions
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No active issues match the selected filters. Be the first to bring this campus topic forward!
              </p>
              <Link
                to="/create"
                className="btn-primary-vibrant inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>CREATE FIRST POST</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-white/5">
              <button
                onClick={() => updateFilter('page', currentPage - 1)}
                disabled={currentPage <= 1}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold glass-slab text-slate-300 hover:text-white disabled:opacity-30 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <span className="text-xs text-slate-400 font-mono font-semibold">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
              </span>

              <button
                onClick={() => updateFilter('page', currentPage + 1)}
                disabled={currentPage >= pagination.totalPages}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold glass-slab text-slate-300 hover:text-white disabled:opacity-30 transition-all"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Right Sidebar Column */}
        <div className="space-y-6">
          {/* Post Creation Glowing Card */}
          <div className="glass-slab rounded-3xl p-6 border border-emerald-500/30 space-y-4 shadow-glow-mint/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center gap-2.5 text-emerald-400 font-bold font-display text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Campus Whistleblowing</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Every post is protected by mathematical identity isolation. Real student accounts are never exposed to professors or peer students.
            </p>

            <Link
              to="/create"
              className="btn-primary-vibrant w-full py-3 rounded-2xl font-black text-xs tracking-wider flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>CREATE ANONYMOUS POST</span>
            </Link>
          </div>

          {/* Campus Pulse Sentiment Mini-Widget */}
          {pulseData && (
            <div className="glass-slab rounded-3xl p-6 border border-white/10 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <span className="text-xs font-black text-white font-display flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>Campus Sentiment</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 font-bold">
                  Gemini AI
                </span>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-400">Frustrated (Action Needed)</span>
                    <span className="text-amber-400 font-mono font-bold">{pulseData.sentiments.Frustrated || 40}%</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden p-0.5 border border-white/5">
                    <div className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full shadow-glow-amber" style={{ width: `${pulseData.sentiments.Frustrated || 40}%` }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-400">Constructive Recommendations</span>
                    <span className="text-emerald-400 font-mono font-bold">{pulseData.sentiments.Constructive || 35}%</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden p-0.5 border border-white/5">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full shadow-glow-mint" style={{ width: `${pulseData.sentiments.Constructive || 35}%` }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-400">Urgent Safety / Hazard</span>
                    <span className="text-rose-400 font-mono font-bold">{pulseData.sentiments.Urgent || 15}%</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden p-0.5 border border-white/5">
                    <div className="bg-gradient-to-r from-rose-500 to-red-500 h-full rounded-full shadow-glow-coral" style={{ width: `${pulseData.sentiments.Urgent || 15}%` }} />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 text-[11px] text-slate-400 font-medium">
                Administration Fix Rate: <strong className="text-cyan-300 font-bold">{pulseData.resolutionStats.rate}%</strong> resolved.
              </div>
            </div>
          )}

          {/* Community Guidelines Card */}
          <div className="glass-slab rounded-3xl p-6 border border-white/10 space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-widest font-mono">
              Code of Conduct
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Focus on systemic facilities, hygiene, and campus rules.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">✕</span>
                <span>No targeted personal doxxing or individual insults.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">!</span>
                <span>Automated AI moderation catches toxic flags in real-time.</span>
              </li>
            </ul>
            <Link
              to="/guidelines"
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 block pt-1"
            >
              Read Community Standards & Appeals →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
