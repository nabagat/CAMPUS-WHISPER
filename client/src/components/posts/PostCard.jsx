import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquare,
  Eye,
  Share2,
  Flag,
  AlertOctagon,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import VoteButtons from './VoteButtons';
import CategoryBadge from '../common/CategoryBadge';
import StatusBadge from '../common/StatusBadge';
import ReportModal from './ReportModal';
import AIModerationBadge from './AIModerationBadge';
import { useAuth } from '../../context/AuthContext';

export default function PostCard({ post, onVoteChange }) {
  const { isModerator } = useAuth();
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!post) return null;

  let avatar = { initials: 'CV', bgColor: '#10b981' };
  try {
    if (post.pseudonymAvatar) {
      avatar = typeof post.pseudonymAvatar === 'string'
        ? JSON.parse(post.pseudonymAvatar)
        : post.pseudonymAvatar;
    }
  } catch (_) {}

  const formatDate = (dateString) => {
    if (!dateString) return 'recently';
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now - date) / (1000 * 60 * 60));
    if (diffHours < 1) return 'just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/post/${post._id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <article className="glass-card rounded-3xl p-5 sm:p-6 border border-white/10 hover:border-emerald-500/40 transition-all duration-300 relative group overflow-hidden">
        {/* Subtle hover gradient background bloom */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        <div className="flex items-start gap-4 sm:gap-5">
          {/* Voting Column */}
          <div className="shrink-0 pt-0.5">
            <VoteButtons
              targetId={post._id}
              targetType="post"
              initialScore={post.score}
              initialUserVote={post.userVote}
              onVoteChange={onVoteChange}
            />
          </div>

          {/* Main Card Content */}
          <div className="flex-1 min-w-0 space-y-3">
            {/* Header: Author Pseudonym & Badges */}
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs text-white shadow-md border border-white/20"
                  style={{
                    backgroundColor: avatar.bgColor || '#10b981',
                    boxShadow: `0 0 15px -2px ${avatar.bgColor || '#10b981'}66`,
                  }}
                >
                  {avatar.initials || 'CV'}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-100 tracking-tight flex items-center gap-1">
                    {post.pseudonym}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {formatDate(post.createdAt)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {post.isSeriousIssue && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-glow-coral/40 animate-pulse">
                    <AlertOctagon className="w-3.5 h-3.5" />
                    <span>SERIOUS ISSUE</span>
                  </span>
                )}
                <CategoryBadge category={post.category} />
                <StatusBadge status={post.status} />
                {isModerator && post.aiAnalysis && (
                  <AIModerationBadge analysis={post.aiAnalysis} isModerator={true} />
                )}
              </div>
            </div>

            {/* Post Title */}
            <Link to={`/post/${post._id}`} className="block group/title">
              <h2 className="text-lg sm:text-xl font-bold text-white group-hover/title:text-emerald-300 transition-colors leading-snug line-clamp-2 flex items-start justify-between gap-2 font-display">
                <span>{post.title}</span>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover/title:text-emerald-400 group-hover/title:translate-x-0.5 group-hover/title:-translate-y-0.5 transition-transform shrink-0 mt-1" />
              </h2>
            </Link>

            {/* Snippet */}
            <p className="text-xs sm:text-sm text-slate-300/90 line-clamp-2 leading-relaxed font-normal">
              {post.body}
            </p>

            {/* Resolution Banner */}
            {post.status === 'resolved' && post.resolutionNote && (
              <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-xs text-indigo-200 flex items-start gap-2.5 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-indigo-300 font-bold block mb-0.5">Resolved by Campus Administration:</strong>
                  {post.resolutionNote}
                </div>
              </div>
            )}

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/search?tag=${encodeURIComponent(tag.replace('#', ''))}`}
                    className="text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-emerald-300 hover:border-emerald-500/40 transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Footer Metadata & Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs text-slate-400">
              <div className="flex items-center gap-5">
                <Link
                  to={`/post/${post._id}`}
                  className="flex items-center gap-1.5 hover:text-emerald-300 transition-colors font-semibold"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{post.commentCount || 0} discussion</span>
                </Link>
                <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px]">
                  <Eye className="w-3 h-3" />
                  <span>{post.viewCount || 0} views</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleShare}
                  className="p-1.5 rounded-xl hover:text-slate-100 hover:bg-white/5 transition-colors flex items-center gap-1 text-xs"
                  title="Share link"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{copied ? 'Copied' : 'Share'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setReportModalOpen(true)}
                  className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-white/5 transition-colors"
                  title="Report post"
                >
                  <Flag className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </article>

      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        targetId={post._id}
        targetType="post"
        title={post.title}
      />
    </>
  );
}
