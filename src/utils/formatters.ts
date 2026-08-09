export type SupportedCurrency = 'USD' | 'KES' | 'RWF' | string;

export interface CurrencyFormatOptions {
  showCents?: boolean;
  compact?: boolean;
  prefixSymbol?: boolean;
}

/**
 * Universal financial currency formatter optimized for East African remittance corridors.
 * Handles RWF (integer standard), KES (Shillings), and USD (USDC).
 */
export function formatCurrency(
  amount: number,
  currency: SupportedCurrency = 'USD',
  options: CurrencyFormatOptions = {}
): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return currency === 'USD' ? '$0.00' : `0 ${currency}`;
  }

  const { showCents = true, compact = false, prefixSymbol = true } = options;

  if (compact) {
    if (Math.abs(amount) >= 1_000_000) {
      return `${(amount / 1_000_000).toFixed(1)}M ${currency}`;
    }
    if (Math.abs(amount) >= 1_000) {
      return `${(amount / 1_000).toFixed(1)}k ${currency}`;
    }
  }

  const upperCurrency = currency.toUpperCase();

  // Rwandan Francs (RWF) are conventionally formatted as integers
  if (upperCurrency === 'RWF') {
    const formattedNum = Math.round(amount).toLocaleString('en-US');
    return prefixSymbol ? `RWF ${formattedNum}` : formattedNum;
  }

  // Kenyan Shillings (KES)
  if (upperCurrency === 'KES') {
    const formattedNum = showCents
      ? amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : Math.round(amount).toLocaleString('en-US');
    return prefixSymbol ? `KES ${formattedNum}` : formattedNum;
  }

  // USD / USDC Default
  if (upperCurrency === 'USD' || upperCurrency === 'USDC') {
    const formattedNum = amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return prefixSymbol ? `$${formattedNum}` : formattedNum;
  }

  return `${amount.toLocaleString('en-US')} ${currency}`;
}

/**
 * Formats live FX exchange rates (e.g. "1 USDC = 1,420.00 RWF")
 */
export function formatExchangeRate(
  rate: number,
  baseCurrency = 'USDC',
  targetCurrency = 'RWF'
): string {
  if (!rate || isNaN(rate)) return `1 ${baseCurrency} = -- ${targetCurrency}`;
  const formattedRate =
    targetCurrency === 'RWF'
      ? Math.round(rate).toLocaleString('en-US')
      : rate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return `1 ${baseCurrency} = ${formattedRate} ${targetCurrency}`;
}

export interface FeeBreakdown {
  sendAmountUsd: number;
  exchangeRate: number;
  targetCurrency: 'KES' | 'RWF';
  recipientGetsLocal: string;
  networkFeeUsd: number;
  onChainGasUsd: number;
  totalDebitUsd: number;
}

/**
 * Calculates and formats exact fee and conversion breakdown
 */
export function formatFeeBreakdown(
  sendAmountUsd: number,
  exchangeRate: number,
  targetCurrency: 'KES' | 'RWF'
): FeeBreakdown {
  const safeAmount = isNaN(sendAmountUsd) ? 0 : sendAmountUsd;
  const safeRate = isNaN(exchangeRate) ? 1 : exchangeRate;
  const localCalculated = safeAmount * safeRate;

  const networkFeeUsd = 0.5; // Flat $0.50 AeroPay routing fee
  const onChainGasUsd = 0.0; // Covered by Paymaster
  const totalDebitUsd = safeAmount + networkFeeUsd;

  return {
    sendAmountUsd: safeAmount,
    exchangeRate: safeRate,
    targetCurrency,
    recipientGetsLocal: formatCurrency(localCalculated, targetCurrency),
    networkFeeUsd,
    onChainGasUsd,
    totalDebitUsd,
  };
}

/**
 * Formats a Unix timestamp into relative human-readable time ("2m ago", "1h ago", "Yesterday")
 */
export function formatRelativeTimestamp(timestamp: number): string {
  if (!timestamp) return '';
  const now = Date.now();
  const diffSeconds = Math.floor((now - timestamp) / 1000);

  if (diffSeconds < 45) return 'Just now';
  if (diffSeconds < 3600) {
    const mins = Math.floor(diffSeconds / 60);
    return `${mins}m ago`;
  }
  if (diffSeconds < 86400) {
    const hours = Math.floor(diffSeconds / 3600);
    return `${hours}h ago`;
  }
  if (diffSeconds < 172800) {
    return 'Yesterday';
  }

  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Masks a telephone number for privacy in transaction logs and push notifications
 * Example: "+250 788 123 456" -> "+250 788 ••• •56"
 */
export function formatMaskedPhone(phone: string): string {
  if (!phone || phone.length < 8) return phone;
  const cleaned = phone.trim();
  const prefix = cleaned.substring(0, Math.min(8, cleaned.length - 4));
  const suffix = cleaned.substring(cleaned.length - 3);
  return `${prefix} ••• •${suffix}`;
}

/**
 * Shortens on-chain transaction hashes for UI badges
 * Example: "0x8f2ab123456789abcdef..." -> "0x8f2a...cdef"
 */
export function formatTxHash(hash?: string, lead = 6, tail = 4): string {
  if (!hash) return '--';
  if (hash.length <= lead + tail) return hash;
  return `${hash.substring(0, lead)}...${hash.substring(hash.length - tail)}`;
}
