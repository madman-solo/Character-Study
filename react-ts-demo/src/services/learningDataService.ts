/**
 * 学习数据服务
 * 处理用户学习数据的本地存储和服务器同步
 */

import * as indexedDB from '../utils/indexedDB';

const API_BASE_URL = 'http://localhost:3001/api';

// 学习数据接口
export interface LearningData {
  userId: string;
  totalStudyTime: number;
  consecutiveDays: number;
  interactionCount: number;
  dailyStudyTime: Record<string, number>; // { "2026-01-23": 120 }
  currentBookProgress: Record<string, number>; // { "book1": 50 }
  masteredWords: string[];
  weakWords: string[];
  answerHistory: Record<string, any>;
  lastSyncAt: string;
}

// 奖励数据接口
export interface RewardData {
  userId: string;
  totalPoints: number;
  badges: string[];
  recentPoints: Array<{
    points: number;
    reason: string;
    timestamp: string;
  }>;
  lastSyncAt: string;
}

/**
 * 获取本地学习数据
 */
export async function getLocalLearningData(userId: string): Promise<LearningData | null> {
  try {
    return await indexedDB.getData<LearningData>(indexedDB.STORES.LEARNING_DATA, userId);
  } catch (error) {
    console.error('获取本地学习数据失败:', error);
    return null;
  }
}

/**
 * 保存本地学习数据
 */
export async function saveLocalLearningData(data: LearningData): Promise<void> {
  try {
    await indexedDB.saveData(indexedDB.STORES.LEARNING_DATA, data);
  } catch (error) {
    console.error('保存本地学习数据失败:', error);
    throw error;
  }
}

/**
 * 获取本地奖励数据
 */
export async function getLocalRewardData(userId: string): Promise<RewardData | null> {
  try {
    return await indexedDB.getData<RewardData>(indexedDB.STORES.REWARD_DATA, userId);
  } catch (error) {
    console.error('获取本地奖励数据失败:', error);
    return null;
  }
}

/**
 * 保存本地奖励数据
 */
export async function saveLocalRewardData(data: RewardData): Promise<void> {
  try {
    await indexedDB.saveData(indexedDB.STORES.REWARD_DATA, data);
  } catch (error) {
    console.error('保存本地奖励数据失败:', error);
    throw error;
  }
}

/**
 * 从服务器获取学习数据
 */
export async function fetchLearningDataFromServer(userId: string, token: string): Promise<LearningData | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/learning-data/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null; // 数据不存在
      }
      throw new Error('获取服务器学习数据失败');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('从服务器获取学习数据失败:', error);
    throw error;
  }
}

/**
 * 上传学习数据到服务器
 */
export async function uploadLearningDataToServer(data: LearningData, token: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/learning-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('上传学习数据失败');
    }
  } catch (error) {
    console.error('上传学习数据到服务器失败:', error);
    throw error;
  }
}

/**
 * 从服务器获取奖励数据
 */
export async function fetchRewardDataFromServer(userId: string, token: string): Promise<RewardData | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/reward-data/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('获取服务器奖励数据失败');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('从服务器获取奖励数据失败:', error);
    throw error;
  }
}

/**
 * 上传奖励数据到服务器
 */
export async function uploadRewardDataToServer(data: RewardData, token: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/reward-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('上传奖励数据失败');
    }
  } catch (error) {
    console.error('上传奖励数据到服务器失败:', error);
    throw error;
  }
}

/**
 * 初始化用户学习数据
 */
export function createEmptyLearningData(userId: string): LearningData {
  return {
    userId,
    totalStudyTime: 0,
    consecutiveDays: 0,
    interactionCount: 0,
    dailyStudyTime: {},
    currentBookProgress: {},
    masteredWords: [],
    weakWords: [],
    answerHistory: {},
    lastSyncAt: new Date().toISOString(),
  };
}

/**
 * 初始化用户奖励数据
 */
export function createEmptyRewardData(userId: string): RewardData {
  return {
    userId,
    totalPoints: 0,
    badges: [],
    recentPoints: [],
    lastSyncAt: new Date().toISOString(),
  };
}
