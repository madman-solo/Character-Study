/**
 * 少儿英语奖励系统 Hook
 * 管理积分、勋章、成就等奖励机制
 */

import { useState, useEffect, useCallback } from "react";

// 勋章类型
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
  progress?: number; // 解锁进度 0-100
  requirement: string; // 解锁要求描述
}

// 积分记录
export interface PointRecord {
  id: string;
  amount: number;
  reason: string;
  timestamp: number;
}

// 奖励数据接口
export interface RewardData {
  userId: string;
  totalPoints: number; // 总积分（累计）
  badges: Badge[]; // 勋章列表
  pointHistory: PointRecord[]; // 积分历史
  lastDailyLoginReward: string; // 最后一次每日登录奖励日期
  completedDailyTasks: { [date: string]: string[] }; // 每日已完成的任务ID
}

const STORAGE_KEY_PREFIX = "child_rewards_";

// 积分规则
export const POINT_RULES = {
  DAILY_LOGIN: 10, // 每日首次登录
  CORRECT_ANSWER: 5, // 答对一题
  MASTER_WORD: 10, // 掌握一个单词
  INTERACTION: 3, // 完成一次角色互动
  STUDY_10MIN: 20, // 学习满10分钟
};

// 勋章定义
const BADGE_DEFINITIONS: Omit<Badge, "unlocked" | "unlockedAt" | "progress">[] =
  [
    {
      id: "consecutive_7days",
      name: "坚持小勇士",
      description: "连续打卡学习7天",
      icon: "🏆",
      requirement: "连续学习7天",
    },
    {
      id: "master_50words",
      name: "单词小能手",
      description: "掌握50个单词",
      icon: "📚",
      requirement: "掌握50个单词",
    },
    {
      id: "complete_book",
      name: "单词通关之星",
      description: "完成整本单词本",
      icon: "⭐",
      requirement: "完成一本单词本",
    },
    {
      id: "interaction_20times",
      name: "互动小达人",
      description: "和角色互动20次",
      icon: "💬",
      requirement: "互动20次",
    },
    {
      id: "accuracy_90percent",
      name: "答题小天才",
      description: "答题正确率达到90%",
      icon: "🎯",
      requirement: "正确率≥90%",
    },
    {
      id: "study_100hours",
      name: "学习小标兵",
      description: "累计学习100小时",
      icon: "⏰",
      requirement: "学习100小时",
    },
  ];

