import * as SecureStore from 'expo-secure-store';

export interface Vault {
  id: string;
  name: string;
  category: 'education' | 'rent' | 'emergency' | 'business' | 'general';
  targetAmount?: number;
  targetDate?: string;
  balance: number;
  locked: boolean;
  roundUpEnabled: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface VaultLedgerEntry {
  id: string;
  vaultId: string;
  type: 'deposit' | 'withdrawal' | 'roundup_sweep';
  amountUsd: number;
  note: string;
  timestamp: number;
}

export interface VaultProgress {
  progressPercent: number;
  remainingAmount: number;
  isGoalReached: boolean;
  daysRemaining?: number;
}

export interface VaultsAnalyticsSummary {
  totalSavedUsd: number;
  totalTargetUsd: number;
  overallProgressPercent: number;
  activeVaultsCount: number;
  lockedSavingsUsd: number;
  roundUpEnabledCount: number;
}

const VAULTS_STORAGE_KEY = 'aeropay_savings_vaults_v1';
const VAULT_LEDGER_KEY = 'aeropay_vault_ledger_v1';

let cachedVaults: Vault[] | null = null;

export const INITIAL_VAULTS: Vault[] = [
  {
    id: 'vault-school-fees',
    name: 'School Fees 2026',
    category: 'education',
    targetAmount: 500,
    targetDate: '2026-09-01',
    balance: 320.5,
    locked: false,
    roundUpEnabled: true,
    createdAt: Date.now() - 30 * 86400000,
    updatedAt: Date.now() - 86400000,
  },
  {
    id: 'vault-rent',
    name: 'Kigali Apartment Rent',
    category: 'rent',
    targetAmount: 800,
    targetDate: '2026-10-01',
    balance: 450.0,
    locked: true,
    roundUpEnabled: false,
    createdAt: Date.now() - 60 * 86400000,
    updatedAt: Date.now() - 2 * 86400000,
  },
  {
    id: 'vault-emergency',
    name: 'Emergency Fund',
    category: 'emergency',
    targetAmount: 1000,
    balance: 150.0,
    locked: false,
    roundUpEnabled: false,
    createdAt: Date.now() - 90 * 86400000,
    updatedAt: Date.now() - 5 * 86400000,
  },
];

export async function getVaults(): Promise<Vault[]> {
  if (cachedVaults) return cachedVaults;
  try {
    const raw = await SecureStore.getItemAsync(VAULTS_STORAGE_KEY);
    if (!raw) {
      cachedVaults = INITIAL_VAULTS;
      await SecureStore.setItemAsync(VAULTS_STORAGE_KEY, JSON.stringify(INITIAL_VAULTS));
      return INITIAL_VAULTS;
    }
    cachedVaults = JSON.parse(raw) as Vault[];
    return cachedVaults;
  } catch (err) {
    console.error('Failed to fetch vaults:', err);
    return INITIAL_VAULTS;
  }
}

export async function saveVaults(vaults: Vault[]): Promise<void> {
  cachedVaults = vaults;
  try {
    await SecureStore.setItemAsync(VAULTS_STORAGE_KEY, JSON.stringify(vaults));
  } catch (err) {
    console.error('Failed to save vaults:', err);
  }
}

/**
 * Computes progress analytics and completion projections for a vault
 */
export function getVaultProgress(vault: Vault): VaultProgress {
  const target = vault.targetAmount || 0;
  if (target <= 0) {
    return {
      progressPercent: 1.0,
      remainingAmount: 0,
      isGoalReached: true,
    };
  }

  const progressPercent = Math.min(1.0, Math.max(0, vault.balance / target));
  const remainingAmount = Math.max(0, target - vault.balance);
  const isGoalReached = vault.balance >= target;

  let daysRemaining: number | undefined;
  if (vault.targetDate) {
    const targetTimestamp = new Date(vault.targetDate).getTime();
    if (!isNaN(targetTimestamp)) {
      const diffMs = targetTimestamp - Date.now();
      daysRemaining = Math.max(0, Math.ceil(diffMs / 86400000));
    }
  }

  return {
    progressPercent,
    remainingAmount,
    isGoalReached,
    daysRemaining,
  };
}

/**
 * Aggregates high-level analytics across all active vaults
 */
export function getVaultsAnalyticsSummary(vaults: Vault[]): VaultsAnalyticsSummary {
  const totalSavedUsd = vaults.reduce((sum, v) => sum + (v.balance || 0), 0);
  const totalTargetUsd = vaults.reduce((sum, v) => sum + (v.targetAmount || 0), 0);
  const overallProgressPercent =
    totalTargetUsd > 0 ? Math.min(1.0, totalSavedUsd / totalTargetUsd) : 1.0;

  const lockedSavingsUsd = vaults
    .filter((v) => v.locked)
    .reduce((sum, v) => sum + (v.balance || 0), 0);

  const roundUpEnabledCount = vaults.filter((v) => v.roundUpEnabled).length;

  return {
    totalSavedUsd,
    totalTargetUsd,
    overallProgressPercent,
    activeVaultsCount: vaults.length,
    lockedSavingsUsd,
    roundUpEnabledCount,
  };
}

export async function createVault(params: {
  name: string;
  category: Vault['category'];
  targetAmount?: number;
  targetDate?: string;
  initialDeposit?: number;
  roundUpEnabled?: boolean;
}): Promise<Vault> {
  const vaults = await getVaults();
  const newVault: Vault = {
    id: 'vault-' + Date.now(),
    name: params.name,
    category: params.category,
    targetAmount: params.targetAmount,
    targetDate: params.targetDate,
    balance: params.initialDeposit || 0,
    locked: false,
    roundUpEnabled: params.roundUpEnabled ?? false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const updatedVaults = [newVault, ...vaults];
  await saveVaults(updatedVaults);
  return newVault;
}

export async function toggleVaultLock(vaultId: string): Promise<Vault | null> {
  const vaults = await getVaults();
  const index = vaults.findIndex((v) => v.id === vaultId);
  if (index === -1) return null;

  const updatedVaults = [...vaults];
  updatedVaults[index] = {
    ...updatedVaults[index],
    locked: !updatedVaults[index].locked,
    updatedAt: Date.now(),
  };

  await saveVaults(updatedVaults);
  return updatedVaults[index];
}

export async function toggleRoundUpSweep(vaultId: string): Promise<Vault | null> {
  const vaults = await getVaults();
  const index = vaults.findIndex((v) => v.id === vaultId);
  if (index === -1) return null;

  const targetState = !vaults[index].roundUpEnabled;
  // If enabling this vault, disable roundups on other vaults to avoid multi-charging
  const updatedVaults = vaults.map((v, i) => {
    if (i === index) {
      return { ...v, roundUpEnabled: targetState, updatedAt: Date.now() };
    }
    return targetState ? { ...v, roundUpEnabled: false } : v;
  });

  await saveVaults(updatedVaults);
  return updatedVaults[index];
}

export async function depositToVault(
  vaultId: string,
  amount: number,
  note = 'Manual Deposit'
): Promise<Vault | null> {
  const vaults = await getVaults();
  const index = vaults.findIndex((v) => v.id === vaultId);
  if (index === -1) return null;

  const updatedVaults = [...vaults];
  updatedVaults[index] = {
    ...updatedVaults[index],
    balance: updatedVaults[index].balance + amount,
    updatedAt: Date.now(),
  };
  await saveVaults(updatedVaults);

  await recordVaultLedger({
    vaultId,
    type: 'deposit',
    amountUsd: amount,
    note,
  });

  return updatedVaults[index];
}

export async function withdrawFromVault(
  vaultId: string,
  amount: number,
  note = 'Withdrawal to Spendable Balance'
): Promise<{ success: boolean; vault?: Vault; error?: string }> {
  const vaults = await getVaults();
  const index = vaults.findIndex((v) => v.id === vaultId);
  if (index === -1) return { success: false, error: 'Vault not found' };

  const target = vaults[index];
  if (target.locked) {
    return { success: false, error: 'Vault is currently locked until target date.' };
  }
  if (target.balance < amount) {
    return { success: false, error: 'Insufficient vault balance.' };
  }

  const updatedVaults = [...vaults];
  updatedVaults[index] = {
    ...target,
    balance: target.balance - amount,
    updatedAt: Date.now(),
  };

  await saveVaults(updatedVaults);

  await recordVaultLedger({
    vaultId,
    type: 'withdrawal',
    amountUsd: amount,
    note,
  });

  return { success: true, vault: updatedVaults[index] };
}

export function calculateRoundUp(amountUsd: number): number {
  const nextDollar = Math.ceil(amountUsd);
  const diff = Number((nextDollar - amountUsd).toFixed(2));
  return diff > 0 ? diff : 0;
}

export async function processRoundUpSweep(sendAmountUsd: number): Promise<number> {
  const diff = calculateRoundUp(sendAmountUsd);
  if (diff <= 0) return 0;

  const vaults = await getVaults();
  const targetVault = vaults.find((v) => v.roundUpEnabled);
  if (!targetVault) return 0;

  await depositToVault(targetVault.id, diff, `Auto-Roundup sweep ($${sendAmountUsd.toFixed(2)})`);
  return diff;
}

export async function processBatchRoundUpSweeps(
  transfers: { sendAmountUsd: number }[]
): Promise<number> {
  let totalSwept = 0;
  for (const tx of transfers) {
    const swept = await processRoundUpSweep(tx.sendAmountUsd);
    totalSwept += swept;
  }
  return totalSwept;
}

async function recordVaultLedger(params: {
  vaultId: string;
  type: VaultLedgerEntry['type'];
  amountUsd: number;
  note: string;
}): Promise<void> {
  try {
    const raw = await SecureStore.getItemAsync(VAULT_LEDGER_KEY);
    const ledger: VaultLedgerEntry[] = raw ? JSON.parse(raw) : [];
    ledger.unshift({
      id: 'ledg-' + Date.now(),
      vaultId: params.vaultId,
      type: params.type,
      amountUsd: params.amountUsd,
      note: params.note,
      timestamp: Date.now(),
    });
    await SecureStore.setItemAsync(VAULT_LEDGER_KEY, JSON.stringify(ledger.slice(0, 100)));
  } catch (err) {
    console.error('Failed to write vault ledger:', err);
  }
}
