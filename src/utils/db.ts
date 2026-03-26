import { FinancialState } from '../types';

const DB_NAME = 'FinancialPlannerDB';
const DB_VERSION = 1;
const STORE_NAME = 'financialState';

let db: IDBDatabase | null = null;

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME);
      }
    };
  });
};

export const saveState = async (state: FinancialState): Promise<void> => {
  if (!db) await initDB();
  return new Promise((resolve, reject) => {
    if (!db) return reject(new Error('Database not initialized'));

    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(state, 'currentState');

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

export const loadState = async (): Promise<FinancialState> => {
  if (!db) await initDB();
  return new Promise((resolve, reject) => {
    if (!db) return reject(new Error('Database not initialized'));

    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get('currentState');

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const result = request.result;
      if (result) {
        resolve(result);
      } else {
        // Return default state if no data exists
        resolve({
          capital: 0,
          sections: [],
          expenses: []
        });
      }
    };
  });
};
