import { Router } from 'express';
import { QuestController } from '../controllers/questController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);
router.get('/', QuestController.getQuests);
router.post('/', QuestController.createQuest);
router.get('/:id', QuestController.getQuestById);
router.put('/:id', QuestController.updateQuest);
router.delete('/:id', QuestController.deleteQuest);
router.post('/:id/complete', QuestController.completeQuest);

export default router;
