export interface CarrierInfo {
  carrier: 'MTN_RW' | 'AIRTEL_RW' | 'SAFARICOM_KE' | 'AIRTEL_KE' | 'TELKOM_KE' | 'UNKNOWN';
  country: 'RW' | 'KE' | 'UNKNOWN';
  name: string;
  shortName: string;
  brandColor: string;
  defaultCurrency: 'RWF' | 'KES' | 'USD';
}

/**
 * Validates a general phone number string using standard E.164 pattern.
 */
export function validatePhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  return /^\+?[1-9]\d{8,14}$/.test(cleaned);
}

/**
 * Normalizes phone numbers to standard E.164 international format (+250... or +254...)
 */
export function normalizePhoneNumber(phone: string, defaultCountry: 'RW' | 'KE' = 'RW'): string {
  if (!phone) return '';
  const digitsOnly = phone.replace(/\D/g, '');

  // Handle local formats starting with 0
  if (digitsOnly.startsWith('0')) {
    const local = digitsOnly.substring(1);
    const countryPrefix = defaultCountry === 'RW' ? '250' : '254';
    return `+${countryPrefix}${local}`;
  }

  // Handle already prefixed without plus
  if (digitsOnly.startsWith('250') || digitsOnly.startsWith('254')) {
    return `+${digitsOnly}`;
  }

  // Handle 9-digit local numbers without leading 0 for Rwanda (e.g. 788123456)
  if (digitsOnly.length === 9 && defaultCountry === 'RW') {
    return `+250${digitsOnly}`;
  }

  // Handle 9-digit local numbers without leading 0 for Kenya (e.g. 712345678)
  if (digitsOnly.length === 9 && defaultCountry === 'KE') {
    return `+254${digitsOnly}`;
  }

  return phone.startsWith('+') ? phone.replace(/\s+/g, '') : `+${digitsOnly}`;
}

/**
 * Detects East African telecom mobile money provider from phone prefix
 */
export function detectCarrier(phone: string): CarrierInfo {
  const normalized = normalizePhoneNumber(phone);

  // Rwanda corridor: +250
  if (normalized.startsWith('+250')) {
    const localNumber = normalized.substring(4); // 9 digits
    if (localNumber.startsWith('78') || localNumber.startsWith('79')) {
      return {
        carrier: 'MTN_RW',
        country: 'RW',
        name: 'MTN Mobile Money (MoMo)',
        shortName: 'MTN MoMo',
        brandColor: '#FFCC00',
        defaultCurrency: 'RWF',
      };
    }
    if (localNumber.startsWith('72') || localNumber.startsWith('73')) {
      return {
        carrier: 'AIRTEL_RW',
        country: 'RW',
        name: 'Airtel Money Rwanda',
        shortName: 'Airtel Money',
        brandColor: '#ED1C24',
        defaultCurrency: 'RWF',
      };
    }
    return {
      carrier: 'UNKNOWN',
      country: 'RW',
      name: 'Rwanda Telecom',
      shortName: 'RW Local',
      brandColor: '#3B82F6',
      defaultCurrency: 'RWF',
    };
  }

  // Kenya corridor: +254
  if (normalized.startsWith('+254')) {
    const localNumber = normalized.substring(4); // 9 digits
    const prefix2 = localNumber.substring(0, 2);
    const prefix3 = localNumber.substring(0, 3);

    // Safaricom M-PESA: 070, 071, 072, 079, 0740-0743, 0110-0115
    if (
      prefix2 === '70' ||
      prefix2 === '71' ||
      prefix2 === '72' ||
      prefix2 === '79' ||
      ['740', '741', '742', '743'].includes(prefix3) ||
      ['110', '111', '112', '113', '114', '115'].includes(prefix3)
    ) {
      return {
        carrier: 'SAFARICOM_KE',
        country: 'KE',
        name: 'Safaricom M-PESA',
        shortName: 'M-PESA',
        brandColor: '#00A859',
        defaultCurrency: 'KES',
      };
    }

    // Airtel Money Kenya: 073, 075, 078
    if (prefix2 === '73' || prefix2 === '75' || prefix2 === '78') {
      return {
        carrier: 'AIRTEL_KE',
        country: 'KE',
        name: 'Airtel Money Kenya',
        shortName: 'Airtel Money',
        brandColor: '#ED1C24',
        defaultCurrency: 'KES',
      };
    }

    // Telkom T-Kash: 077
    if (prefix2 === '77') {
      return {
        carrier: 'TELKOM_KE',
        country: 'KE',
        name: 'Telkom T-Kash',
        shortName: 'T-Kash',
        brandColor: '#005CA9',
        defaultCurrency: 'KES',
      };
    }

    return {
      carrier: 'UNKNOWN',
      country: 'KE',
      name: 'Kenya Telecom',
      shortName: 'KE Local',
      brandColor: '#3B82F6',
      defaultCurrency: 'KES',
    };
  }

  return {
    carrier: 'UNKNOWN',
    country: 'UNKNOWN',
    name: 'Standard Mobile Network',
    shortName: 'Mobile',
    brandColor: '#6B7280',
    defaultCurrency: 'USD',
  };
}

export interface AmountValidationResult {
  isValid: boolean;
  error?: string;
  minAmountUsd: number;
  maxAmountUsd: number;
}

/**
 * Validates corridor transfer limits according to regulatory KYC tiers
 */
export function validateTransferAmount(
  amountUsd: number,
  kycTier: 'tier1' | 'tier2' | 'tier3' = 'tier2'
): AmountValidationResult {
  const minAmountUsd = 1.0;
  const maxTierLimits: Record<'tier1' | 'tier2' | 'tier3', number> = {
    tier1: 500.0,
    tier2: 2000.0,
    tier3: 10000.0,
  };

  const maxAmountUsd = maxTierLimits[kycTier] || 2000.0;

  if (isNaN(amountUsd) || amountUsd <= 0) {
    return {
      isValid: false,
      error: 'Please enter a valid transfer amount greater than $0',
      minAmountUsd,
      maxAmountUsd,
    };
  }

  if (amountUsd < minAmountUsd) {
    return {
      isValid: false,
      error: `Minimum transfer amount is $${minAmountUsd.toFixed(2)} USDC`,
      minAmountUsd,
      maxAmountUsd,
    };
  }

  if (amountUsd > maxAmountUsd) {
    return {
      isValid: false,
      error: `Maximum single transfer for ${kycTier.toUpperCase()} is $${maxAmountUsd.toLocaleString()} USDC`,
      minAmountUsd,
      maxAmountUsd,
    };
  }

  return {
    isValid: true,
    minAmountUsd,
    maxAmountUsd,
  };
}

/**
 * Validates unique client idempotency keys
 */
export function validateIdempotencyKey(key: string): boolean {
  if (!key || typeof key !== 'string') return false;
  return /^ap-idemp-[a-z0-9\-_]{8,}$/i.test(key);
}
