import { Router } from 'express';
import { StreakController } from '../controllers/streakController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);
router.get('/', StreakController.getStreak);
router.post('/check-in', StreakController.checkIn);

export default router;
