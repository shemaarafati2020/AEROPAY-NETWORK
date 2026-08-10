import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { usersStore } from '../models/store.js';
import { AuditService } from '../services/auditService.js';

export class UserController {
  public static async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    const user = usersStore.find((u) => u.id === req.user?.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(user);
  }

  public static async listUsers(_req: AuthenticatedRequest, res: Response): Promise<void> {
    res.json(usersStore);
  }

  public static async updateUserStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const { status, reason } = req.body;

    const user = usersStore.find((u) => u.id === id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    user.status = status;
    AuditService.log(
      `USER_STATUS_${status.toUpperCase()}`,
      `Changed status of ${user.name} to ${status}. Reason: ${reason || 'N/A'}`,
      req.user?.email,
      req.ip
    );

    res.json(user);
  }

  public static async updateUserKyc(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const { kycTier } = req.body;

    const user = usersStore.find((u) => u.id === id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    user.kycTier = kycTier;
    AuditService.log(
      'KYC_TIER_UPDATE',
      `Upgraded ${user.name} KYC to ${kycTier}`,
      req.user?.email,
      req.ip
    );

    res.json(user);
  }

  public static async toggleVirtualCard(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const user = usersStore.find((u) => u.id === id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    user.virtualCardActive = !user.virtualCardActive;
    AuditService.log(
      'VIRTUAL_CARD_TOGGLE',
      `Virtual card for ${user.name} set to ${user.virtualCardActive ? 'ACTIVE' : 'FROZEN'}`,
      req.user?.email,
      req.ip
    );

    res.json({ virtualCardActive: user.virtualCardActive });
  }

  public static async adjustBalance(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const { deltaUsd, reason } = req.body;

    const user = usersStore.find((u) => u.id === id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    user.balanceUsd = Math.max(0, user.balanceUsd + deltaUsd);
    AuditService.log(
      'BALANCE_MANUAL_ADJUSTMENT',
      `${deltaUsd >= 0 ? 'Credited' : 'Debited'} ${deltaUsd >= 0 ? '+' : ''}$${deltaUsd} USDC on ${user.name}. Reason: ${reason || 'N/A'}`,
      req.user?.email,
      req.ip
    );

    res.json(user);
  }
}
