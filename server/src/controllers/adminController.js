import { z } from 'zod';
import { User } from '../models/User.js';
import { Post } from '../models/Post.js';
import { Report } from '../models/Report.js';
import { Comment } from '../models/Comment.js';
import { AuditLog } from '../models/AuditLog.js';

const updateUserRoleSchema = z.object({
  role: z.enum(['student', 'moderator', 'admin']),
});

const updateUserStatusSchema = z.object({
  status: z.enum(['active', 'suspended']),
  reason: z.string().optional().default(''),
});

export async function getUsers(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const { role, status, search } = req.query;
    const query = {};

    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
      query.email = { $regex: search.trim(), $options: 'i' };
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: users,
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

export async function updateUserRole(req, res, next) {
  try {
    const { id } = req.params;
    const { role } = updateUserRoleSchema.parse(req.body);

    if (id === req.user._id.toString() && role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Admins cannot demote their own account.',
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const previousRole = user.role;
    user.role = role;
    await user.save();

    await AuditLog.create({
      moderatorId: req.user._id,
      moderatorEmail: req.user.email,
      action: 'update_user_role',
      targetType: 'user',
      targetId: user._id,
      reason: `Role changed from ${previousRole} to ${role}`,
    });

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}.`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateUserStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, reason } = updateUserStatusSchema.parse(req.body);

    if (id === req.user._id.toString() && status === 'suspended') {
      return res.status(400).json({
        success: false,
        message: 'You cannot suspend your own account.',
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.status = status;
    await user.save();

    await AuditLog.create({
      moderatorId: req.user._id,
      moderatorEmail: req.user.email,
      action: status === 'suspended' ? 'suspend_user' : 'activate_user',
      targetType: 'user',
      targetId: user._id,
      reason: reason || `Account marked as ${status}`,
    });

    res.status(200).json({
      success: true,
      message: `User account has been ${status}.`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

export async function getSystemMetrics(req, res, next) {
  try {
    const [
      totalUsers,
      totalPosts,
      resolvedPosts,
      underReviewPosts,
      seriousIssues,
      pendingReports,
      totalComments,
    ] = await Promise.all([
      User.countDocuments(),
      Post.countDocuments(),
      Post.countDocuments({ status: 'resolved' }),
      Post.countDocuments({ status: 'under_review' }),
      Post.countDocuments({ isSeriousIssue: true }),
      Report.countDocuments({ status: 'pending' }),
      Comment.countDocuments(),
    ]);

    const resolutionRate = totalPosts > 0 ? Math.round((resolvedPosts / totalPosts) * 100) : 0;

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalPosts,
        resolvedPosts,
        underReviewPosts,
        seriousIssues,
        pendingReports,
        totalComments,
        resolutionRate,
      },
    });
  } catch (error) {
    next(error);
  }
}
