import { Router } from 'express';
import { addComment, getComments, deleteComment } from '../controllers/commentController.js';
import { requireAuth, optionalAuth } from '../middleware/authMiddleware.js';
import { postCreationLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.get('/post/:postId', requireAuth, getComments);
router.post('/post/:postId', requireAuth, postCreationLimiter, addComment);
router.delete('/:id', requireAuth, deleteComment);

export default router;
