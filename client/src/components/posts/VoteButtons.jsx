import React, { useState } from 'react';
import { ArrowBigUp, ArrowBigDown } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function VoteButtons({
  targetId,
  targetType = 'post',
  initialScore = 0,
  initialUserVote = 0,
  orientation = 'vertical',
  onVoteChange,
}) {
  const { isAuthenticated } = useAuth();
  const [score, setScore] = useState(initialScore);
  const [userVote, setUserVote] = useState(initialUserVote);
  const [loading, setLoading] = useState(false);

  const handleVote = async (value) => {
    if (!isAuthenticated) {
      alert('Please select any student or demo account to vote.');
      return;
    }

    if (loading) return;

    const previousScore = score;
    const previousVote = userVote;

    let nextVote = 0;
    let delta = 0;

    if (previousVote === value) {
      nextVote = 0;
      delta = -value;
    } else if (previousVote === 0) {
      nextVote = value;
      delta = value;
    } else {
      nextVote = value;
      delta = value * 2;
    }

    setUserVote(nextVote);
    setScore(previousScore + delta);

    try {
      setLoading(true);
      const res = await api.castVote({ targetId, targetType, value });
      if (res.success) {
        setScore(res.data.score);
        setUserVote(res.data.userVote);
        if (onVoteChange) onVoteChange(res.data.score);
      }
    } catch (err) {
      setUserVote(previousVote);
      setScore(previousScore);
      console.error('Vote failed:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const isVertical = orientation === 'vertical';

  return (
    <div
      className={`flex items-center justify-center transition-all ${
        isVertical
          ? 'flex-col glass-slab rounded-2xl p-1.5 min-w-[46px] border border-white/10 shadow-lg'
          : 'flex-row glass-slab rounded-xl px-2.5 py-1 gap-1.5 border border-white/10'
      }`}
    >
      <button
        type="button"
        onClick={() => handleVote(1)}
        disabled={loading}
        title="Upvote"
        aria-label="Upvote"
        className={`p-1.5 rounded-xl transition-all active:scale-90 ${
          userVote === 1
            ? 'text-emerald-300 bg-emerald-500/25 shadow-glow-mint'
            : 'text-slate-400 hover:text-emerald-300 hover:bg-white/5'
        }`}
      >
        <ArrowBigUp className="w-5 h-5 fill-current" />
      </button>

      <span
        className={`font-mono text-xs font-black tracking-tight px-1 select-none transition-colors ${
          userVote === 1
            ? 'text-emerald-300'
            : userVote === -1
            ? 'text-rose-400'
            : 'text-slate-200'
        }`}
      >
        {score}
      </span>

      <button
        type="button"
        onClick={() => handleVote(-1)}
        disabled={loading}
        title="Downvote"
        aria-label="Downvote"
        className={`p-1.5 rounded-xl transition-all active:scale-90 ${
          userVote === -1
            ? 'text-rose-300 bg-rose-500/25 shadow-glow-coral'
            : 'text-slate-400 hover:text-rose-400 hover:bg-white/5'
        }`}
      >
        <ArrowBigDown className="w-5 h-5 fill-current" />
      </button>
    </div>
  );
}
