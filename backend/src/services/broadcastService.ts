import { WebSocket } from 'ws';
import { AdminBroadcast, NotificationTarget, NotificationCategory } from '../types/index.js';
import { broadcastsStore, usersStore } from '../models/store.js';

export class BroadcastService {
  private static wsClients: Set<WebSocket> = new Set();

  public static registerClient(ws: WebSocket) {
    this.wsClients.add(ws);
    ws.on('close', () => this.wsClients.delete(ws));
  }

  public static createBroadcast(payload: {
    title: string;
    message: string;
    target: NotificationTarget;
    category: NotificationCategory;
    sentBy: string;
  }): AdminBroadcast {
    // Count recipients
    let recipients = usersStore;
    if (payload.target === 'active') {
      recipients = usersStore.filter((u) => u.status === 'active');
    } else if (payload.target === 'flagged') {
      recipients = usersStore.filter((u) => u.status === 'flagged');
    } else if (payload.target === 'tier3') {
      recipients = usersStore.filter((u) => u.kycTier === 'Tier 3 (Institutional)');
    }

    const newBroadcast: AdminBroadcast = {
      id: `bc_${Date.now()}`,
      title: payload.title,
      message: payload.message,
      target: payload.target,
      category: payload.category,
      sentAt: new Date().toISOString(),
      sentBy: payload.sentBy,
      deliveredCount: recipients.length,
    };

    broadcastsStore.unshift(newBroadcast);

    // Push to connected WebSockets
    const messageStr = JSON.stringify({ type: 'BROADCAST_ALERT', data: newBroadcast });
    this.wsClients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });

    return newBroadcast;
  }

  public static getHistory(): AdminBroadcast[] {
    return broadcastsStore;
  }
}
