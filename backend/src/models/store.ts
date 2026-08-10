import {
  User,
  AdminBroadcast,
  SystemSettings,
  AuditLog,
  RemittanceTransaction,
} from '../types/index.js';
import { config } from '../config/index.js';

export const INITIAL_USERS: User[] = [
  {
    id: 'user_shema',
    name: 'Shema Arafati',
    email: 'user@aeropay.network',
    phone: '+250 788 123 456',
    role: 'user',
    status: 'active',
    kycTier: 'Tier 2 (Verified)',
    balanceUsd: 1250.75,
    balanceRwf: 1776065,
    balanceKes: 161972,
    virtualCardActive: true,
    avatarColor: '#A51C24',
    totalTransferredUsd: 4850.0,
    joinedAt: '2026-01-15T08:00:00Z',
  },
  {
    id: 'admin_root',
    name: 'AeroPay Supervisor (Root)',
    email: 'admin@aeropay.network',
    phone: '+250 788 000 000',
    role: 'admin',
    status: 'active',
    kycTier: 'Tier 3 (Institutional)',
    balanceUsd: 50000.0,
    balanceRwf: 71000000,
    balanceKes: 6475000,
    virtualCardActive: true,
    avatarColor: '#6366F1',
    totalTransferredUsd: 1250000.0,
    joinedAt: '2025-11-01T00:00:00Z',
  },
  {
    id: 'user_alice',
    name: 'Alice Uwase',
    email: 'alice.uwase@gmail.com',
    phone: '+250 789 234 567',
    role: 'user',
    status: 'active',
    kycTier: 'Tier 2 (Verified)',
    balanceUsd: 3400.5,
    balanceRwf: 4828710,
    balanceKes: 440364,
    virtualCardActive: true,
    avatarColor: '#10B981',
    totalTransferredUsd: 12800.0,
    joinedAt: '2026-02-10T14:20:00Z',
  },
  {
    id: 'user_david',
    name: 'David Ochieng',
    email: 'david.ochieng@yahoo.co.ke',
    phone: '+254 712 345 678',
    role: 'user',
    status: 'active',
    kycTier: 'Tier 3 (Institutional)',
    balanceUsd: 8920.0,
    balanceRwf: 12666400,
    balanceKes: 1155140,
    virtualCardActive: true,
    avatarColor: '#F59E0B',
    totalTransferredUsd: 45000.0,
    joinedAt: '2026-01-20T11:15:00Z',
  },
  {
    id: 'user_kevin',
    name: 'Kevin Mugisha',
    email: 'kevin.mugisha@finance.rw',
    phone: '+250 785 678 901',
    role: 'user',
    status: 'flagged',
    kycTier: 'Tier 1 (Basic)',
    balanceUsd: 450.0,
    balanceRwf: 639000,
    balanceKes: 58275,
    virtualCardActive: false,
    avatarColor: '#EC4899',
    totalTransferredUsd: 1850.0,
    joinedAt: '2026-03-01T09:45:00Z',
  },
];

export const INITIAL_BROADCASTS: AdminBroadcast[] = [
  {
    id: 'bc_1',
    title: 'Weekend 0% FX Remittance Fee',
    message: 'Send money to MTN MoMo Rwanda & M-Pesa Kenya with zero platform fees all weekend.',
    target: 'all',
    category: 'promo',
    sentAt: '2026-08-09T18:30:00Z',
    sentBy: 'admin@aeropay.network',
    deliveredCount: 7,
  },
  {
    id: 'bc_2',
    title: 'Soroban Smart Contract Upgrade',
    message: 'Anchor Settlement relayer pool upgraded to Soroban v21. Instant finality guaranteed.',
    target: 'all',
    category: 'critical',
    sentAt: '2026-08-08T12:00:00Z',
    sentBy: 'admin@aeropay.network',
    deliveredCount: 7,
  },
];

export const INITIAL_SETTINGS: SystemSettings = {
  rwfRate: 1420.0,
  kesRate: 129.5,
  feeSpreadPercent: 0.15,
  maxSingleTxLimitUsd: 10000.0,
  liquidityPoolReserveUsdc: config.initialAnchorReserveUsdc,
  gasRelayerBalanceXlm: config.initialGasRelayerXlm,
  rwandaMoMoActive: true,
  kenyaMpesaActive: true,
  ugandaAirtelActive: true,
  maintenanceMode: false,
};

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log_1',
    adminEmail: 'admin@aeropay.network',
    action: 'BROADCAST_DISPATCH',
    details: 'Dispatched broadcast: Weekend 0% FX Remittance Fee to ALL users (7 recipients)',
    timestamp: '2026-08-09T18:30:00Z',
    ipAddress: '197.243.22.18',
  },
  {
    id: 'log_2',
    adminEmail: 'admin@aeropay.network',
    action: 'GAS_RELAYER_TOPUP',
    details: 'Injected +10,000 XLM into Soroban Paymaster Gas Relayer Tank',
    timestamp: '2026-08-08T14:15:00Z',
    ipAddress: '197.243.22.18',
  },
];

export const transactionsStore: RemittanceTransaction[] = [];
export const usersStore: User[] = [...INITIAL_USERS];
export const broadcastsStore: AdminBroadcast[] = [...INITIAL_BROADCASTS];
export const settingsStore: SystemSettings = { ...INITIAL_SETTINGS };
export const auditLogsStore: AuditLog[] = [...INITIAL_AUDIT_LOGS];
