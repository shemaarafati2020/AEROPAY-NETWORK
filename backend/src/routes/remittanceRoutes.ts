import { Router } from 'express';
import { RemittanceController } from '../controllers/remittanceController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/send', authenticate, RemittanceController.initiateRemittance);
router.get('/history', authenticate, RemittanceController.getTransactionHistory);

export default router;
