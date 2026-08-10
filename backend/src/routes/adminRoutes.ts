import { Router } from 'express';
import { AdminController } from '../controllers/adminController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/dashboard', authenticate, requireAdmin, AdminController.getDashboardStats);
router.patch('/settings', authenticate, requireAdmin, AdminController.updateSettings);
router.post('/gas-relayer/topup', authenticate, requireAdmin, AdminController.topUpGasRelayer);
router.post('/liquidity/inject', authenticate, requireAdmin, AdminController.injectAnchorLiquidity);
router.get('/audit-logs', authenticate, requireAdmin, AdminController.getAuditLogs);

export default router;
