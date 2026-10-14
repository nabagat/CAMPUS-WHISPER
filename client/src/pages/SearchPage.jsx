import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, AlertOctagon, CheckCircle2, Flame, Clock, ThumbsUp, MessageSquare, Sparkles, X, SlidersHorizontal } from 'lucide-react';
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

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [tag, setTag] = useState(searchParams.get('tag') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'trending');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [seriousOnly, setSeriousOnly] = useState(searchParams.get('serious') === 'true');

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const executeSearch = async () => {
    setLoading(true);
    try {
      const params = {
        search: query.trim() || undefined,
        category: category !== 'All' ? category : undefined,
        tag: tag.trim() || undefined,
        sort,
        status: status || undefined,
        isSeriousIssue: seriousOnly ? 'true' : undefined,
        limit: 30,
      };

      const res = await api.getPosts(params);
      if (res.success) {
        setResults(res.data);
        setTotal(res.pagination.total);
      }
    } catch (err) {
      console.error('Search failed:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    executeSearch();
  }, [category, sort, status, seriousOnly, tag]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    executeSearch();
  };

  const handleClear = () => {
    setQuery('');
    setCategory('All');
    setTag('');
    setStatus('');
    setSeriousOnly(false);
  };

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Ambient Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Header Section */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Real-time Semantic & Keyword Discovery</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight font-display">
          Search Campus <span className="text-gradient-aurora">Discussions</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl font-medium">
          Query resolved grievances, infrastructure outages, syllabus bottlenecks, mess feedback, and active campus debates.
        </p>
      </div>

      {/* Search Input Card */}
      <div className="glass-slab rounded-3xl p-6 border border-white/10 shadow-2xl space-y-6">
        <form onSubmit={handleFormSubmit} className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/40 via-cyan-500/40 to-violet-500/40 rounded-2xl blur opacity-30 group-focus-within:opacity-75 transition duration-300" />
          <div className="relative flex items-center bg-slate-950/90 rounded-2xl border border-white/10 overflow-hidden">
            <Search className="w-5 h-5 text-slate-400 ml-4 shrink-0 group-focus-within:text-emerald-400 transition-colors" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search topics, course numbers, dorms, mess menus, or campus keywords..."
              className="w-full px-4 py-4 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none font-medium"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="p-1.5 mr-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              className="m-2 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 btn-primary-vibrant shrink-0"
            >
              Search
            </button>
          </div>
        </form>

        {/* Category Filter Pills */}
        <div className="space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Filter by Category</span>
            {(category !== 'All' || tag || seriousOnly || status) && (
              <button
                onClick={handleClear}
                className="text-emerald-400 hover:text-emerald-300 text-[11px] font-bold flex items-center gap-1"
              >
                <span>Reset All Filters</span>
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const active = category === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    active
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-glow-mint'
                      : 'bg-slate-900/80 text-slate-300 border border-white/5 hover:border-white/20 hover:text-white'
                  }`}
                >
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Extended Control Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/10 text-xs font-medium">
          {/* Sort By */}
          <div className="space-y-1.5">
            <label className="text-slate-400 font-bold uppercase tracking-wider text-[11px] block">Sort By</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-950/90 border border-white/10 text-slate-200 focus:outline-none focus:border-emerald-400 font-medium"
            >
              <option value="trending">🔥 Trending Velocity</option>
              <option value="latest">⏱️ Most Recent</option>
              <option value="top">👍 Highest Upvoted</option>
              <option value="discussed">💬 Most Discussed</option>
            </select>
          </div>

          {/* Resolution Status */}
          <div className="space-y-1.5">
            <label className="text-slate-400 font-bold uppercase tracking-wider text-[11px] block">Lifecycle Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-950/90 border border-white/10 text-slate-200 focus:outline-none focus:border-emerald-400 font-medium"
            >
              <option value="">All Statuses</option>
              <option value="active">Active Community Issues</option>
              <option value="resolved">Resolved by Administration</option>
            </select>
          </div>

          {/* Tag Filter Info */}
          <div className="space-y-1.5">
            <label className="text-slate-400 font-bold uppercase tracking-wider text-[11px] block">Active Hashtag</label>
            <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-950/90 border border-white/10 text-slate-300">
              <span className="text-emerald-400 font-mono font-bold">{tag ? `#${tag}` : 'None active'}</span>
              {tag && (
                <button
                  onClick={() => setTag('')}
                  className="ml-auto text-slate-500 hover:text-rose-400 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Serious Toggle */}
          <div className="flex flex-col justify-end">
            <label className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
              seriousOnly 
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 shadow-glow-coral' 
                : 'bg-slate-950/90 border-white/10 text-slate-400 hover:text-slate-200'
            }`}>
              <input
                type="checkbox"
                checked={seriousOnly}
                onChange={(e) => setSeriousOnly(e.target.checked)}
                className="rounded border-white/20 bg-slate-950 text-rose-500 focus:ring-rose-500"
              />
              <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="font-bold text-xs">Serious Issues Only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-medium">
        <span>
          Showing <strong className="text-white font-bold">{results.length}</strong> matching discussions {total > results.length && `(of ${total} total)`}
        </span>
        <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Real-time Live Sync</span>
        </span>
      </div>

      {/* Results List */}
      {loading ? (
        <div className="glass-slab rounded-3xl p-16 text-center text-xs text-slate-400 space-y-3">
          <div className="w-10 h-10 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto shadow-glow-mint" />
          <p className="font-medium text-slate-300">Searching confidential campus index...</p>
        </div>
      ) : results.length === 0 ? (
        <div className="glass-slab rounded-3xl p-16 text-center space-y-4 border border-white/10">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center mx-auto text-slate-400 shadow-inner">
            <Search className="w-7 h-7 text-slate-500" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white font-display">No Discussions Match Your Query</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Try broader keywords, switch categories to "All", or disable the "Serious Issues Only" filter.
            </p>
          </div>
          <button
            onClick={handleClear}
            className="px-4 py-2 rounded-xl text-xs font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
          >
            Clear All Search Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
