import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  Eye,
  MessageSquare,
  Share2,
  Flag,
  CheckCircle2,
  AlertOctagon,
  Trash2,
  CornerDownRight,
  Send,
  Sparkles,
  Shield,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import VoteButtons from '../components/posts/VoteButtons';
import CategoryBadge from '../components/common/CategoryBadge';
import StatusBadge from '../components/common/StatusBadge';
import ReportModal from '../components/posts/ReportModal';

export default function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isModerator } = useAuth();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentInput, setCommentInput] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [resolutionNote, setResolutionNote] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchPostAndComments() {
      setLoading(true);
      try {
        const [postRes, commentRes] = await Promise.all([
          api.getPostById(id),
          api.getComments(id),
        ]);

        if (postRes.success) {
          setPost(postRes.data);
        }
        if (commentRes.success) {
          setComments(commentRes.data);
        }
      } catch (err) {
        console.error('Error fetching post:', err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchPostAndComments();
  }, [id]);

  const handleAddComment = async (parentId = null) => {
    if (!isAuthenticated) {
      alert('Please log in with any student or demo account to comment.');
      return;
    }

    if (!commentInput.trim()) return;

    try {
      setSubmittingComment(true);
      const res = await api.addComment(id, commentInput.trim(), parentId);
      if (res.success) {
        setCommentInput('');
        setReplyingTo(null);
        const freshComments = await api.getComments(id);
        if (freshComments.success) setComments(freshComments.data);
      }
    } catch (err) {
      alert(`Error submitting comment: ${err.message}`);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await api.deletePost(id);
      alert('Post deleted successfully.');
      navigate('/feed');
    } catch (err) {
      alert(`Failed to delete post: ${err.message}`);
    }
  };

  const handleResolvePost = async (e) => {
    e.preventDefault();
    try {
      const res = await api.resolvePost(id, resolutionNote);
      if (res.success) {
        setPost((prev) => ({
          ...prev,
          status: 'resolved',
          resolutionNote: resolutionNote || 'Marked as resolved by administration.',
        }));
        setResolveModalOpen(false);
      }
    } catch (err) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-10 h-10 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400 font-mono">Decoupling and loading discussion...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white font-display">Post Not Found</h2>
        <p className="text-xs text-slate-400">The requested post does not exist or has been removed.</p>
        <Link
          to="/feed"
          className="btn-primary-vibrant inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Feed</span>
        </Link>
      </div>
    );
  }

  let avatar = { initials: 'CV', bgColor: '#10b981' };
  try {
    if (post.pseudonymAvatar) {
      avatar = typeof post.pseudonymAvatar === 'string'
        ? JSON.parse(post.pseudonymAvatar)
        : post.pseudonymAvatar;
    }
  } catch (_) {}

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Nav Back & Moderator Tools */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Discussions</span>
        </button>

        <div className="flex items-center gap-2">
          {isModerator && post.status !== 'resolved' && (
            <button
              onClick={() => setResolveModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-500/20 text-indigo-200 border border-indigo-500/40 hover:bg-indigo-500/30 transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)]"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mark Resolved</span>
            </button>
          )}

          {(post.isOwner || isModerator) && (
            <button
              onClick={handleDeletePost}
              className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-white/5 transition-colors"
              title="Delete post"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Post Slab */}
      <article className="glass-slab rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm text-white shadow-lg border border-white/20"
              style={{
                backgroundColor: avatar.bgColor || '#10b981',
                boxShadow: `0 0 20px -2px ${avatar.bgColor || '#10b981'}88`,
              }}
            >
              {avatar.initials || 'CV'}
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>{post.pseudonym}</span>
                {post.isOwner && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/30">
                    You (Author)
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-2 font-mono mt-0.5">
                <Clock className="w-3 h-3 text-slate-500" />
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3 text-slate-500" />
                  {post.viewCount || 1} views
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {post.isSeriousIssue && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-500/25 text-rose-300 border border-rose-500/40 shadow-glow-coral/40">
                <AlertOctagon className="w-3.5 h-3.5" />
                <span>SERIOUS ISSUE</span>
              </span>
            )}
            <CategoryBadge category={post.category} size="md" />
            <StatusBadge status={post.status} />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-4xl font-black text-white font-display leading-tight">
          {post.title}
        </h1>

        {/* Resolution Banner */}
        {post.status === 'resolved' && (
          <div className="p-4 rounded-2xl bg-indigo-500/15 border border-indigo-400/30 text-xs text-indigo-200 flex items-start gap-3 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
            <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="text-indigo-200 font-bold text-sm block">Resolved by Campus Administration:</strong>
              <p className="leading-relaxed font-normal">{post.resolutionNote || 'This issue has been reviewed and addressed.'}</p>
            </div>
          </div>
        )}

        {/* Body Text */}
        <div className="text-slate-200 text-sm sm:text-base leading-relaxed whitespace-pre-line font-normal">
          {post.body}
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap pt-2">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                to={`/search?tag=${encodeURIComponent(tag.replace('#', ''))}`}
                className="text-xs font-mono font-medium px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-emerald-300 hover:border-emerald-500/40 transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <VoteButtons
            targetId={post._id}
            targetType="post"
            initialScore={post.score}
            initialUserVote={post.userVote}
            orientation="horizontal"
          />

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copied ? 'Link Copied!' : 'Share'}</span>
            </button>
            <button
              onClick={() => setReportTarget({ id: post._id, type: 'post', title: post.title })}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-white/5 transition-colors"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>Report</span>
            </button>
          </div>
        </div>
      </article>

      {/* Discussion Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-black text-white font-display flex items-center gap-2.5">
          <MessageSquare className="w-6 h-6 text-emerald-400" />
          <span>Anonymous Discussion ({comments.length})</span>
        </h2>

        {/* Root Comment Box */}
        <div className="glass-slab rounded-3xl p-5 border border-white/10 space-y-3 shadow-xl">
          <textarea
            value={replyingTo ? '' : commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            disabled={replyingTo !== null}
            placeholder={
              isAuthenticated
                ? "Join the discussion anonymously... (AI screens for abuse and safety)"
                : "Select any student or demo account to comment anonymously."
            }
            rows={3}
            className="w-full px-4 py-3 rounded-2xl bg-black/40 border border-white/10 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50 resize-none disabled:opacity-40 transition-all"
          />

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 text-[11px] flex items-center gap-1.5 font-medium">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Your email and identity are completely withheld</span>
            </span>

            <button
              onClick={() => handleAddComment(null)}
              disabled={submittingComment || !commentInput.trim() || replyingTo !== null}
              className="btn-primary-vibrant flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-black disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submittingComment ? 'Posting...' : 'Post Comment'}</span>
            </button>
          </div>
        </div>

        {/* Comments Tree */}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <div className="glass-slab rounded-2xl p-10 text-center text-xs text-slate-400">
              No comments yet. Share your experience or a constructive solution!
            </div>
          ) : (
            comments.map((comment) => (
              <CommentItem
                key={comment._id}
                comment={comment}
                postId={post._id}
                replyingTo={replyingTo}
                setReplyingTo={setReplyingTo}
                onReplySubmitted={async () => {
                  const fresh = await api.getComments(id);
                  if (fresh.success) setComments(fresh.data);
                }}
                onReport={(target) => setReportTarget(target)}
              />
            ))
          )}
        </div>
      </section>

      {/* Modals */}
      {reportTarget && (
        <ReportModal
          isOpen={!!reportTarget}
          onClose={() => setReportTarget(null)}
          targetId={reportTarget.id}
          targetType={reportTarget.type}
          title={reportTarget.title}
        />
      )}

      {resolveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl glass-slab border border-white/15 p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-black text-white font-display flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-indigo-400" />
              <span>Resolve Campus Grievance</span>
            </h3>
            <p className="text-xs text-slate-300">
              Add a public resolution note explaining the facilities or administration fix.
            </p>
            <form onSubmit={handleResolvePost} className="space-y-3">
              <textarea
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                placeholder="e.g. IT services replaced the burnt switch port; bandwidth restored."
                rows={3}
                required
                className="w-full px-4 py-3 rounded-2xl bg-black/50 border border-white/10 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-400 resize-none"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResolveModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white shadow-glow-violet"
                >
                  Confirm Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function CommentItem({ comment, postId, replyingTo, setReplyingTo, onReplySubmitted, onReport }) {
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);

  let avatar = { initials: 'CV', bgColor: '#10b981' };
  try {
    if (comment.pseudonymAvatar) {
      avatar = typeof comment.pseudonymAvatar === 'string'
        ? JSON.parse(comment.pseudonymAvatar)
        : comment.pseudonymAvatar;
    }
  } catch (_) {}

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    try {
      setLoading(true);
      const res = await api.addComment(postId, replyText.trim(), comment._id);
      if (res.success) {
        setReplyText('');
        setReplyingTo(null);
        onReplySubmitted();
      }
    } catch (err) {
      alert(`Reply failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const isReplying = replyingTo === comment._id;

  return (
    <div className="glass-card rounded-3xl p-5 border border-white/10 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs text-white shadow-sm"
            style={{ backgroundColor: avatar.bgColor || '#10b981' }}
          >
            {avatar.initials || 'CV'}
          </div>
          <span className="font-bold text-slate-200">
            {comment.pseudonym}
          </span>
          {comment.isAuthorOP && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/25 text-emerald-300 font-black font-mono text-[10px] border border-emerald-500/40 shadow-glow-mint/30">
              OP
            </span>
          )}
          <span className="text-slate-600">•</span>
          <span className="text-slate-500 font-mono text-[11px]">
            {new Date(comment.createdAt).toLocaleDateString()}
          </span>
        </div>

        <button
          onClick={() => onReport({ id: comment._id, type: 'comment', title: comment.body.slice(0, 40) })}
          className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
          title="Report comment"
        >
          <Flag className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Body */}
      <p className="text-xs sm:text-sm text-slate-300/95 leading-relaxed pl-9">
        {comment.body}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pl-9 pt-1 text-xs">
        <VoteButtons
          targetId={comment._id}
          targetType="comment"
          initialScore={comment.score}
          initialUserVote={comment.userVote}
          orientation="horizontal"
        />

        <button
          onClick={() => setReplyingTo(isReplying ? null : comment._id)}
          className="text-xs font-bold text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
        >
          <CornerDownRight className="w-3.5 h-3.5" />
          <span>{isReplying ? 'Cancel' : 'Reply'}</span>
        </button>
      </div>

      {/* Inline Reply Input */}
      {isReplying && (
        <div className="mt-3 pl-9 space-y-2">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={`Replying anonymously to ${comment.pseudonym}...`}
            rows={2}
            className="w-full px-3.5 py-2.5 rounded-2xl bg-black/50 border border-white/10 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400 resize-none"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setReplyingTo(null)}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleSendReply}
              disabled={loading || !replyText.trim()}
              className="btn-primary-vibrant px-4 py-1.5 text-xs font-black rounded-xl disabled:opacity-40"
            >
              {loading ? 'Sending...' : 'Send Reply'}
            </button>
          </div>
        </div>
      )}

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="pl-6 pt-3 border-l-2 border-white/10 space-y-3 mt-2">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply._id}
              comment={reply}
              postId={postId}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              onReplySubmitted={onReplySubmitted}
              onReport={onReport}
            />
          ))}
        </div>
      )}
    </div>
  );
}
