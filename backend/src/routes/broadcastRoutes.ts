import { Router } from 'express';
import { BroadcastController } from '../controllers/broadcastController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', BroadcastController.getBroadcasts);
router.post('/', authenticate, requireAdmin, BroadcastController.createBroadcast);

export default router;
