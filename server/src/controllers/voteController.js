import { z } from 'zod';
import { Vote } from '../models/Vote.js';
import { Post } from '../models/Post.js';
import { Comment } from '../models/Comment.js';
import { createVoteHash } from '../services/pseudonymService.js';

const voteSchema = z.object({
  targetId: z.string(),
  targetType: z.enum(['post', 'comment']),
  value: z.number().refine(v => v === 1 || v === -1, 'Vote value must be 1 or -1'),
});

export async function castVote(req, res, next) {
  try {
    const { targetId, targetType, value } = voteSchema.parse(req.body);

    const Model = targetType === 'post' ? Post : Comment;
    const target = await Model.findById(targetId);

    if (!target) {
      return res.status(404).json({ success: false, message: `${targetType} not found.` });
    }

    const userHash = createVoteHash(req.user._id, targetId);

    const existingVote = await Vote.findOne({
      userHash,
      targetId,
      targetType,
    });

    let currentVote = 0;

    if (existingVote) {
      if (existingVote.value === value) {
        // Toggle off vote (un-vote)
        await Vote.findByIdAndDelete(existingVote._id);
        currentVote = 0;
      } else {
        // Switch vote (e.g. from down to up or up to down)
        existingVote.value = value;
        await existingVote.save();
        currentVote = value;
      }
    } else {
      // New vote
      await Vote.create({
        userHash,
        targetId,
        targetType,
        value,
      });
      currentVote = value;
    }

    // Atomic recalculation of target's upvotes, downvotes, and score
    const [upvoteCount, downvoteCount] = await Promise.all([
      Vote.countDocuments({ targetId, targetType, value: 1 }),
      Vote.countDocuments({ targetId, targetType, value: -1 }),
    ]);

    const newScore = upvoteCount - downvoteCount;

    target.upvotes = upvoteCount;
    target.downvotes = downvoteCount;
    target.score = newScore;
    await target.save();

    res.status(200).json({
      success: true,
      message: 'Vote registered.',
      data: {
        targetId,
        targetType,
        score: newScore,
        upvotes: upvoteCount,
        downvotes: downvoteCount,
        userVote: currentVote,
      },
    });
  } catch (error) {
    next(error);
  }
}
