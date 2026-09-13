import { Router } from 'express';
import { InventoryController } from '../controllers/inventoryController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);
router.get('/', InventoryController.getInventory);
router.post('/buy', InventoryController.buyItem);
router.post('/use', InventoryController.useItem);
router.post('/equip', InventoryController.equipItem);
router.post('/sell', InventoryController.sellItem);

export default router;
