import { Router } from 'express';
import { FxController } from '../controllers/fxController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/rates', FxController.getRates);
router.get('/quote', FxController.getQuote);
router.post('/rates', authenticate, requireAdmin, FxController.updateRates);

export default router;
