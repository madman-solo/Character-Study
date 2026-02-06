/**
 * IndexedDB 工具类
 * 用于管理本地数据存储，支持多用户数据隔离
 */

const DB_NAME = 'EnglishLearningDB';
const DB_VERSION = 1;

// 数据库存储对象名称
export const STORES = {
  USERS: 'users',
  LEARNING_DATA: 'learningData',
  REWARD_DATA: 'rewardData',
  SYNC_QUEUE: 'syncQueue',
};

/**
 * 初始化 IndexedDB
 */
export function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('无法打开 IndexedDB'));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // 创建用户存储
      if (!db.objectStoreNames.contains(STORES.USERS)) {
        const userStore = db.createObjectStore(STORES.USERS, { keyPath: 'id' });
        userStore.createIndex('username', 'username', { unique: true });
      }

      // 创建学习数据存储
      if (!db.objectStoreNames.contains(STORES.LEARNING_DATA)) {
        const learningStore = db.createObjectStore(STORES.LEARNING_DATA, { keyPath: 'userId' });
        learningStore.createIndex('userId', 'userId', { unique: true });
      }

      // 创建奖励数据存储
      if (!db.objectStoreNames.contains(STORES.REWARD_DATA)) {
        const rewardStore = db.createObjectStore(STORES.REWARD_DATA, { keyPath: 'userId' });
        rewardStore.createIndex('userId', 'userId', { unique: true });
      }

      // 创建同步队列存储
      if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
        const syncStore = db.createObjectStore(STORES.SYNC_QUEUE, {
          keyPath: 'id',
          autoIncrement: true
        });
        syncStore.createIndex('userId', 'userId', { unique: false });
        syncStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

/**
 * 获取数据
 */
export async function getData<T>(storeName: string, key: string): Promise<T | null> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(key);

    request.onsuccess = () => {
      resolve(request.result || null);
    };

    request.onerror = () => {
      reject(new Error(`获取数据失败: ${storeName}`));
    };
  });
}

/**
 * 保存数据
 */
export async function saveData<T>(storeName: string, data: T): Promise<void> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(data);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(new Error(`保存数据失败: ${storeName}`));
    };
  });
}

/**
 * 删除数据
 */
export async function deleteData(storeName: string, key: string): Promise<void> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(key);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(new Error(`删除数据失败: ${storeName}`));
    };
  });
}

/**
 * 获取所有数据
 */
export async function getAllData<T>(storeName: string): Promise<T[]> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result || []);
    };

    request.onerror = () => {
      reject(new Error(`获取所有数据失败: ${storeName}`));
    };
  });
}

/**
 * 清空存储
 */
export async function clearStore(storeName: string): Promise<void> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.clear();

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(new Error(`清空存储失败: ${storeName}`));
    };
  });
}

