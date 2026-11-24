export type StoreName =
  | 'progress'
  | 'quizAttempts'
  | 'downloads'
  | 'materials'
  | 'students'
  | 'activity'
  | 'preferences'
  | 'syncQueue'
  | 'packets';

export const ALL_STORES: StoreName[] = [
  'progress',
  'quizAttempts',
  'downloads',
  'materials',
  'students',
  'activity',
  'preferences',
  'syncQueue',
  'packets',
];

export interface StorageAdapter {
  readonly engineName: 'IndexedDB' | 'localStorage';
  init(): Promise<void>;
  get<T>(store: StoreName, key: string): Promise<T | undefined>;
  getAll<T>(store: StoreName): Promise<T[]>;
  put<T>(store: StoreName, key: string, value: T): Promise<void>;
  delete(store: StoreName, key: string): Promise<void>;
  clear(store: StoreName): Promise<void>;
  count(store: StoreName): Promise<number>;
}
