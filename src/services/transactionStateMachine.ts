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

export const ERROR_MESSAGES: Record<MachineErrorCode, { title: string; description: string }> = {
  MNO_DOWN: {
    title: 'Mobile Network Operator Unavailable',
    description: 'MTN/Airtel gateway experienced a temporary outage during cash injection.',
  },
  NUMBER_UNREACHABLE: {
    title: 'Recipient Wallet Unreachable',
    description: 'The recipient phone number was rejected by the telecom provider.',
  },
  BRIDGE_TIMEOUT: {
    title: 'USDC Settlement Timeout',
    description: 'On-chain liquidity bridge timed out after 30 seconds.',
  },
  LIMIT_EXCEEDED: {
    title: 'Daily KYC Transfer Limit Exceeded',
    description: 'Transaction exceeds Tier 2 daily limit of $2,000.',
  },
  COMPLIANCE_HOLD: {
    title: 'Transaction Under Security Review',
    description: 'Account flagged for routine verification review. Funds safe.',
  },
  NETWORK_DROP: {
    title: 'Connection Dropped',
    description: 'Device went offline during socket transmission. Queued in outbox.',
  },
};

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
