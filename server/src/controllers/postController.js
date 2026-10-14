import { z } from 'zod';
import { Post, CATEGORIES } from '../models/Post.js';
import { Vote } from '../models/Vote.js';
import { AuditLog } from '../models/AuditLog.js';
import {
  generatePseudonym,
  generatePseudonymAvatar,
  createAuthorHash,
  createVoteHash,
} from '../services/pseudonymService.js';
import { moderateContent, categorizeAndTag } from '../services/aiService.js';

const createPostSchema = z.object({
  title: z.string().min(5).max(200),
  body: z.string().min(15).max(5000),
  category: z.enum(CATEGORIES),
  tags: z.array(z.string()).optional().default([]),
  isSeriousIssue: z.boolean().optional().default(false),
});

/**
 * Real-time AI Pre-Check for author preview before submitting
 */
export async function aiPrecheck(req, res, next) {
  try {
    const { title, body } = req.body;
    if (!title || !body) {
      return res.status(400).json({ success: false, message: 'Title and body are required for pre-check.' });
    }

    const moderation = await moderateContent(title, body);
    const categorization = await categorizeAndTag(title, body);

    res.status(200).json({
      success: true,
      data: {
        moderation,
        suggestedCategory: categorization.suggestedCategory,
        detectedTopics: categorization.detectedTopics,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create a new anonymous post
 */
export async function createPost(req, res, next) {
  try {
    const data = createPostSchema.parse(req.body);

    // AI content moderation pipeline
    const aiMod = await moderateContent(data.title, data.body);
    const aiCat = await categorizeAndTag(data.title, data.body);

    // Determine initial status based on AI risk assessment
    let initialStatus = 'active';
    let riskLevel = 'low';

    if (aiMod.overallRisk === 'HIGH') {
      riskLevel = 'high';
      initialStatus = 'rejected'; // held/rejected
    } else if (aiMod.overallRisk === 'MEDIUM' || data.isSeriousIssue) {
      riskLevel = 'medium';
      initialStatus = 'under_review'; // sent to moderation queue
    }

    // Merge student-provided tags with AI detected topics
    const mergedTags = Array.from(
      new Set([
        ...data.tags.map(t => (t.startsWith('#') ? t : `#${t}`)),
        ...aiCat.detectedTopics,
      ])
    ).slice(0, 6);

    // Generate pseudonym & avatar
    const pseudonym = generatePseudonym(req.user._id);
    const avatarInfo = generatePseudonymAvatar(pseudonym);

    // Cryptographic author hash for ownership validation
    const authorHash = createAuthorHash(req.user._id);

    const post = await Post.create({
      title: data.title,
      body: data.body,
      category: data.category || aiCat.suggestedCategory,
      tags: mergedTags,
      status: initialStatus,
      riskLevel,
      isSeriousIssue: data.isSeriousIssue,
      pseudonym,
      pseudonymAvatar: JSON.stringify(avatarInfo),
      authorRef: req.user._id,
      authorHash,
      aiAnalysis: {
        toxicity: aiMod.toxicity,
        harassment: aiMod.harassment,
        spam: aiMod.spam,
        threat: aiMod.threat,
        overallRisk: aiMod.overallRisk,
        flags: aiMod.flags,
        reasoning: aiMod.reasoning,
        sentiment: aiMod.sentiment,
        suggestedCategory: aiCat.suggestedCategory,
        detectedTopics: aiCat.detectedTopics,
      },
    });

    // Public post object stripping any private author links
    const publicPost = post.toObject();
    delete publicPost.authorRef;
    delete publicPost.authorHash;

    res.status(201).json({
      success: true,
      message:
        initialStatus === 'active'
          ? 'Post published successfully!'
          : initialStatus === 'under_review'
          ? 'Post submitted and placed in moderation queue for safety review.'
          : 'Post held for review due to community guideline flags.',
      post: publicPost,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * List posts with pagination, sorting, category filtering, search
 */
export async function getPosts(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;

    const { category, status, sort, isSeriousIssue, tag, search } = req.query;

    const query = {};

    // Filter by category
    if (category && category !== 'All' && CATEGORIES.includes(category)) {
      query.category = category;
    }

    // Default status: show active and resolved to students
    if (status) {
      query.status = status;
    } else {
      query.status = { $in: ['active', 'resolved'] };
    }

    if (isSeriousIssue === 'true') {
      query.isSeriousIssue = true;
    }

    if (tag) {
      query.tags = tag.startsWith('#') ? tag : `#${tag}`;
    }

    if (search && search.trim().length > 0) {
      query.$text = { $search: search.trim() };
    }

    // Sorting logic
    let sortOptions = { createdAt: -1 }; // default latest
    if (sort === 'trending') {
      // High score + recent
      sortOptions = { score: -1, createdAt: -1 };
    } else if (sort === 'top') {
      sortOptions = { score: -1 };
    } else if (sort === 'discussed') {
      sortOptions = { commentCount: -1, createdAt: -1 };
    } else if (sort === 'latest') {
      sortOptions = { createdAt: -1 };
    }

    const [posts, total] = await Promise.all([
      Post.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Post.countDocuments(query),
    ]);

    // Check user vote status if authenticated
    let userVotesMap = {};
    if (req.user) {
      const postIds = posts.map(p => p._id);
      const userVoteHashes = postIds.map(id => createVoteHash(req.user._id, id));
      const votes = await Vote.find({
        userHash: { $in: userVoteHashes },
        targetType: 'post',
      }).lean();

      votes.forEach(v => {
        userVotesMap[v.targetId.toString()] = v.value;
      });
    }

    const formattedPosts = posts.map(p => {
      delete p.authorRef;
      delete p.authorHash;
      return {
        ...p,
        userVote: userVotesMap[p._id.toString()] || 0,
      };
    });

    res.status(200).json({
      success: true,
      data: formattedPosts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get single post details
 */
export async function getPostById(req, res, next) {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    // Increment view count atomically
    await Post.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } });

    const postObj = post.toObject();
    delete postObj.authorRef;
    delete postObj.authorHash;

    let userVote = 0;
    let isOwner = false;

    if (req.user) {
      const voteHash = createVoteHash(req.user._id, post._id);
      const existingVote = await Vote.findOne({ userHash: voteHash, targetType: 'post' });
      if (existingVote) userVote = existingVote.value;

      const userAuthorHash = createAuthorHash(req.user._id);
      const rawPost = await Post.findById(req.params.id).select('+authorHash');
      if (rawPost && rawPost.authorHash === userAuthorHash) {
        isOwner = true;
      }
    }

    res.status(200).json({
      success: true,
      data: {
        ...postObj,
        userVote,
        isOwner,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update post (Owner or Mod/Admin)
 */
export async function updatePost(req, res, next) {
  try {
    const { title, body, category, tags } = req.body;
    const post = await Post.findById(req.params.id).select('+authorHash');

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    const userAuthorHash = createAuthorHash(req.user._id);
    const isOwner = post.authorHash === userAuthorHash;
    const isModOrAdmin = ['moderator', 'admin'].includes(req.user.role);

    if (!isOwner && !isModOrAdmin) {
      return res.status(403).json({ success: false, message: 'You are not authorized to edit this post.' });
    }

    if (title) post.title = title;
    if (body) post.body = body;
    if (category && CATEGORIES.includes(category)) post.category = category;
    if (Array.isArray(tags)) post.tags = tags.slice(0, 6);

    await post.save();

    const updated = post.toObject();
    delete updated.authorRef;
    delete updated.authorHash;

    res.status(200).json({
      success: true,
      message: 'Post updated successfully.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete post (Owner or Mod/Admin)
 */
export async function deletePost(req, res, next) {
  try {
    const post = await Post.findById(req.params.id).select('+authorHash');
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    const userAuthorHash = createAuthorHash(req.user._id);
    const isOwner = post.authorHash === userAuthorHash;
    const isModOrAdmin = ['moderator', 'admin'].includes(req.user.role);

    if (!isOwner && !isModOrAdmin) {
      return res.status(403).json({ success: false, message: 'You are not authorized to delete this post.' });
    }

    await Post.findByIdAndDelete(req.params.id);

    if (isModOrAdmin && !isOwner) {
      await AuditLog.create({
        moderatorId: req.user._id,
        moderatorEmail: req.user.email,
        action: 'remove_post',
        targetType: 'post',
        targetId: post._id,
        reason: req.body.reason || 'Community guideline violation removal',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Mark a post as resolved (Moderator / Admin)
 */
export async function resolvePost(req, res, next) {
  try {
    const { resolutionNote } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    post.status = 'resolved';
    post.resolutionNote = resolutionNote || 'Marked as resolved by campus administration.';
    post.resolvedAt = new Date();
    await post.save();

    await AuditLog.create({
      moderatorId: req.user._id,
      moderatorEmail: req.user.email,
      action: 'resolve_post',
      targetType: 'post',
      targetId: post._id,
      reason: resolutionNote || 'Issue resolved',
    });

    res.status(200).json({
      success: true,
      message: 'Post status updated to Resolved.',
      data: post,
    });
  } catch (error) {
    next(error);
  }
}
