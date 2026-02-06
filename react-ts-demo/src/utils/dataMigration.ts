/**
 * 数据迁移工具
 * 将 localStorage 中的数据迁移到 IndexedDB
 */

import * as indexedDB from './indexedDB';
import * as learningDataService from '../services/learningDataService';
import type { LearningData, RewardData } from '../services/learningDataService';

// localStorage 中的旧数据键名
const OLD_KEYS = {
  LEARNING_DATA: 'user_learning_data',
  REWARD_DATA: 'user_reward_data',
  STUDY_TIME: 'study_time',
  MASTERED_WORDS: 'mastered_words',
  WEAK_WORDS: 'weak_words',
  DAILY_PROGRESS: 'daily_progress',
  TOTAL_POINTS: 'total_points',
  BADGES: 'badges',
};

/**
 * 检查是否需要迁移
 */
export function needsMigration(): boolean {
  // 检查 localStorage 中是否有旧数据
  for (const key of Object.values(OLD_KEYS)) {
    if (localStorage.getItem(key)) {
      return true;
    }
  }
  return false;
}

/**
 * 从 localStorage 读取旧的学习数据
 */
function readOldLearningData(userId: string): Partial<LearningData> | null {
  try {
    const data: Partial<LearningData> = {};

    // 读取学习时长
    const studyTime = localStorage.getItem(OLD_KEYS.STUDY_TIME);
    if (studyTime) {
      data.totalStudyTime = parseInt(studyTime, 10) || 0;
    }

    // 读取已掌握单词
    const masteredWords = localStorage.getItem(OLD_KEYS.MASTERED_WORDS);
    if (masteredWords) {
      try {
        data.masteredWords = JSON.parse(masteredWords);
      } catch {
        data.masteredWords = [];
      }
    }

    // 读取薄弱单词
    const weakWords = localStorage.getItem(OLD_KEYS.WEAK_WORDS);
    if (weakWords) {
      try {
        data.weakWords = JSON.parse(weakWords);
      } catch {
        data.weakWords = [];
      }
    }

    // 读取每日进度
    const dailyProgress = localStorage.getItem(OLD_KEYS.DAILY_PROGRESS);
    if (dailyProgress) {
      try {
        data.dailyStudyTime = JSON.parse(dailyProgress);
      } catch {
        data.dailyStudyTime = {};
      }
    }

    // 读取完整的学习数据（如果存在）
    const fullData = localStorage.getItem(OLD_KEYS.LEARNING_DATA);
    if (fullData) {
      try {
        const parsed = JSON.parse(fullData);
        Object.assign(data, parsed);
      } catch (error) {
        console.error('解析旧学习数据失败:', error);
      }
    }

    return Object.keys(data).length > 0 ? data : null;
  } catch (error) {
    console.error('读取旧学习数据失败:', error);
    return null;
  }
}

/**
 * 从 localStorage 读取旧的奖励数据
 */
function readOldRewardData(userId: string): Partial<RewardData> | null {
  try {
    const data: Partial<RewardData> = {};

    // 读取总积分
    const totalPoints = localStorage.getItem(OLD_KEYS.TOTAL_POINTS);
    if (totalPoints) {
      data.totalPoints = parseInt(totalPoints, 10) || 0;
    }

    // 读取勋章
    const badges = localStorage.getItem(OLD_KEYS.BADGES);
    if (badges) {
      try {
        data.badges = JSON.parse(badges);
      } catch {
        data.badges = [];
      }
    }

    // 读取完整的奖励数据（如果存在）
    const fullData = localStorage.getItem(OLD_KEYS.REWARD_DATA);
    if (fullData) {
      try {
        const parsed = JSON.parse(fullData);
        Object.assign(data, parsed);
      } catch (error) {
        console.error('解析旧奖励数据失败:', error);
      }
    }

    return Object.keys(data).length > 0 ? data : null;
  } catch (error) {
    console.error('读取旧奖励数据失败:', error);
    return null;
  }
}

/**
 * 执行数据迁移
 */
export async function migrateData(userId: string): Promise<{
  success: boolean;
  learningDataMigrated: boolean;
  rewardDataMigrated: boolean;
  errors: string[];
}> {
  const result = {
    success: true,
    learningDataMigrated: false,
    rewardDataMigrated: false,
    errors: [] as string[],
  };

  try {
    // 初始化 IndexedDB
    await indexedDB.initDB();

    // 迁移学习数据
    const oldLearningData = readOldLearningData(userId);
    if (oldLearningData) {
      try {
        const newLearningData = learningDataService.createEmptyLearningData(userId);
        Object.assign(newLearningData, oldLearningData);
        newLearningData.lastSyncAt = new Date().toISOString();

        await learningDataService.saveLocalLearningData(newLearningData);
        result.learningDataMigrated = true;
        console.log('学习数据迁移成功');
      } catch (error) {
        result.errors.push(`学习数据迁移失败: ${error}`);
        result.success = false;
      }
    }

    // 迁移奖励数据
    const oldRewardData = readOldRewardData(userId);
    if (oldRewardData) {
      try {
        const newRewardData = learningDataService.createEmptyRewardData(userId);
        Object.assign(newRewardData, oldRewardData);
        newRewardData.lastSyncAt = new Date().toISOString();

        await learningDataService.saveLocalRewardData(newRewardData);
        result.rewardDataMigrated = true;
        console.log('奖励数据迁移成功');
      } catch (error) {
        result.errors.push(`奖励数据迁移失败: ${error}`);
        result.success = false;
      }
    }

    return result;
  } catch (error) {
    result.success = false;
    result.errors.push(`数据迁移失败: ${error}`);
    return result;
  }
}