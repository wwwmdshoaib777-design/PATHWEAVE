import { SyncQueueItem } from '../../types/domain';
import { storageService } from '../storage/storageService';

class SyncService {
  async enqueueLocalMutation(
    item: Omit<SyncQueueItem, 'id' | 'createdAt' | 'status'>
  ): Promise<SyncQueueItem> {
    const adapter = await storageService.getAdapter();
    const record: SyncQueueItem = {
      ...item,
      id: `sync-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
      status: 'pending_stage2_sync',
    };
    await adapter.put('syncQueue', record.id, record);
    return record;
  }

  async getQueuedItems(): Promise<SyncQueueItem[]> {
    const adapter = await storageService.getAdapter();
    const items = await adapter.getAll<SyncQueueItem>('syncQueue');
    return items.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
}

export const syncService = new SyncService();
