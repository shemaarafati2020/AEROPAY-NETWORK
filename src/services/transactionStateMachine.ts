export type TxState =
  | 'Authenticating'
  | 'Bridging USDC'
  | 'Contacting MNO'
  | 'Delivered'
  | 'Failed'
  | 'Reversing'
  | 'Refunded'
  | 'Manual Review (held)';

export type MachineErrorCode =
  | 'MNO_DOWN'
  | 'NUMBER_UNREACHABLE'
  | 'BRIDGE_TIMEOUT'
  | 'LIMIT_EXCEEDED'
  | 'COMPLIANCE_HOLD'
  | 'NETWORK_DROP';

export interface TxStatusHistoryItem {
  state: TxState;
  timestamp: number;
  note: string;
}

export interface MachineTransaction {
  id: string;
  refId: string;
  idempotencyKey: string;
  senderName: string;
  recipientName: string;
  recipientPhone: string;
  provider: string;
  amountUsd: number;
  receiveLocalAmount: number;
  currency: 'KES' | 'RWF';
  exchangeRate: number;
  feeUsd: number;
  fxSpreadUsd: number;
  currentState: TxState;
  errorCode?: MachineErrorCode;
  errorMessage?: string;
  refundEtaSeconds?: number;
  txHash?: string;
  history: TxStatusHistoryItem[];
}

export const ERROR_MESSAGES: Record<
  MachineErrorCode,
  { title: string; description: string; actionText: string }
> = {
  MNO_DOWN: {
    title: 'Mobile Network Operator Unavailable',
    description: 'MTN/Airtel gateway experienced a temporary outage during cash injection.',
    actionText: 'Retry Injection',
  },
  NUMBER_UNREACHABLE: {
    title: 'Recipient Wallet Unreachable',
    description: 'The recipient phone number was rejected by the telecom provider.',
    actionText: 'Edit Recipient Phone',
  },
  BRIDGE_TIMEOUT: {
    title: 'USDC Settlement Timeout',
    description: 'On-chain liquidity bridge timed out after 30 seconds.',
    actionText: 'Re-query Paymaster',
  },
  LIMIT_EXCEEDED: {
    title: 'Daily KYC Transfer Limit Exceeded',
    description: 'Transaction exceeds Tier 2 daily limit of $2,000.',
    actionText: 'Upgrade KYC Tier',
  },
  COMPLIANCE_HOLD: {
    title: 'Transaction Under Security Review',
    description: 'Account flagged for routine verification review. Funds safe.',
    actionText: 'View Compliance Ticket',
  },
  NETWORK_DROP: {
    title: 'Connection Dropped',
    description: 'Device went offline during socket transmission. Queued in outbox.',
    actionText: 'Retry Synchronously',
  },
};

const ALLOWED_TRANSITIONS: Record<TxState, TxState[]> = {
  Authenticating: ['Bridging USDC', 'Failed'],
  'Bridging USDC': ['Contacting MNO', 'Failed'],
  'Contacting MNO': ['Delivered', 'Reversing', 'Manual Review (held)', 'Failed'],
  Delivered: [],
  Reversing: ['Refunded', 'Failed'],
  Refunded: [],
  'Manual Review (held)': ['Delivered', 'Reversing', 'Refunded', 'Failed'],
  Failed: ['Authenticating', 'Bridging USDC'],
};

/**
 * Validates whether the state machine transition is legally permitted
 */
export function isValidTransition(from: TxState, to: TxState): boolean {
  const legalNextStates = ALLOWED_TRANSITIONS[from];
  return legalNextStates ? legalNextStates.includes(to) : false;
}

/**
 * Calculates exponential backoff with full jitter for distributed recovery
 */
export function calculateNextRetryDelay(attempt: number, baseMs = 1000, maxMs = 30000): number {
  const exp = Math.min(attempt, 6);
  const calculated = baseMs * Math.pow(2, exp);
  const capped = Math.min(calculated, maxMs);
  // Full jitter: random between 0.5 * capped and capped
  return Math.floor(0.5 * capped + Math.random() * 0.5 * capped);
}

