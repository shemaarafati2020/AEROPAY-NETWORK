import { Request, Response } from 'express';
import { FxService } from '../services/fxService.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { AuditService } from '../services/auditService.js';

export class FxController {
  public static async getRates(_req: Request, res: Response): Promise<void> {
    const rates = FxService.getRates();
    res.json(rates);
  }

  public static async getQuote(req: Request, res: Response): Promise<void> {
    const { amountUsd, targetCurrency } = req.query;
    if (!amountUsd || !targetCurrency) {
      res.status(400).json({ error: 'amountUsd and targetCurrency (RWF|KES) are required' });
      return;
    }

    const num = parseFloat(amountUsd as string);
    const curr = (targetCurrency as string).toUpperCase() as 'RWF' | 'KES';
    const quote = FxService.calculateQuote(num, curr);
    res.json(quote);
  }

  public static async updateRates(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { rwfRate, kesRate, feeSpreadPercent } = req.body;
    const updated = FxService.updateRates(rwfRate, kesRate, feeSpreadPercent);

    AuditService.log(
      'FX_RATES_UPDATED',
      `Wholesale FX updated: 1 USD = ${updated.wholesale.rwf} RWF, ${updated.wholesale.kes} KES (${updated.spreadPercent}% spread)`,
      req.user?.email,
      req.ip
    );

    res.json(updated);
  }
}
