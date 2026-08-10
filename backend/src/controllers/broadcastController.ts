import { Request, Response } from 'express';
import { BroadcastService } from '../services/broadcastService.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { AuditService } from '../services/auditService.js';

export class BroadcastController {
  public static async getBroadcasts(_req: Request, res: Response): Promise<void> {
    res.json(BroadcastService.getHistory());
  }

  public static async createBroadcast(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { title, message, target = 'all', category = 'promo' } = req.body;
    if (!title || !message) {
      res.status(400).json({ error: 'Title and message are required' });
      return;
    }

    const broadcast = BroadcastService.createBroadcast({
      title,
      message,
      target,
      category,
      sentBy: req.user?.email || 'admin@aeropay.network',
    });

    AuditService.log(
      'BROADCAST_NOTIFICATION_DISPATCH',
      `Dispatched broadcast: "${title}" to target "${target}" (${broadcast.deliveredCount} delivered)`,
      req.user?.email,
      req.ip
    );

    res.status(201).json(broadcast);
  }
}
