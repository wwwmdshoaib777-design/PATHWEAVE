import { ALL_STORES, StorageAdapter, StoreName } from './StorageAdapter';

const DB_NAME = 'pathweave_local_db';
const DB_VERSION = 1;

interface StoredEnvelope<T> {
  id: string;
  payload: T;
}

export class IndexedDBAdapter implements StorageAdapter {
  readonly engineName = 'IndexedDB' as const;
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise<void>((resolve, reject) => {
      if (typeof indexedDB === 'undefined') {
        reject(new Error('IndexedDB is not available in this environment.'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const database = request.result;
        for (const storeName of ALL_STORES) {
          if (!database.objectStoreNames.contains(storeName)) {
            database.createObjectStore(storeName, { keyPath: 'id' });
          }
        }
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onerror = () => {
        reject(request.error ?? new Error('Failed to open IndexedDB.'));
      };
    });

    return this.initPromise;
  }

  private async ensureDb(): Promise<IDBDatabase> {
    await this.init();
    if (!this.db) {
      throw new Error('IndexedDB connection is not initialized.');
    }
    return this.db;
  }

  async get<T>(store: StoreName, key: string): Promise<T | undefined> {
    const db = await this.ensureDb();
    return new Promise<T | undefined>((resolve, reject) => {
      const tx = db.transaction(store, 'readonly');
      const req = tx.objectStore(store).get(key);
      req.onsuccess = () => {
        const result = req.result as StoredEnvelope<T> | undefined;
        resolve(result ? result.payload : undefined);
      };
      req.onerror = () => reject(req.error);
    });
  }

  async getAll<T>(store: StoreName): Promise<T[]> {
    const db = await this.ensureDb();
    return new Promise<T[]>((resolve, reject) => {
      const tx = db.transaction(store, 'readonly');
      const req = tx.objectStore(store).getAll();
      req.onsuccess = () => {
        const rows = (req.result as StoredEnvelope<T>[]) ?? [];
        resolve(rows.map((row) => row.payload));
      };
      req.onerror = () => reject(req.error);
    });
  }

  async put<T>(store: StoreName, key: string, value: T): Promise<void> {
    const db = await this.ensureDb();
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction(store, 'readwrite');
      const envelope: StoredEnvelope<T> = { id: key, payload: value };
      const req = tx.objectStore(store).put(envelope);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async delete(store: StoreName, key: string): Promise<void> {
    const db = await this.ensureDb();
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction(store, 'readwrite');
      const req = tx.objectStore(store).delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async clear(store: StoreName): Promise<void> {
    const db = await this.ensureDb();
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction(store, 'readwrite');
      const req = tx.objectStore(store).clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async count(store: StoreName): Promise<number> {
    const db = await this.ensureDb();
    return new Promise<number>((resolve, reject) => {
      const tx = db.transaction(store, 'readonly');
      const req = tx.objectStore(store).count();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
}
