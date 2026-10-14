import { z } from 'zod';
import { Comment } from '../models/Comment.js';
import { Post } from '../models/Post.js';
import { Vote } from '../models/Vote.js';
import { AuditLog } from '../models/AuditLog.js';
import {
  generatePseudonym,
  generatePseudonymAvatar,
  createAuthorHash,
  createVoteHash,
} from '../services/pseudonymService.js';
import { moderateContent } from '../services/aiService.js';

const addCommentSchema = z.object({
  body: z.string().min(2).max(2000),
  parentId: z.string().nullable().optional(),
});

/**
 * Add an anonymous comment (or reply) to a post
 */
export async function addComment(req, res, next) {
  try {
    const { postId } = req.params;
    const data = addCommentSchema.parse(req.body);

    const post = await Post.findById(postId).select('+authorHash');
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    // AI content moderation check
    const aiMod = await moderateContent('Comment', data.body);
    let initialStatus = 'active';
    if (aiMod.overallRisk === 'HIGH') {
      initialStatus = 'rejected';
    } else if (aiMod.overallRisk === 'MEDIUM') {
      initialStatus = 'under_review';
    }

    const userAuthorHash = createAuthorHash(req.user._id);
    const isAuthorOP = post.authorHash === userAuthorHash;

    const pseudonym = isAuthorOP
      ? `${post.pseudonym} (OP)`
      : generatePseudonym(`${req.user._id}-${postId}`);

    const avatarInfo = generatePseudonymAvatar(pseudonym);

    const comment = await Comment.create({
      postId,
      parentId: data.parentId || null,
      body: data.body,
      pseudonym,
      pseudonymAvatar: JSON.stringify(avatarInfo),
      isAuthorOP,
      authorRef: req.user._id,
      authorHash: userAuthorHash,
      status: initialStatus,
      aiAnalysis: {
        toxicity: aiMod.toxicity,
        harassment: aiMod.harassment,
        spam: aiMod.spam,
        threat: aiMod.threat,
        overallRisk: aiMod.overallRisk,
        flags: aiMod.flags,
        reasoning: aiMod.reasoning,
      },
    });

    // Increment comment count on post if active
    if (initialStatus === 'active') {
      await Post.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } });
    }

    const publicComment = comment.toObject();
    delete publicComment.authorRef;
    delete publicComment.authorHash;

    res.status(201).json({
      success: true,
      message:
        initialStatus === 'active'
          ? 'Comment posted anonymously.'
          : 'Comment held for moderation review.',
      data: publicComment,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get threaded comments for a post
 */
export async function getComments(req, res, next) {
  try {
    const { postId } = req.params;

    const comments = await Comment.find({
      postId,
      status: 'active',
    })
      .sort({ createdAt: 1 })
      .lean();

    let userVotesMap = {};
    if (req.user) {
      const commentIds = comments.map(c => c._id);
      const userVoteHashes = commentIds.map(id => createVoteHash(req.user._id, id));
      const votes = await Vote.find({
        userHash: { $in: userVoteHashes },
        targetType: 'comment',
      }).lean();

      votes.forEach(v => {
        userVotesMap[v.targetId.toString()] = v.value;
      });
    }

    const formatted = comments.map(c => {
      delete c.authorRef;
      delete c.authorHash;
      return {
        ...c,
        userVote: userVotesMap[c._id.toString()] || 0,
      };
    });

    // Build comment hierarchy
    const commentMap = {};
    const rootComments = [];

    formatted.forEach(c => {
      commentMap[c._id.toString()] = { ...c, replies: [] };
    });

    formatted.forEach(c => {
      if (c.parentId && commentMap[c.parentId.toString()]) {
        commentMap[c.parentId.toString()].replies.push(commentMap[c._id.toString()]);
      } else {
        rootComments.push(commentMap[c._id.toString()]);
      }
    });

    res.status(200).json({
      success: true,
      data: rootComments,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete a comment
 */
export async function deleteComment(req, res, next) {
  try {
    const { id } = req.params;
    const comment = await Comment.findById(id).select('+authorHash');

    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found.' });
    }

    const userAuthorHash = createAuthorHash(req.user._id);
    const isOwner = comment.authorHash === userAuthorHash;
    const isModOrAdmin = ['moderator', 'admin'].includes(req.user.role);

    if (!isOwner && !isModOrAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this comment.' });
    }

    await Comment.findByIdAndDelete(id);
    await Post.findByIdAndUpdate(comment.postId, { $inc: { commentCount: -1 } });

    if (isModOrAdmin && !isOwner) {
      await AuditLog.create({
        moderatorId: req.user._id,
        moderatorEmail: req.user.email,
        action: 'remove_comment',
        targetType: 'comment',
        targetId: comment._id,
        reason: req.body.reason || 'Moderator deleted comment',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
}
