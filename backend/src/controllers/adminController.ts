import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { usersStore, settingsStore, auditLogsStore, transactionsStore } from '../models/store.js';
import { StellarService } from '../services/stellarService.js';
import { AuditService } from '../services/auditService.js';

export class AdminController {
  public static async getDashboardStats(_req: AuthenticatedRequest, res: Response): Promise<void> {
    const totalUsers = usersStore.length;
    const activeUsers = usersStore.filter((u) => u.status === 'active').length;
    const suspendedUsers = usersStore.filter((u) => u.status === 'suspended').length;
    const flaggedUsers = usersStore.filter((u) => u.status === 'flagged').length;
    const totalCustodialBalanceUsd = usersStore.reduce((s, u) => s + u.balanceUsd, 0);
    const totalVolumeUsd = transactionsStore.reduce((s, t) => s + t.sourceAmountUsd, 0);

    res.json({
      metrics: {
        totalUsers,
        activeUsers,
        suspendedUsers,
        flaggedUsers,
        totalCustodialBalanceUsd,
        totalVolumeUsd,
        anchorReserveUsdc: settingsStore.liquidityPoolReserveUsdc,
        gasRelayerXlm: settingsStore.gasRelayerBalanceXlm,
      },
      settings: settingsStore,
    });
  }

  public static async updateSettings(req: AuthenticatedRequest, res: Response): Promise<void> {
    const updates = req.body;
    Object.assign(settingsStore, updates);

    AuditService.log(
      'SYSTEM_SETTINGS_UPDATE',
      `Updated system settings: ${JSON.stringify(updates)}`,
      req.user?.email,
      req.ip
    );

    res.json(settingsStore);
  }

  public static async topUpGasRelayer(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { amountXlm } = req.body;
    if (!amountXlm || amountXlm <= 0) {
      res.status(400).json({ error: 'Valid amountXlm required' });
      return;
    }

    const newBalance = StellarService.topUpGasRelayer(amountXlm);
    AuditService.log(
      'GAS_RELAYER_TOPUP',
      `Injected +${amountXlm.toLocaleString()} XLM into Soroban Gas Relayer Tank`,
      req.user?.email,
      req.ip
    );

    res.json({ gasRelayerBalanceXlm: newBalance });
  }

  public static async injectAnchorLiquidity(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    const { amountUsdc } = req.body;
    if (!amountUsdc || amountUsdc <= 0) {
      res.status(400).json({ error: 'Valid amountUsdc required' });
      return;
    }

    const newBalance = StellarService.injectLiquidity(amountUsdc);
    AuditService.log(
      'LIQUIDITY_INJECTION',
      `Injected +$${amountUsdc.toLocaleString()} USDC into Settlement Pool`,
      req.user?.email,
      req.ip
    );

    res.json({ liquidityPoolReserveUsdc: newBalance });
  }

  public static async getAuditLogs(_req: AuthenticatedRequest, res: Response): Promise<void> {
    res.json(auditLogsStore);
  }
}
