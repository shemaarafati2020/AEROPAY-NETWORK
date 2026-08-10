export type UserRole = 'user' | 'admin';
export type UserStatus = 'active' | 'suspended' | 'flagged';
export type KycTier = 'Tier 1 (Basic)' | 'Tier 2 (Verified)' | 'Tier 3 (Institutional)';

export type NotificationTarget = 'all' | 'active' | 'flagged' | 'tier3';
export type NotificationCategory = 'promo' | 'fx_update' | 'critical' | 'security';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  kycTier: KycTier;
  balanceUsd: number;
  balanceRwf: number;
  balanceKes: number;
  virtualCardActive: boolean;
  avatarColor: string;
  totalTransferredUsd: number;
  joinedAt: string;
}

export interface AdminBroadcast {
  id: string;
  title: string;
  message: string;
  target: NotificationTarget;
  category: NotificationCategory;
  sentAt: string;
  sentBy: string;
  deliveredCount: number;
}

export interface SystemSettings {
  rwfRate: number;
  kesRate: number;
  feeSpreadPercent: number;
  maxSingleTxLimitUsd: number;
  liquidityPoolReserveUsdc: number;
  gasRelayerBalanceXlm: number;
  rwandaMoMoActive: boolean;
  kenyaMpesaActive: boolean;
  ugandaAirtelActive: boolean;
  maintenanceMode: boolean;
}

export interface AuditLog {
  id: string;
  adminEmail: string;
  action: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}

export interface RemittanceRequest {
  senderId: string;
  recipientPhone: string;
  recipientName: string;
  sourceAmountUsd: number;
  targetCurrency: 'RWF' | 'KES';
  corridor: 'RW_MOMO' | 'KE_MPESA';
}

export interface RemittanceTransaction {
  id: string;
  senderId: string;
  recipientName: string;
  recipientPhone: string;
  sourceAmountUsd: number;
  targetAmount: number;
  targetCurrency: 'RWF' | 'KES';
  rate: number;
  feeUsd: number;
  status: 'PENDING' | 'SETTLED' | 'FAILED';
  stellarTxHash?: string;
  createdAt: string;
}
