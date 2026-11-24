import { ALL_STORES, StorageAdapter, StoreName } from './StorageAdapter';

const DB_NAME = 'pathweave_local_db';
const DB_VERSION = 3;

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

      request.onblocked = () => {
        this.initPromise = null;
        reject(new Error('IndexedDB upgrade blocked by another open tab.'));
      };

      request.onsuccess = () => {
        const database = request.result;
        database.onversionchange = () => {
          database.close();
          this.db = null;
          this.initPromise = null;
        };
        database.onclose = () => {
          this.db = null;
          this.initPromise = null;
        };
        this.db = database;
        resolve();
      };

      request.onerror = () => {
        this.initPromise = null;
        reject(request.error ?? new Error('Failed to open IndexedDB.'));
      };
    });

    return this.initPromise;
  }

  private async ensureDb(): Promise<IDBDatabase> {
    await this.init();
    if (!this.db) {
      this.initPromise = null;
      await this.init();
    }
    if (!this.db) {
      throw new Error('IndexedDB connection is not initialized.');
    }
    return this.db;
  }

  private async runTransaction<T>(
    store: StoreName,
    mode: IDBTransactionMode,
    execute: (
      objectStore: IDBObjectStore,
      resolve: (value: T) => void,
      reject: (reason?: unknown) => void,
      tx: IDBTransaction
    ) => void
  ): Promise<T> {
    const attempt = async (): Promise<T> => {
      const db = await this.ensureDb();
      return new Promise<T>((resolve, reject) => {
        let tx: IDBTransaction;
        try {
          tx = db.transaction(store, mode);
        } catch (err) {
          reject(err);
          return;
        }
        tx.onerror = () => reject(tx.error ?? new Error(`Transaction error on ${store}`));
        tx.onabort = () => reject(tx.error ?? new Error(`Transaction aborted on ${store}`));
        execute(tx.objectStore(store), resolve, reject, tx);
      });
    };

    try {
      return await attempt();
    } catch (err) {
      if (err instanceof DOMException && err.name === 'InvalidStateError') {
        this.db = null;
        this.initPromise = null;
        return attempt();
      }
      throw err;
    }
  }

  async get<T>(store: StoreName, key: string): Promise<T | undefined> {
    return this.runTransaction<T | undefined>(store, 'readonly', (objectStore, resolve, reject) => {
      const req = objectStore.get(key);
      req.onsuccess = () => {
        const result = req.result as StoredEnvelope<T> | undefined;
        resolve(result ? result.payload : undefined);
      };
      req.onerror = () => reject(req.error ?? new Error(`Failed reading ${key} from ${store}`));
    });
  }

  async getAll<T>(store: StoreName): Promise<T[]> {
    return this.runTransaction<T[]>(store, 'readonly', (objectStore, resolve, reject) => {
      const req = objectStore.getAll();
      req.onsuccess = () => {
        const rows = (req.result as StoredEnvelope<T>[]) ?? [];
        resolve(rows.map((row) => row.payload));
      };
      req.onerror = () => reject(req.error ?? new Error(`Failed listing ${store}`));
    });
  }

  async put<T>(store: StoreName, key: string, value: T): Promise<void> {
    return this.runTransaction<void>(store, 'readwrite', (objectStore, resolve, reject, tx) => {
      const envelope: StoredEnvelope<T> = { id: key, payload: value };
      const req = objectStore.put(envelope);
      tx.oncomplete = () => resolve();
      req.onerror = () => reject(req.error ?? new Error(`Failed writing ${key} to ${store}`));
    });
  }

  async delete(store: StoreName, key: string): Promise<void> {
    return this.runTransaction<void>(store, 'readwrite', (objectStore, resolve, reject, tx) => {
      const req = objectStore.delete(key);
      tx.oncomplete = () => resolve();
      req.onerror = () => reject(req.error ?? new Error(`Failed deleting ${key} from ${store}`));
    });
  }

  async clear(store: StoreName): Promise<void> {
    return this.runTransaction<void>(store, 'readwrite', (objectStore, resolve, reject, tx) => {
      const req = objectStore.clear();
      tx.oncomplete = () => resolve();
      req.onerror = () => reject(req.error ?? new Error(`Failed clearing ${store}`));
    });
  }

  async count(store: StoreName): Promise<number> {
    return this.runTransaction<number>(store, 'readonly', (objectStore, resolve, reject) => {
      const req = objectStore.count();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error ?? new Error(`Failed counting ${store}`));
    });
  }
}
