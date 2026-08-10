import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { FxService } from '../services/fxService.js';
import { MomoService } from '../services/momoService.js';
import { StellarService } from '../services/stellarService.js';
import { usersStore, transactionsStore, settingsStore } from '../models/store.js';
import { RemittanceTransaction } from '../types/index.js';

export class RemittanceController {
  public static async initiateRemittance(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { recipientPhone, recipientName, sourceAmountUsd, targetCurrency } = req.body;
    const userId = req.user?.id;

    if (!recipientPhone || !recipientName || !sourceAmountUsd || !targetCurrency) {
      res
        .status(400)
        .json({ error: 'recipientPhone, recipientName, sourceAmountUsd, targetCurrency required' });
      return;
    }

    if (settingsStore.maintenanceMode) {
      res.status(503).json({ error: 'System is currently under maintenance mode.' });
      return;
    }

    const sender = usersStore.find((u) => u.id === userId);
    if (!sender) {
      res.status(404).json({ error: 'Sender not found' });
      return;
    }

    if (sender.balanceUsd < sourceAmountUsd) {
      res.status(400).json({ error: 'Insufficient custodial balance' });
      return;
    }

    // Calculate Quote
    const quote = FxService.calculateQuote(sourceAmountUsd, targetCurrency);

    // Execute Soroban Smart Contract Settlement
    const stellarSettlement = await StellarService.executeSorobanSettlement(
      sourceAmountUsd,
      recipientPhone
    );

    // Dispatch to Telco Payment Rail
    const momoResult = await MomoService.dispatchPayout(
      recipientPhone,
      quote.targetAmount,
      targetCurrency
    );

    if (momoResult.status === 'FAILED') {
      res.status(400).json({ error: momoResult.reason || 'Payment rail dispatch failed' });
      return;
    }

    // Deduct user balance
    sender.balanceUsd -= sourceAmountUsd;
    sender.totalTransferredUsd = (sender.totalTransferredUsd || 0) + sourceAmountUsd;

    const tx: RemittanceTransaction = {
      id: `tx_${Date.now()}`,
      senderId: sender.id,
      recipientName,
      recipientPhone,
      sourceAmountUsd,
      targetAmount: quote.targetAmount,
      targetCurrency,
      rate: quote.rate,
      feeUsd: quote.feeUsd,
      status: 'SETTLED',
      stellarTxHash: stellarSettlement.txHash,
      createdAt: new Date().toISOString(),
    };

    transactionsStore.unshift(tx);

    res.status(201).json({
      success: true,
      transaction: tx,
      remainingBalanceUsd: sender.balanceUsd,
      stellarTxHash: stellarSettlement.txHash,
      momoReference: momoResult.referenceId,
    });
  }

  public static async getTransactionHistory(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    const userTxs = transactionsStore.filter((t) => t.senderId === req.user?.id);
    res.json(userTxs);
  }
}
