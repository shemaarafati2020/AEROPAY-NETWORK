import { AuditLog } from '../types/index.js';
import { auditLogsStore } from '../models/store.js';

export class AuditService {
  public static log(
    action: string,
    details: string,
    adminEmail = 'admin@aeropay.network',
    ipAddress = '127.0.0.1'
  ): AuditLog {
    const entry: AuditLog = {
      id: `log_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      adminEmail,
      action,
      details,
      timestamp: new Date().toISOString(),
      ipAddress,
    };
    auditLogsStore.unshift(entry);
    return entry;
  }

  public static getLogs(): AuditLog[] {
    return auditLogsStore;
  }
}
