import { SyncQueueItem } from '../../types/domain';
import { createUniqueId, storageService } from '../storage/storageService';

export interface SyncAttemptSummary {
  attempted: boolean;
  syncedCount: number;
  retainedCount: number;
  message: string;
  attemptedAt: string;
}

class SyncService {
  async enqueueLocalMutation(
    item: Omit<SyncQueueItem, 'id' | 'createdAt' | 'status' | 'retryCount' | 'lastAttemptAt' | 'lastError'>
  ): Promise<SyncQueueItem> {
    const adapter = await storageService.getAdapter();
    const record: SyncQueueItem = {
      ...item,
      id: createUniqueId('evt'),
      createdAt: new Date().toISOString(),
      status: 'pending',
      retryCount: 0,
      lastAttemptAt: null,
      lastError: null,
    };
    await adapter.put('syncQueue', record.id, record);
    return record;
  }

  async getQueuedItems(): Promise<SyncQueueItem[]> {
    const adapter = await storageService.getAdapter();
    const items = await adapter.getAll<SyncQueueItem>('syncQueue');
    return items
      .map((item) => ({
        ...item,
        status:
          item.status === 'failed_retained' ? ('failed_retained' as const) : ('pending' as const),
        retryCount: item.retryCount ?? 0,
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Stage 2 Sync Attempt:
   * - Never fakes server confirmation.
   * - If offline or server unreachable, keeps every pending event safely in IndexedDB.
   * - If online, checks whether a real Stage 3 sync endpoint (/api/sync) acknowledges receipt;
   *   when no cloud endpoint is deployed yet, marks retry metadata honestly and retains all events.
   */
  async attemptSync(isOnline: boolean): Promise<SyncAttemptSummary> {
    const attemptedAt = new Date().toISOString();
    const queued = await this.getQueuedItems();

    if (queued.length === 0) {
      return {
        attempted: false,
        syncedCount: 0,
        retainedCount: 0,
        message: 'No pending synchronization events in local queue.',
        attemptedAt,
      };
    }

    if (!isOnline) {
      return {
        attempted: false,
        syncedCount: 0,
        retainedCount: queued.length,
        message:
          'Device is offline or unreachable. All pending events remain safely queued in IndexedDB.',
        attemptedAt,
      };
    }

    const adapter = await storageService.getAdapter();
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 4000);

    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: queued }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const reason =
          response.status === 404 || response.status === 405
            ? 'Cloud synchronization endpoint is not deployed yet (Stage 3). Events retained locally.'
            : `Server returned HTTP ${response.status}. Events retained locally for retry.`;

        await Promise.all(
          queued.map((evt) =>
            adapter.put('syncQueue', evt.id, {
              ...evt,
              status: 'failed_retained',
              retryCount: evt.retryCount + 1,
              lastAttemptAt: attemptedAt,
              lastError: reason,
            } satisfies SyncQueueItem)
          )
        );

        return {
          attempted: true,
          syncedCount: 0,
          retainedCount: queued.length,
          message: reason,
          attemptedAt,
        };
      }

      const data = (await response.json().catch(() => null)) as {
        acknowledgedIds?: string[];
      } | null;

      if (!data || !Array.isArray(data.acknowledgedIds)) {
        const reason = 'Server did not return acknowledged event IDs. Events retained locally.';
        await Promise.all(
          queued.map((evt) =>
            adapter.put('syncQueue', evt.id, {
              ...evt,
              status: 'failed_retained',
              retryCount: evt.retryCount + 1,
              lastAttemptAt: attemptedAt,
              lastError: reason,
            } satisfies SyncQueueItem)
          )
        );
        return {
          attempted: true,
          syncedCount: 0,
          retainedCount: queued.length,
          message: reason,
          attemptedAt,
        };
      }

      const ackSet = new Set(data.acknowledgedIds);
      let syncedCount = 0;
      for (const evt of queued) {
        if (ackSet.has(evt.id)) {
          await adapter.delete('syncQueue', evt.id);
          syncedCount += 1;
        }
      }

      return {
        attempted: true,
        syncedCount,
        retainedCount: queued.length - syncedCount,
        message: `Synchronized ${syncedCount} event(s).`,
        attemptedAt,
      };
    } catch {
      const reason = 'Network request failed before server confirmation. Events retained locally.';
      await Promise.all(
        queued.map((evt) =>
          adapter.put('syncQueue', evt.id, {
            ...evt,
            status: 'failed_retained',
            retryCount: evt.retryCount + 1,
            lastAttemptAt: attemptedAt,
            lastError: reason,
          } satisfies SyncQueueItem)
        )
      );
      return {
        attempted: true,
        syncedCount: 0,
        retainedCount: queued.length,
        message: reason,
        attemptedAt,
      };
    } finally {
      window.clearTimeout(timeout);
    }
  }
}

export const syncService = new SyncService();
