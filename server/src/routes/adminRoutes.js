import { Router } from 'express';
import {
  getUsers,
  updateUserRole,
  updateUserStatus,
  getSystemMetrics,
} from '../controllers/adminController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

// Admin-only routes
router.use(requireAuth, requireRole(['admin']));

router.get('/users', getUsers);
router.patch('/users/:id/role', updateUserRole);
router.patch('/users/:id/status', updateUserStatus);
router.get('/metrics', getSystemMetrics);

export default router;
