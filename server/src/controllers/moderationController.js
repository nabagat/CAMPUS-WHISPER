import { z } from 'zod';
import { Post } from '../models/Post.js';
import { Comment } from '../models/Comment.js';
import { Report } from '../models/Report.js';
import { AuditLog } from '../models/AuditLog.js';

const postActionSchema = z.object({
  action: z.enum(['approve', 'reject', 'remove']),
  moderatorNotes: z.string().optional().default(''),
});

const commentActionSchema = z.object({
  action: z.enum(['approve', 'reject', 'remove']),
  moderatorNotes: z.string().optional().default(''),
});

const reportActionSchema = z.object({
  action: z.enum(['dismiss', 'action_taken']),
  moderatorNotes: z.string().optional().default(''),
});

/**
 * Get pending moderation queue (posts and comments awaiting review)
 * Note: Author user IDs are STRICTLY excluded to enforce privacy by design.
 */
export async function getPendingQueue(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const skip = (page - 1) * limit;

    const [pendingPosts, totalPosts, pendingComments, totalComments] = await Promise.all([
      Post.find({ status: 'under_review' })
        .sort({ riskLevel: -1, isSeriousIssue: -1, createdAt: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Post.countDocuments({ status: 'under_review' }),
      Comment.find({ status: 'under_review' })
        .sort({ createdAt: 1 })
        .limit(limit)
        .lean(),
      Comment.countDocuments({ status: 'under_review' }),
    ]);

    const sanitizedPosts = pendingPosts.map(p => {
      delete p.authorRef;
      delete p.authorHash;
      return p;
    });

    const sanitizedComments = pendingComments.map(c => {
      delete c.authorRef;
      delete c.authorHash;
      return c;
    });

    res.status(200).json({
      success: true,
      data: {
        posts: sanitizedPosts,
        comments: sanitizedComments,
        totals: {
          posts: totalPosts,
          comments: totalComments,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get pending user reports
 */
export async function getReportsQueue(req, res, next) {
  try {
    const reports = await Report.find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // Populate target data without leaking author identities
    const enrichedReports = await Promise.all(
      reports.map(async r => {
        let targetContent = null;
        if (r.targetType === 'post') {
          targetContent = await Post.findById(r.targetId).lean();
        } else {
          targetContent = await Comment.findById(r.targetId).lean();
        }

        if (targetContent) {
          delete targetContent.authorRef;
          delete targetContent.authorHash;
        }

        return {
          ...r,
          targetContent,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: enrichedReports,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Moderate a post (Approve / Reject / Remove)
 */
export async function moderatePost(req, res, next) {
  try {
    const { id } = req.params;
    const { action, moderatorNotes } = postActionSchema.parse(req.body);

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    let newStatus = 'active';
    let auditAction = 'approve_post';

    if (action === 'approve') {
      newStatus = 'active';
      auditAction = 'approve_post';
    } else if (action === 'reject') {
      newStatus = 'rejected';
      auditAction = 'reject_post';
    } else if (action === 'remove') {
      newStatus = 'rejected';
      auditAction = 'remove_post';
    }

    post.status = newStatus;
    post.moderatorNotes = moderatorNotes;
    await post.save();

    await AuditLog.create({
      moderatorId: req.user._id,
      moderatorEmail: req.user.email,
      action: auditAction,
      targetType: 'post',
      targetId: post._id,
      reason: moderatorNotes || `Post marked as ${newStatus}`,
      metadata: { previousRisk: post.riskLevel },
    });

    res.status(200).json({
      success: true,
      message: `Post ${action}d successfully.`,
      data: {
        id: post._id,
        status: newStatus,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Moderate a comment
 */
export async function moderateComment(req, res, next) {
  try {
    const { id } = req.params;
    const { action, moderatorNotes } = commentActionSchema.parse(req.body);

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found.' });
    }

    let newStatus = 'active';
    let auditAction = 'approve_comment';

    if (action === 'approve') {
      newStatus = 'active';
      auditAction = 'approve_comment';
    } else {
      newStatus = 'rejected';
      auditAction = 'reject_comment';
    }

    comment.status = newStatus;
    await comment.save();

    await AuditLog.create({
      moderatorId: req.user._id,
      moderatorEmail: req.user.email,
      action: auditAction,
      targetType: 'comment',
      targetId: comment._id,
      reason: moderatorNotes || `Comment marked as ${newStatus}`,
    });

    res.status(200).json({
      success: true,
      message: `Comment ${action}d successfully.`,
      data: {
        id: comment._id,
        status: newStatus,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Resolve a user report
 */
export async function resolveReport(req, res, next) {
  try {
    const { id } = req.params;
    const { action, moderatorNotes } = reportActionSchema.parse(req.body);

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }

    report.status = action === 'dismiss' ? 'dismissed' : 'action_taken';
    report.actionTaken = action === 'dismiss' ? 'dismissed' : 'action_taken';
    report.moderatorNotes = moderatorNotes;
    report.reviewedBy = req.user._id;
    report.reviewedAt = new Date();
    await report.save();

    await AuditLog.create({
      moderatorId: req.user._id,
      moderatorEmail: req.user.email,
      action: action === 'dismiss' ? 'dismiss_report' : 'action_report',
      targetType: 'report',
      targetId: report._id,
      reason: moderatorNotes,
    });

    res.status(200).json({
      success: true,
      message: `Report marked as ${report.status}.`,
      data: report,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get moderation audit trail
 */
export async function getAuditLogs(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 25, 100);
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      AuditLog.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AuditLog.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      data: logs,
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
