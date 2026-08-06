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
    roundUpEnabled: true,
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
    roundUpEnabled: params.roundUpEnabled ?? true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const updatedVaults = [newVault, ...vaults];
  await saveVaults(updatedVaults);
  return newVault;
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
