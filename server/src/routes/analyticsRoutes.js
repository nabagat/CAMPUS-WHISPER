import { Router } from 'express';
import { getCampusPulse, getRecurringIssues } from '../controllers/analyticsController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);

router.get('/pulse', getCampusPulse);
router.get('/recurring', getRecurringIssues);

export default router;
