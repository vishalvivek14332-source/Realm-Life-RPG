import { Router } from 'express';
import { CharacterController } from '../controllers/characterController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);
router.get('/', CharacterController.getCharacter);
router.post('/rest', CharacterController.rest);

export default router;
