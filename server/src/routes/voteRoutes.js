import { Router } from 'express';
import { castVote } from '../controllers/voteController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/', requireAuth, castVote);

export default router;