export const useChildRewards = (userId: string) => {
  const [rewardData, setRewardData] = useState<RewardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recentPoints, setRecentPoints] = useState<number | null>(null); // 用于显示积分动画

  // 初始化奖励数据
  const initializeRewardData = useCallback((uid: string): RewardData => {
    return {
      userId: uid,
      totalPoints: 0,
      badges: BADGE_DEFINITIONS.map((badge) => ({
        ...badge,
        unlocked: false,
        progress: 0,
      })),
      pointHistory: [],
      lastDailyLoginReward: "",
      completedDailyTasks: {},
    };
  }, []);

  // 从 localStorage 加载数据
  useEffect(() => {
    if (!userId) {
      setRewardData(null);
      setIsLoading(false);
      return;
    }

    const storageKey = `${STORAGE_KEY_PREFIX}${userId}`;
    const savedData = localStorage.getItem(storageKey);

    if (savedData) {
      try {
        const data: RewardData = JSON.parse(savedData);
        // 向后兼容：确保新字段存在
        if (!data.completedDailyTasks) {
          data.completedDailyTasks = {};
        }
        setRewardData(data);
      } catch (error) {
        console.error("Failed to parse reward data:", error);
        const newData = initializeRewardData(userId);
        setRewardData(newData);
        localStorage.setItem(storageKey, JSON.stringify(newData));
      }
    } else {
      const newData = initializeRewardData(userId);
      setRewardData(newData);
      localStorage.setItem(storageKey, JSON.stringify(newData));
    }

    setIsLoading(false);
  }, [userId, initializeRewardData]);

  // 保存数据到 localStorage（使用函数式更新）
  const saveData = useCallback(
    (dataOrUpdater: RewardData | ((prev: RewardData) => RewardData)) => {
      if (!userId) {
        console.log("❌ saveData: userId 为空");
        return;
      }

      setRewardData((prevData) => {
        if (!prevData) return prevData;

        const newData =
          typeof dataOrUpdater === "function"
            ? dataOrUpdater(prevData)
            : dataOrUpdater;

        const storageKey = `${STORAGE_KEY_PREFIX}${userId}`;
        console.log("💾 保存数据到 localStorage:", storageKey);
        console.log("💾 保存的总积分:", newData.totalPoints);
        localStorage.setItem(storageKey, JSON.stringify(newData));
        console.log("✅ 数据已保存到 localStorage 和 state");

        return newData;
      });
    },
    [userId],
  );

  // 添加积分（使用函数式更新）
  const addPoints = useCallback(
    (amount: number, reason: string) => {
      console.log(`💰 添加积分: +${amount} (${reason})`);

      const record: PointRecord = {
        id: Date.now().toString(),
        amount,
        reason,
        timestamp: Date.now(),
      };

      saveData((prevData) => {
        console.log("💰 当前总积分:", prevData.totalPoints);

        const updatedData = {
          ...prevData,
          totalPoints: prevData.totalPoints + amount,
          pointHistory: [record, ...prevData.pointHistory].slice(0, 100),
        };

        console.log("💰 新的总积分:", updatedData.totalPoints);
        return updatedData;
      });

      // 显示积分动画
      setRecentPoints(amount);
      setTimeout(() => setRecentPoints(null), 2000);
    },
    [saveData],
  );

  // 每日登录奖励（使用函数式更新）
  const claimDailyLoginReward = useCallback(() => {
    if (!rewardData) {
      console.log("❌ claimDailyLoginReward: rewardData 为空");
      return false;
    }

    const today = new Date().toISOString().split("T")[0];
    console.log("📅 今天日期:", today);
    console.log("📅 上次登录奖励日期:", rewardData.lastDailyLoginReward);
    console.log("💰 当前总积分:", rewardData.totalPoints);

    if (rewardData.lastDailyLoginReward === today) {
      console.log("⚠️ 今天已经领取过登录奖励");
      return false;
    }

    // 创建积分记录
    const record: PointRecord = {
      id: Date.now().toString(),
      amount: POINT_RULES.DAILY_LOGIN,
      reason: "每日登录奖励",
      timestamp: Date.now(),
    };

    // 使用函数式更新
    saveData((prevData) => {
      const updatedData = {
        ...prevData,
        totalPoints: prevData.totalPoints + POINT_RULES.DAILY_LOGIN,
        pointHistory: [record, ...prevData.pointHistory].slice(0, 100),
        lastDailyLoginReward: today,
      };

      console.log("✅ 领取每日登录奖励成功！");
      console.log("💰 新的总积分:", updatedData.totalPoints);
      console.log("📝 积分记录:", record);

      return updatedData;
    });

    // 显示积分动画
    setRecentPoints(POINT_RULES.DAILY_LOGIN);
    setTimeout(() => setRecentPoints(null), 2000);

    return true;
  }, [rewardData, saveData]);

  // 解锁勋章（使用函数式更新）
  const unlockBadge = useCallback(
    (badgeId: string) => {
      saveData((prevData) => {
        const updatedBadges = prevData.badges.map((badge) => {
          if (badge.id === badgeId && !badge.unlocked) {
            return {
              ...badge,
              unlocked: true,
              unlockedAt: Date.now(),
              progress: 100,
            };
          }
          return badge;
        });

        return {
          ...prevData,
          badges: updatedBadges,
        };
      });
    },
    [saveData],
  );

  // 更新勋章进度（使用函数式更新）
  const updateBadgeProgress = useCallback(
    (badgeId: string, progress: number) => {
      saveData((prevData) => {
        const updatedBadges = prevData.badges.map((badge) => {
          if (badge.id === badgeId) {
            return {
              ...badge,
              progress: Math.min(100, progress),
            };
          }
          return badge;
        });

        return {
          ...prevData,
          badges: updatedBadges,
        };
      });
    },
    [saveData],
  );

  // 检查并解锁勋章（根据学习数据）
  const checkAndUnlockBadges = useCallback(
    (learningData: any) => {
      if (!rewardData || !learningData) return;

      const updates: {
        badgeId: string;
        progress: number;
        shouldUnlock: boolean;
      }[] = [];

      // 连续打卡7天
      const consecutiveDaysProgress = Math.min(
        100,
        (learningData.consecutiveDays / 7) * 100,
      );
      updates.push({
        badgeId: "consecutive_7days",
        progress: consecutiveDaysProgress,
        shouldUnlock: learningData.consecutiveDays >= 7,
      });

      // 掌握50个单词
      const masteredWordsCount = learningData.masteredWords?.length || 0;
      const masteredWordsProgress = Math.min(
        100,
        (masteredWordsCount / 50) * 100,
      );
      updates.push({
        badgeId: "master_50words",
        progress: masteredWordsProgress,
        shouldUnlock: masteredWordsCount >= 50,
      });

      // 完成整本单词本
      const bookProgress = Object.values(
        learningData.currentBookProgress || {},
      );
      const hasCompletedBook = bookProgress.some(
        (progress: any) => progress >= 100,
      );
      updates.push({
        badgeId: "complete_book",
        progress: Math.max(...bookProgress.map((p: any) => p || 0), 0),
        shouldUnlock: hasCompletedBook,
      });

      // 互动20次
      const interactionProgress = Math.min(
        100,
        (learningData.interactionCount / 20) * 100,
      );
      updates.push({
        badgeId: "interaction_20times",
        progress: interactionProgress,
        shouldUnlock: learningData.interactionCount >= 20,
      });

      // 答题正确率90%
      const accuracy = learningData.answerHistory?.accuracy || 0;
      const accuracyProgress = Math.min(100, (accuracy / 90) * 100);
      updates.push({
        badgeId: "accuracy_90percent",
        progress: accuracyProgress,
        shouldUnlock: accuracy >= 90 && learningData.answerHistory?.total >= 20, // 至少答题20次
      });

      // 学习100小时
      const studyHours = learningData.totalStudyTime / 60;
      const studyHoursProgress = Math.min(100, (studyHours / 100) * 100);
      updates.push({
        badgeId: "study_100hours",
        progress: studyHoursProgress,
        shouldUnlock: studyHours >= 100,
      });

      // 应用更新
      updates.forEach(({ badgeId, progress, shouldUnlock }) => {
        updateBadgeProgress(badgeId, progress);
        if (shouldUnlock) {
          const badge = rewardData.badges.find((b) => b.id === badgeId);
          if (badge && !badge.unlocked) {
            unlockBadge(badgeId);
          }
        }
      });
    },
    [rewardData, updateBadgeProgress, unlockBadge],
  );

  // 获取已解锁勋章数量
  const getUnlockedBadgesCount = useCallback(() => {
    if (!rewardData) return 0;
    return rewardData.badges.filter((badge) => badge.unlocked).length;
  }, [rewardData]);

  // 完成每日任务并奖励积分
  const completeTask = useCallback(
    (taskId: string, points: number, taskName: string) => {
      if (!rewardData) {
        console.log("❌ completeTask: rewardData 为空");
        return false;
      }

      const today = new Date().toISOString().split("T")[0];
      const todayTasks = rewardData.completedDailyTasks[today] || [];

      // 检查今天是否已经完成过这个任务
      if (todayTasks.includes(taskId)) {
        console.log(`⚠️ 任务 ${taskId} 今天已经完成过了`);
        return false;
      }

      console.log(`✅ 完成任务: ${taskName} (+${points} 积分)`);

      // 创建积分记录
      const record: PointRecord = {
        id: Date.now().toString(),
        amount: points,
        reason: `完成任务: ${taskName}`,
        timestamp: Date.now(),
      };

      // 使用函数式更新
      saveData((prevData) => {
        const updatedTasks = [...(prevData.completedDailyTasks[today] || []), taskId];

        return {
          ...prevData,
          totalPoints: prevData.totalPoints + points,
          pointHistory: [record, ...prevData.pointHistory].slice(0, 100),
          completedDailyTasks: {
            ...prevData.completedDailyTasks,
            [today]: updatedTasks,
          },
        };
      });

      // 显示积分动画
      setRecentPoints(points);
      setTimeout(() => setRecentPoints(null), 2000);

      return true;
    },
    [rewardData, saveData]
  );

  // 重置奖励数据
  const resetRewardData = useCallback(() => {
    if (!userId) return;

    const newData = initializeRewardData(userId);
    saveData(newData);
  }, [userId, initializeRewardData, saveData]);

  return {
    rewardData,
    isLoading,
    recentPoints,
    addPoints,
    claimDailyLoginReward,
    completeTask,
    unlockBadge,
    updateBadgeProgress,
    checkAndUnlockBadges,
    getUnlockedBadgesCount,
    resetRewardData,
  };
};