/**
 * Evaluates AML / Velocity risk scoring for financial safety
 */
export function evaluateComplianceRisk(tx: Partial<MachineTransaction>): {
  isFlagged: boolean;
  riskScore: number;
  reason?: string;
} {
  let riskScore = 0;
  const reasons: string[] = [];

  if ((tx.amountUsd || 0) > 1500) {
    riskScore += 45;
    reasons.push('High value corridor remittance (> $1,500)');
  }

  if (tx.errorCode === 'COMPLIANCE_HOLD') {
    riskScore += 60;
    reasons.push('Triggered compliance review flag');
  }

  const isFlagged = riskScore >= 50;
  return {
    isFlagged,
    riskScore,
    reason: reasons.length > 0 ? reasons.join('; ') : undefined,
  };
}

/**
 * Returns UI progress metadata for the state machine
 */
export function getTransactionStateProgress(state: TxState): {
  percent: number;
  label: string;
  isTerminal: boolean;
  isError: boolean;
} {
  switch (state) {
    case 'Authenticating':
      return { percent: 0.2, label: 'Verifying Security Token', isTerminal: false, isError: false };
    case 'Bridging USDC':
      return { percent: 0.5, label: 'Bridging USDC Liquidity', isTerminal: false, isError: false };
    case 'Contacting MNO':
      return { percent: 0.8, label: 'Injecting Telecom Cash', isTerminal: false, isError: false };
    case 'Delivered':
      return {
        percent: 1.0,
        label: 'Funds Delivered to Mobile Wallet',
        isTerminal: true,
        isError: false,
      };
    case 'Reversing':
      return {
        percent: 0.85,
        label: 'Executing Safe Auto-Reversal',
        isTerminal: false,
        isError: true,
      };
    case 'Refunded':
      return { percent: 1.0, label: 'Funds Refunded to Balance', isTerminal: true, isError: false };
    case 'Manual Review (held)':
      return {
        percent: 0.75,
        label: 'Held for Operator Confirmation',
        isTerminal: false,
        isError: true,
      };
    case 'Failed':
    default:
      return { percent: 1.0, label: 'Settlement Interrupted', isTerminal: true, isError: true };
  }
}

/**
 * Pure state progression function that immutably transitions a transaction
 */
export function advanceTransactionState(
  tx: MachineTransaction,
  nextState: TxState,
  note?: string
): MachineTransaction {
  const timestamp = Date.now();
  const defaultNote = `State progressed from ${tx.currentState} to ${nextState}`;

  return {
    ...tx,
    currentState: nextState,
    history: [
      ...tx.history,
      {
        state: nextState,
        timestamp,
        note: note || defaultNote,
      },
    ],
  };
}

export function createInitialMachineTransaction(params: {
  idempotencyKey: string;
  recipientName: string;
  recipientPhone: string;
  provider: string;
  amountUsd: number;
  receiveLocalAmount: number;
  currency: 'KES' | 'RWF';
  exchangeRate: number;
  feeUsd: number;
  fxSpreadUsd: number;
  simulateFailureCode?: MachineErrorCode;
}): MachineTransaction {
  const refId = 'AP-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  const timestamp = Date.now();

  return {
    id: 'tx-' + timestamp,
    refId,
    idempotencyKey: params.idempotencyKey,
    senderName: 'Shema Arafati',
    recipientName: params.recipientName,
    recipientPhone: params.recipientPhone,
    provider: params.provider,
    amountUsd: params.amountUsd,
    receiveLocalAmount: params.receiveLocalAmount,
    currency: params.currency,
    exchangeRate: params.exchangeRate,
    feeUsd: params.feeUsd,
    fxSpreadUsd: params.fxSpreadUsd,
    currentState: 'Authenticating',
    errorCode: params.simulateFailureCode,
    history: [
      {
        state: 'Authenticating',
        timestamp,
        note: 'Biometric authorization verified & idempotency key attached.',
      },
    ],
  };
}
