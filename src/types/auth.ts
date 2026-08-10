export type UserRole = 'user' | 'admin';

export type UserStatus = 'active' | 'suspended' | 'flagged' | 'pending';

export type KycTier = 'Tier 1 (Basic)' | 'Tier 2 (Verified)' | 'Tier 3 (Institutional)';

export type NotificationTarget = 'all' | 'active' | 'flagged' | 'tier3';

export type NotificationCategory = 'critical' | 'fx_update' | 'security' | 'promo';

export interface AdminBroadcast {
  id: string;
  title: string;
  message: string;
  target: NotificationTarget;
  category: NotificationCategory;
  sentAt: number;
  deliveredCount: number;
  adminEmail: string;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  kycTier: KycTier;
  balanceUsd: number;
  joinedDate: string;
  avatarColor: string;
  lastLogin?: string;
  totalTransferredUsd?: number;
  virtualCardActive?: boolean;
  pinResetRequested?: boolean;
}

export interface AdminAuditLog {
  id: string;
  timestamp: number;
  adminEmail: string;
  action: string;
  targetUserEmail?: string;
  details: string;
  ipAddress: string;
}

export interface SystemSettings {
  rwfRate: number;
  kesRate: number;
  feeSpreadPercent: number;
  flatFeeUsd: number;
  maintenanceMode: boolean;
  autoRoundupSweepActive: boolean;
  paymasterGasCoverage: boolean;
  liquidityPoolReserveUsdc: number;
  // Corridors & Relayers
  rwandaMoMoActive: boolean;
  kenyaMpesaActive: boolean;
  ugandaAirtelActive: boolean;
  maxSingleTxLimitUsd: number;
  amlVelocityThresholdUsd: number;
  virtualCardsMasterActive: boolean;
  gasRelayerBalanceXlm: number;
}

export interface AdminProfileInfo {
  name: string;
  email: string;
  title: string;
  department: string;
  clearanceLevel: string;
  twoFactorEnabled: boolean;
  hardwareKeyEnabled: boolean;
  ipWhitelist: string;
  sessionTimeoutMins: number;
  lastSecurityAudit: string;
}
