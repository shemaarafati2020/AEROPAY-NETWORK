import * as SecureStore from 'expo-secure-store';

export type OutboxStatus = 'queued' | 'submitting' | 'submitted' | 'failed';

export interface TransferPayload {
  recipientId?: string;
  recipientName: string;
  recipientPhone: string;
  provider: string;
  sendAmountUsd: number;
  receiveAmountLocal: number;
  targetCurrency: 'KES' | 'RWF';
  exchangeRate: number;
  feeUsd: number;
  fxSpreadUsd: number;
}

export interface OutboxItem {
  idempotencyKey: string; // client-generated UUID created ONCE at confirm time
  createdAt: number;
  payload: TransferPayload;
  status: OutboxStatus;
  attempts: number;
  lastError?: string;
  txHash?: string;
}

const OUTBOX_STORAGE_KEY = 'aeropay_outbox_queue_v1';

// In-Memory Cache for Zero-Latency Synchronous Reads
let cachedOutboxQueue: OutboxItem[] | null = null;
type OutboxListener = (queue: OutboxItem[]) => void;
const listeners = new Set<OutboxListener>();

export function generateUUID(): string {
  return 'ap-idemp-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 9);
}

export function subscribeOutboxQueue(listener: OutboxListener): () => void {
  listeners.add(listener);
  if (cachedOutboxQueue) {
    listener(cachedOutboxQueue);
  } else {
    getOutboxQueue().then(listener);
  }
  return () => listeners.delete(listener);
}

function notifyListeners(queue: OutboxItem[]) {
  listeners.forEach((l) => l(queue));
}

export async function getOutboxQueue(): Promise<OutboxItem[]> {
  if (cachedOutboxQueue) return cachedOutboxQueue;
  try {
    const raw = await SecureStore.getItemAsync(OUTBOX_STORAGE_KEY);
    if (!raw) {
      cachedOutboxQueue = [];
    } else {
      cachedOutboxQueue = JSON.parse(raw) as OutboxItem[];
    }
    return cachedOutboxQueue;
  } catch (error) {
    console.error('Failed to read outbox queue:', error);
    return [];
  }
}

export async function saveOutboxQueue(queue: OutboxItem[]): Promise<void> {
  cachedOutboxQueue = queue;
  notifyListeners(queue);
  try {
    await SecureStore.setItemAsync(OUTBOX_STORAGE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('Failed to save outbox queue:', error);
  }
}

export async function enqueueTransfer(payload: TransferPayload): Promise<OutboxItem> {
  const queue = await getOutboxQueue();
  const newItem: OutboxItem = {
    idempotencyKey: generateUUID(),
    createdAt: Date.now(),
    payload,
    status: 'queued',
    attempts: 0,
  };

  const updatedQueue = [newItem, ...queue];
  await saveOutboxQueue(updatedQueue);
  return newItem;
}

export async function updateOutboxItemStatus(
  idempotencyKey: string,
  status: OutboxStatus,
  error?: string,
  txHash?: string
): Promise<OutboxItem | null> {
  const queue = await getOutboxQueue();
  const index = queue.findIndex((item) => item.idempotencyKey === idempotencyKey);
  if (index === -1) return null;

  const updatedQueue = [...queue];
  updatedQueue[index] = {
    ...updatedQueue[index],
    status,
    attempts: updatedQueue[index].attempts + 1,
    lastError: error || updatedQueue[index].lastError,
    txHash: txHash || updatedQueue[index].txHash,
  };

  await saveOutboxQueue(updatedQueue);
  return updatedQueue[index];
}

export async function removeOutboxItem(idempotencyKey: string): Promise<void> {
  const queue = await getOutboxQueue();
  const filtered = queue.filter((item) => item.idempotencyKey !== idempotencyKey);
  await saveOutboxQueue(filtered);
}

export async function drainOutboxQueue(
  onProcessed?: (item: OutboxItem) => void
): Promise<{ processed: number; failed: number }> {
  const queue = await getOutboxQueue();
  const pending = queue.filter((item) => item.status === 'queued' || item.status === 'failed');

  let processed = 0;
  let failed = 0;

  for (const item of pending) {
    if (item.attempts >= 6) {
      await updateOutboxItemStatus(
        item.idempotencyKey,
        'failed',
        'Max retry attempts reached (6/6). Please contact support.'
      );
      failed++;
      continue;
    }

    await updateOutboxItemStatus(item.idempotencyKey, 'submitting');

    try {
      // Simulate network request with idempotency header check
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockTxHash =
        '0x' +
        Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

      const updated = await updateOutboxItemStatus(
        item.idempotencyKey,
        'submitted',
        undefined,
        mockTxHash
      );
      if (updated && onProcessed) onProcessed(updated);
      processed++;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Network error during settlement';
      await updateOutboxItemStatus(item.idempotencyKey, 'failed', errorMessage);
      failed++;
    }
  }

  return { processed, failed };
}

// Background Auto-Sync Service
let autoSyncInterval: ReturnType<typeof setInterval> | null = null;

export function startAutoSyncPoller(intervalMs = 30000) {
  if (autoSyncInterval) return;
  autoSyncInterval = setInterval(async () => {
    const queue = await getOutboxQueue();
    const hasPending = queue.some((i) => i.status === 'queued');
    if (hasPending) {
      await drainOutboxQueue();
    }
  }, intervalMs);
}

export function stopAutoSyncPoller() {
  if (autoSyncInterval) {
    clearInterval(autoSyncInterval);
    autoSyncInterval = null;
  }
}
