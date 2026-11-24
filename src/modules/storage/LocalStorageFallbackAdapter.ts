import { StorageAdapter, StoreName } from './StorageAdapter';

const PREFIX = 'pathweave_fallback_v1_';

export class LocalStorageFallbackAdapter implements StorageAdapter {
  readonly engineName = 'localStorage' as const;

  async init(): Promise<void> {
    return;
  }

  private readStore<T>(store: StoreName): Record<string, T> {
    try {
      const raw = window.localStorage.getItem(`${PREFIX}${store}`);
      if (!raw) return {};
      return JSON.parse(raw) as Record<string, T>;
    } catch {
      return {};
    }
  }

  private writeStore<T>(store: StoreName, data: Record<string, T>): void {
    try {
      window.localStorage.setItem(`${PREFIX}${store}`, JSON.stringify(data));
    } catch {
      // Ignore storage quota errors in restricted sandboxes
    }
  }

  async get<T>(store: StoreName, key: string): Promise<T | undefined> {
    const map = this.readStore<T>(store);
    return map[key];
  }

  async getAll<T>(store: StoreName): Promise<T[]> {
    const map = this.readStore<T>(store);
    return Object.values(map);
  }

  async put<T>(store: StoreName, key: string, value: T): Promise<void> {
    const map = this.readStore<T>(store);
    map[key] = value;
    this.writeStore(store, map);
  }

  async delete(store: StoreName, key: string): Promise<void> {
    const map = this.readStore<unknown>(store);
    delete map[key];
    this.writeStore(store, map);
  }

  async clear(store: StoreName): Promise<void> {
    this.writeStore(store, {});
  }

  async count(store: StoreName): Promise<number> {
    const map = this.readStore<unknown>(store);
    return Object.keys(map).length;
  }
}
