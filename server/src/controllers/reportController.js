import { z } from 'zod';
import { Report, REPORT_REASONS } from '../models/Report.js';
import { Post } from '../models/Post.js';
import { Comment } from '../models/Comment.js';
import { createAuthorHash } from '../services/pseudonymService.js';

const reportSchema = z.object({
  targetId: z.string(),
  targetType: z.enum(['post', 'comment']),
  reason: z.enum(REPORT_REASONS),
  reporterNotes: z.string().max(1000).optional().default(''),
});

export async function createReport(req, res, next) {
  try {
    const data = reportSchema.parse(req.body);

    const Model = data.targetType === 'post' ? Post : Comment;
    const target = await Model.findById(data.targetId);

    if (!target) {
      return res.status(404).json({ success: false, message: `${data.targetType} not found.` });
    }

    const reporterHash = createAuthorHash(req.user._id);

    // Prevent spamming reports on the same item from the same user
    const existingReport = await Report.findOne({
      targetId: data.targetId,
      reporterHash,
      status: 'pending',
    });

    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a pending report for this item.',
      });
    }

    const report = await Report.create({
      targetId: data.targetId,
      targetType: data.targetType,
      reason: data.reason,
      reporterNotes: data.reporterNotes,
      reporterHash,
      status: 'pending',
    });

    // If item reaches 3 pending reports, mark it as 'under_review' automatically
    const reportCount = await Report.countDocuments({
      targetId: data.targetId,
      status: 'pending',
    });

    if (reportCount >= 3 && target.status === 'active') {
      target.status = 'under_review';
      await target.save();
    }

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully. Our moderation team will review this promptly.',
      data: {
        id: report._id,
        status: report.status,
      },
    });
  } catch (error) {
    next(error);
  }
}
