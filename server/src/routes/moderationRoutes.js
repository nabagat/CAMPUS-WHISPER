import { Router } from 'express';
import {
  getPendingQueue,
  getReportsQueue,
  moderatePost,
  moderateComment,
  resolveReport,
  getAuditLogs,
} from '../controllers/moderationController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

// All moderation routes require at least 'moderator' or 'admin' role
router.use(requireAuth, requireRole(['moderator', 'admin']));

router.get('/pending', getPendingQueue);
router.get('/reports', getReportsQueue);
router.post('/posts/:id', moderatePost);
router.post('/comments/:id', moderateComment);
router.post('/reports/:id', resolveReport);
router.get('/audit-logs', getAuditLogs);

export default router;
