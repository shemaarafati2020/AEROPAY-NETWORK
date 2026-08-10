import { Router } from 'express';
import { UserController } from '../controllers/userController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/me', authenticate, UserController.getProfile);
router.get('/', authenticate, requireAdmin, UserController.listUsers);
router.patch('/:id/status', authenticate, requireAdmin, UserController.updateUserStatus);
router.patch('/:id/kyc', authenticate, requireAdmin, UserController.updateUserKyc);
router.post(
  '/:id/virtual-card/toggle',
  authenticate,
  requireAdmin,
  UserController.toggleVirtualCard
);
router.post('/:id/adjust-balance', authenticate, requireAdmin, UserController.adjustBalance);

export default router;
