import { Post, CATEGORIES } from '../models/Post.js';
import { IssueCluster } from '../models/IssueCluster.js';
import { summarizeCampusConcerns } from '../services/aiService.js';

export async function getCampusPulse(req, res, next) {
  try {
    // Category distribution
    const categoryStats = await Post.aggregate([
      { $match: { status: { $in: ['active', 'resolved'] } } },
      { $group: { _id: '$category', count: { $sum: 1 }, totalScore: { $sum: '$score' } } },
      { $sort: { count: -1 } },
    ]);

    // Ensure all 8 categories are represented
    const categoryMap = {};
    CATEGORIES.forEach(c => {
      categoryMap[c] = { category: c, count: 0, totalScore: 0 };
    });
    categoryStats.forEach(item => {
      if (categoryMap[item._id]) {
        categoryMap[item._id].count = item.count;
        categoryMap[item._id].totalScore = item.totalScore;
      }
    });

    // Sentiment breakdown
    const sentimentStats = await Post.aggregate([
      { $match: { status: { $in: ['active', 'resolved'] } } },
      { $group: { _id: '$aiAnalysis.sentiment', count: { $sum: 1 } } },
    ]);

    const sentimentMap = {
      Frustrated: 0,
      Constructive: 0,
      Urgent: 0,
      Neutral: 0,
      Positive: 0,
    };
    sentimentStats.forEach(s => {
      if (s._id && sentimentMap[s._id] !== undefined) {
        sentimentMap[s._id] = s.count;
      }
    });

    // Resolution stats
    const totalActive = await Post.countDocuments({ status: 'active' });
    const totalResolved = await Post.countDocuments({ status: 'resolved' });
    const totalSerious = await Post.countDocuments({ isSeriousIssue: true });

    // Recent posts for live concern summary
    const recentPosts = await Post.find({ status: { $in: ['active', 'resolved'] } })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const aiSummary = await summarizeCampusConcerns(recentPosts);

    res.status(200).json({
      success: true,
      data: {
        categories: Object.values(categoryMap),
        sentiments: sentimentMap,
        resolutionStats: {
          active: totalActive,
          resolved: totalResolved,
          seriousIssues: totalSerious,
          rate: totalActive + totalResolved > 0
            ? Math.round((totalResolved / (totalActive + totalResolved)) * 100)
            : 0,
        },
        aiSummary,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getRecurringIssues(req, res, next) {
  try {
    let clusters = await IssueCluster.find()
      .populate({
        path: 'samplePostIds',
        select: 'title category status score pseudonym createdAt',
      })
      .sort({ recurrenceCount: -1 })
      .lean();

    // If no clusters exist yet, generate dynamic clusters from top recurring tags/categories
    if (clusters.length === 0) {
      const topTags = await Post.aggregate([
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 4 },
      ]);

      const mockClusters = await Promise.all(
        topTags.map(async t => {
          const samplePosts = await Post.find({ tags: t._id, status: { $in: ['active', 'resolved'] } })
            .select('title category status score pseudonym createdAt')
            .limit(3)
            .lean();

          return {
            _id: t._id,
            title: `Recurring Discussions on ${t._id}`,
            category: samplePosts[0]?.category || 'General',
            recurrenceCount: t.count,
            sentimentScore: -0.3,
            dominantSentiment: 'Frustrated',
            summary: `Multiple students have reported repeated challenges under ${t._id}. Common patterns include inconsistent scheduling and facility delays.`,
            actionableAdvice: 'Recommend campus administration inspect affected areas and post an update.',
            samplePostIds: samplePosts,
            status: 'investigating',
          };
        })
      );

      return res.status(200).json({
        success: true,
        data: mockClusters,
      });
    }

    res.status(200).json({
      success: true,
      data: clusters,
    });
  } catch (error) {
    next(error);
  }
}
