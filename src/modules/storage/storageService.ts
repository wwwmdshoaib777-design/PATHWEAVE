import { ALL_STORES, StorageAdapter, StoreName } from './StorageAdapter';
import { IndexedDBAdapter } from './IndexedDBAdapter';
import { LocalStorageFallbackAdapter } from './LocalStorageFallbackAdapter';

export function createUniqueId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

class StorageService {
  private adapter: StorageAdapter | null = null;
  private initPromise: Promise<StorageAdapter> | null = null;
  private lastError: string | null = null;

  async getAdapter(): Promise<StorageAdapter> {
    if (this.adapter) return this.adapter;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      const idb = new IndexedDBAdapter();
      try {
        await idb.init();
        this.adapter = idb;
        this.lastError = null;
        return idb;
      } catch (err) {
        this.lastError =
          err instanceof Error
            ? `IndexedDB unavailable (${err.message}); using localStorage fallback.`
            : 'IndexedDB unavailable; using localStorage fallback.';
        const fallback = new LocalStorageFallbackAdapter();
        await fallback.init();
        this.adapter = fallback;
        return fallback;
      }
    })();

    return this.initPromise;
  }

  setAdapterForTesting(adapter: StorageAdapter | null): void {
    this.adapter = adapter;
    this.initPromise = adapter ? Promise.resolve(adapter) : null;
    this.lastError = null;
  }

  getLastError(): string | null {
    return this.lastError;
  }

  async getDiagnostics(): Promise<{
    engine: 'IndexedDB' | 'localStorage';
    counts: Record<StoreName, number>;
    error: string | null;
  }> {
    const adapter = await this.getAdapter();
    const entries = await Promise.all(
      ALL_STORES.map(async (store) => [store, await adapter.count(store)] as const)
    );
    return {
      engine: adapter.engineName,
      counts: Object.fromEntries(entries) as Record<StoreName, number>,
      error: this.lastError,
    };
  }

  async resetUserLearningData(): Promise<void> {
    const adapter = await this.getAdapter();
    const userMutableStores: StoreName[] = [
      'progress',
      'topicProgress',
      'adaptiveRecommendations',
      'quizAttempts',
      'downloads',
      'downloadedLessons',
      'materials',
      'students',
      'activity',
      'syncQueue',
      'packets',
    ];
    await Promise.all(userMutableStores.map((store) => adapter.clear(store)));
    const allQuestions = await adapter.getAll<{ id: string; origin?: string }>('quizQuestions');
    const localQuestions = allQuestions.filter((q) => q.origin === 'local');
    await Promise.all(localQuestions.map((q) => adapter.delete('quizQuestions', q.id)));
  }

  async resetAllLocalData(): Promise<void> {
    await this.resetUserLearningData();
  }
}

export const storageService = new StorageService();
