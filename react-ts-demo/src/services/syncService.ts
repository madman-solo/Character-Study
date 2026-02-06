/**
 * 数据同步服务
 * 处理本地数据与服务器数据的同步
 */

import * as indexedDB from '../utils/indexedDB';
import * as learningDataService from './learningDataService';
import type { LearningData, RewardData } from './learningDataService';

// 同步队列项接口
interface SyncQueueItem {
  id?: number;
  userId: string;
  dataType: 'learning' | 'reward';
  action: 'create' | 'update';
  data: any;
  timestamp: string;
  synced: boolean;
}

/**
 * 添加到同步队列
 */
export async function addToSyncQueue(
  userId: string,
  dataType: 'learning' | 'reward',
  action: 'create' | 'update',
  data: any
): Promise<void> {
  try {
    const queueItem: SyncQueueItem = {
      userId,
      dataType,
      action,
      data,
      timestamp: new Date().toISOString(),
      synced: false,
    };

    await indexedDB.saveData(indexedDB.STORES.SYNC_QUEUE, queueItem);
  } catch (error) {
    console.error('添加到同步队列失败:', error);
    throw error;
  }
}

/**
 * 获取未同步的队列项
 */
export async function getUnsyncedItems(): Promise<SyncQueueItem[]> {
  try {
    const allItems = await indexedDB.getAllData<SyncQueueItem>(indexedDB.STORES.SYNC_QUEUE);
    return allItems.filter(item => !item.synced);
  } catch (error) {
    console.error('获取未同步项失败:', error);
    return [];
  }
}

/**
 * 标记队列项为已同步
 */
export async function markAsSynced(itemId: number): Promise<void> {
  try {
    const item = await indexedDB.getData<SyncQueueItem>(indexedDB.STORES.SYNC_QUEUE, itemId.toString());
    if (item) {
      item.synced = true;
      await indexedDB.saveData(indexedDB.STORES.SYNC_QUEUE, item);
    }
  } catch (error) {
    console.error('标记同步状态失败:', error);
  }
}

/**
 * 同步学习数据（双向同步）
 */
export async function syncLearningData(userId: string, token: string): Promise<void> {
  try {
    // 1. 获取本地数据
    let localData = await learningDataService.getLocalLearningData(userId);

    // 2. 获取服务器数据
    const serverData = await learningDataService.fetchLearningDataFromServer(userId, token);

    // 3. 如果本地没有数据
    if (!localData) {
      if (serverData) {
        // 服务器有数据，下载到本地
        await learningDataService.saveLocalLearningData(serverData);
        console.log('从服务器下载学习数据到本地');
      } else {
        // 都没有数据，创建新数据
        localData = learningDataService.createEmptyLearningData(userId);
        await learningDataService.saveLocalLearningData(localData);
        await learningDataService.uploadLearningDataToServer(localData, token);
        console.log('创建新的学习数据');
      }
      return;
    }

    // 4. 如果服务器没有数据，上传本地数据
    if (!serverData) {
      await learningDataService.uploadLearningDataToServer(localData, token);
      console.log('上传本地学习数据到服务器');
      return;
    }

    // 5. 两边都有数据，比较时间戳，使用较新的数据
    const localTime = new Date(localData.lastSyncAt).getTime();
    const serverTime = new Date(serverData.lastSyncAt).getTime();

    if (serverTime > localTime) {
      // 服务器数据更新，下载到本地
      await learningDataService.saveLocalLearningData(serverData);
      console.log('服务器数据较新，更新本地数据');
    } else if (localTime > serverTime) {
      // 本地数据更新，上传到服务器
      await learningDataService.uploadLearningDataToServer(localData, token);
      console.log('本地数据较新，上传到服务器');
    } else {
      console.log('学习数据已同步');
    }
  } catch (error) {
    console.error('同步学习数据失败:', error);
    throw error;
  }
}

/**
 * 同步奖励数据（双向同步）
 */
export async function syncRewardData(userId: string, token: string): Promise<void> {
  try {
    // 1. 获取本地数据
    let localData = await learningDataService.getLocalRewardData(userId);

    // 2. 获取服务器数据
    const serverData = await learningDataService.fetchRewardDataFromServer(userId, token);

    // 3. 如果本地没有数据
    if (!localData) {
      if (serverData) {
        await learningDataService.saveLocalRewardData(serverData);
        console.log('从服务器下载奖励数据到本地');
      } else {
        localData = learningDataService.createEmptyRewardData(userId);
        await learningDataService.saveLocalRewardData(localData);
        await learningDataService.uploadRewardDataToServer(localData, token);
        console.log('创建新的奖励数据');
      }
      return;
    }

    // 4. 如果服务器没有数据，上传本地数据
    if (!serverData) {
      await learningDataService.uploadRewardDataToServer(localData, token);
      console.log('上传本地奖励数据到服务器');
      return;
    }

    // 5. 两边都有数据，比较时间戳
    const localTime = new Date(localData.lastSyncAt).getTime();
    const serverTime = new Date(serverData.lastSyncAt).getTime();

    if (serverTime > localTime) {
      await learningDataService.saveLocalRewardData(serverData);
      console.log('服务器数据较新，更新本地奖励数据');
    } else if (localTime > serverTime) {
      await learningDataService.uploadRewardDataToServer(localData, token);
      console.log('本地数据较新，上传奖励数据到服务器');
    } else {
      console.log('奖励数据已同步');
    }
  } catch (error) {
    console.error('同步奖励数据失败:', error);
    throw error;
  }
}
