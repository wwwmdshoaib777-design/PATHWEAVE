import { ALL_STORES, StorageAdapter, StoreName } from './StorageAdapter';
import { IndexedDBAdapter } from './IndexedDBAdapter';
import { LocalStorageFallbackAdapter } from './LocalStorageFallbackAdapter';

class StorageService {
  private adapter: StorageAdapter | null = null;
  private initPromise: Promise<StorageAdapter> | null = null;

  async getAdapter(): Promise<StorageAdapter> {
    if (this.adapter) return this.adapter;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      const idb = new IndexedDBAdapter();
      try {
        await idb.init();
        this.adapter = idb;
        return idb;
      } catch {
        const fallback = new LocalStorageFallbackAdapter();
        await fallback.init();
        this.adapter = fallback;
        return fallback;
      }
    })();

    return this.initPromise;
  }

  async getDiagnostics(): Promise<{
    engine: 'IndexedDB' | 'localStorage';
    counts: Record<StoreName, number>;
  }> {
    const adapter = await this.getAdapter();
    const entries = await Promise.all(
      ALL_STORES.map(async (store) => [store, await adapter.count(store)] as const)
    );
    return {
      engine: adapter.engineName,
      counts: Object.fromEntries(entries) as Record<StoreName, number>,
    };
  }

  async resetAllLocalData(): Promise<void> {
    const adapter = await this.getAdapter();
    await Promise.all(ALL_STORES.map((store) => adapter.clear(store)));
  }
}

export const storageService = new StorageService();
