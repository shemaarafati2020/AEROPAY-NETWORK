import { settingsStore } from '../models/store.js';

export class FxService {
  public static getRates() {
    const spreadMultiplier = (100 - settingsStore.feeSpreadPercent) / 100;
    return {
      wholesale: {
        rwf: settingsStore.rwfRate,
        kes: settingsStore.kesRate,
      },
      effective: {
        rwf: settingsStore.rwfRate * spreadMultiplier,
        kes: settingsStore.kesRate * spreadMultiplier,
      },
      spreadPercent: settingsStore.feeSpreadPercent,
      timestamp: new Date().toISOString(),
    };
  }

  public static calculateQuote(sourceUsd: number, targetCurrency: 'RWF' | 'KES') {
    const rates = this.getRates();
    const rate = targetCurrency === 'RWF' ? rates.effective.rwf : rates.effective.kes;
    const feeUsd = sourceUsd * (settingsStore.feeSpreadPercent / 100);
    const targetAmount = sourceUsd * rate;

    return {
      sourceUsd,
      targetCurrency,
      rate,
      feeUsd,
      targetAmount: Math.round(targetAmount * 100) / 100,
    };
  }

  public static updateRates(rwfRate?: number, kesRate?: number, spreadPercent?: number) {
    if (rwfRate !== undefined) settingsStore.rwfRate = rwfRate;
    if (kesRate !== undefined) settingsStore.kesRate = kesRate;
    if (spreadPercent !== undefined) settingsStore.feeSpreadPercent = spreadPercent;
    return this.getRates();
  }
}
