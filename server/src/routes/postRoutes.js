import { Router } from 'express';
import {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  resolvePost,
  aiPrecheck,
} from '../controllers/postController.js';
import { requireAuth, optionalAuth } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { postCreationLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// AI pre-check for author feedback before submission
router.post('/precheck', requireAuth, aiPrecheck);

// List posts (supports category, search, sorting, status)
router.get('/', requireAuth, getPosts);

// Create post
router.post('/', requireAuth, postCreationLimiter, createPost);

// Single post
router.get('/:id', requireAuth, getPostById);

// Update post (author or mod/admin)
router.put('/:id', requireAuth, updatePost);

// Delete post (author or mod/admin)
router.delete('/:id', requireAuth, deletePost);

// Mark as resolved (moderator / admin)
router.patch('/:id/resolve', requireAuth, requireRole(['moderator', 'admin']), resolvePost);

export default router;
