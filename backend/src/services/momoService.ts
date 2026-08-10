import { settingsStore } from '../models/store.js';

export class MomoService {
  /**
   * Dispatches mobile money payout to MTN/Airtel/M-Pesa
   */
  public static async dispatchPayout(
    phone: string,
    amount: number,
    currency: 'RWF' | 'KES'
  ): Promise<{ status: 'SUCCESS' | 'FAILED'; referenceId: string; reason?: string }> {
    if (settingsStore.maintenanceMode) {
      return {
        status: 'FAILED',
        referenceId: `REF_${Date.now()}`,
        reason: 'Corridor paused due to emergency system maintenance',
      };
    }

    if (currency === 'RWF' && !settingsStore.rwandaMoMoActive) {
      return {
        status: 'FAILED',
        referenceId: `REF_${Date.now()}`,
        reason: 'Rwanda MTN/Airtel MoMo corridor is temporarily suspended',
      };
    }

    if (currency === 'KES' && !settingsStore.kenyaMpesaActive) {
      return {
        status: 'FAILED',
        referenceId: `REF_${Date.now()}`,
        reason: 'Kenya M-Pesa Safaricom corridor is temporarily suspended',
      };
    }

    // Simulate instant telco API handshake
    return {
      status: 'SUCCESS',
      referenceId: `MOMO_${Date.now()}_${Math.floor(Math.random() * 90000 + 10000)}`,
    };
  }
}
