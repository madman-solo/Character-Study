/**
 * 少儿英语学习数据管理 Hook
 * 管理学习进度、单词记忆、答题记录等核心学习数据
 */

import { useState, useEffect, useCallback } from "react";

// 单词数据接口
export interface Word {
  id: string;
  word: string;
  phonetic: string;
  translation: string;
  example?: string;
  mastered: boolean;
  reviewCount: number;
  lastReviewTime?: number;
}

// 打卡记录接口
export interface CheckInRecord {
  date: string; // YYYY-MM-DD
  studyTime: number; // 学习时长（分钟）
  isValid: boolean; // 是否有效打卡
  timestamp: number; // 打卡时间戳
}

// 学习会话数据
export interface LearningSession {
  startTime: number;
  endTime?: number;
  wordsLearned: number;
  correctAnswers: number;
  totalAnswers: number;
  interactionCount: number;
  pausedTime: number; // 暂停累计时长（毫秒）
  activeTime: number; // 实际活跃时长（毫秒）
  lastActivityTime: number; // 最后活动时间
  isActive: boolean; // 是否活跃
  heartbeats: number[]; // 心跳时间戳数组
}

// 学习数据接口
export interface LearningData {
  userId: string;
  totalStudyTime: number; // 总学习时长（分钟）
  masteredWords: Word[]; // 已掌握的单词
  weakWords: Word[]; // 薄弱单词
  currentBookProgress: { [bookName: string]: number }; // 单词本进度
  answerHistory: {
    correct: number;
    total: number;
    accuracy: number;
  };
  interactionCount: number; // 角色互动次数
  lastLoginDate: string; // 最后登录日期
  consecutiveDays: number; // 连续打卡天数
  currentSession?: LearningSession; // 当前学习会话
  dailyStudyTime: { [date: string]: number }; // 每日学习时长
  dailyMasteredWords: { [date: string]: number }; // 每日掌握单词数
  dailyInteractions: { [date: string]: number }; // 每日互动次数
  dailyAnswers: { [date: string]: number }; // 每日答题次数
  // 新增字段
  lastCheckInDate: string; // 最后打卡日期
  checkInHistory: CheckInRecord[]; // 打卡历史记录
  dailyMinStudyTime: number; // 每日最低学习时长（分钟）
  validCheckIns: number; // 有效打卡次数
  dailyAccuracy: { [date: string]: number }; // 每日准确率
  learningStreak: number; // 学习连续天数
  longestStreak: number; // 最长连续天数
}

const STORAGE_KEY_PREFIX = "child_learning_";

export const useChildLearning = (userId: string) => {
  const [learningData, setLearningData] = useState<LearningData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 初始化学习数据
  const initializeLearningData = useCallback((uid: string): LearningData => {
    const today = new Date().toISOString().split("T")[0];
    return {
      userId: uid,
      totalStudyTime: 0,
      masteredWords: [],
      weakWords: [],
      currentBookProgress: {},
      answerHistory: {
        correct: 0,
        total: 0,
        accuracy: 0,
      },
      interactionCount: 0,
      lastLoginDate: today,
      consecutiveDays: 1,
      dailyStudyTime: {},
      dailyMasteredWords: {},
      dailyInteractions: {},
      dailyAnswers: {},
      // 新增字段初始值
      lastCheckInDate: "",
      checkInHistory: [],
      dailyMinStudyTime: 5, // 默认5分钟
      validCheckIns: 0,
      dailyAccuracy: {},
      learningStreak: 0,
      longestStreak: 0,
    };
  }, []);

  // 从 localStorage 加载数据
  useEffect(() => {
    if (!userId) {
      setLearningData(null);
      setIsLoading(false);
      return;
    }

    const storageKey = `${STORAGE_KEY_PREFIX}${userId}`;
    const savedData = localStorage.getItem(storageKey);

    if (savedData) {
      try {
        const data: LearningData = JSON.parse(savedData);

        // 检查连续打卡
        const today = new Date().toISOString().split("T")[0];
        const lastLogin = new Date(data.lastLoginDate);
        const todayDate = new Date(today);
        const daysDiff = Math.floor(
          (todayDate.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24),
        );

        if (daysDiff === 1) {
          // 连续打卡
          data.consecutiveDays += 1;
        } else if (daysDiff > 1) {
          // 中断打卡
          data.consecutiveDays = 1;
        }

        data.lastLoginDate = today;
        setLearningData(data);

        // 保存更新后的数据
        localStorage.setItem(storageKey, JSON.stringify(data));
      } catch (error) {
        console.error("Failed to parse learning data:", error);
        const newData = initializeLearningData(userId);
        setLearningData(newData);
        localStorage.setItem(storageKey, JSON.stringify(newData));
      }
    } else {
      const newData = initializeLearningData(userId);
      setLearningData(newData);
      localStorage.setItem(storageKey, JSON.stringify(newData));
    }

    setIsLoading(false);
  }, [userId, initializeLearningData]);

  // 保存数据到 localStorage
  const saveData = useCallback(
    (data: LearningData) => {
      if (!userId) return;
      const storageKey = `${STORAGE_KEY_PREFIX}${userId}`;
      localStorage.setItem(storageKey, JSON.stringify(data));
      setLearningData(data);
    },
    [userId],
  );

  // 开始学习会话？
  const startLearningSession = useCallback(() => {
    if (!learningData) return;

    const session: LearningSession = {
      startTime: Date.now(),
      wordsLearned: 0,
      correctAnswers: 0,
      totalAnswers: 0,
      interactionCount: 0,
    };

    saveData({
      ...learningData,
      currentSession: session,
    });
  }, [learningData, saveData]);

  // 结束学习会话
  const endLearningSession = useCallback(() => {
    if (!learningData || !learningData.currentSession) return;

    const session = learningData.currentSession;
    const endTime = Date.now();

    const sessionDuration = Math.floor(
      (endTime - session.startTime) / 1000 / 60,
    ); // 分钟
    const today = new Date().toISOString().split("T")[0];

    const updatedData = {
      ...learningData,
      totalStudyTime: learningData.totalStudyTime + sessionDuration,
      dailyStudyTime: {
        ...learningData.dailyStudyTime,
        [today]: (learningData.dailyStudyTime[today] || 0) + sessionDuration,
      },
      currentSession: undefined,
    };

    saveData(updatedData);
    return sessionDuration;
  }, [learningData, saveData]);

  // 记录答题（当前还无答题部分）
  const recordAnswer = useCallback(
    (isCorrect: boolean) => {
      if (!learningData) return;

      const today = new Date().toISOString().split("T")[0];

      const updatedHistory = {
        correct: learningData.answerHistory.correct + (isCorrect ? 1 : 0),
        total: learningData.answerHistory.total + 1,
        accuracy: 0,
      };
      updatedHistory.accuracy =
        (updatedHistory.correct / updatedHistory.total) * 100;

      const updatedSession = learningData.currentSession
        ? {
            ...learningData.currentSession,
            correctAnswers:
              learningData.currentSession.correctAnswers + (isCorrect ? 1 : 0),
            totalAnswers: learningData.currentSession.totalAnswers + 1,
          }
        : undefined;

      saveData({
        ...learningData,
        answerHistory: updatedHistory,
        currentSession: updatedSession,
        dailyAnswers: {
          ...learningData.dailyAnswers,
          [today]: (learningData.dailyAnswers?.[today] || 0) + 1,
        },
      });
    },
    [learningData, saveData],
  );

  // 添加已掌握单词
  const addMasteredWord = useCallback(
    (word: Word) => {
      if (!learningData) return;

      const exists = learningData.masteredWords.find((w) => w.id === word.id);
      if (exists) return;

      const today = new Date().toISOString().split("T")[0];

      const updatedWords = [
        ...learningData.masteredWords,
        { ...word, mastered: true },
      ];

      // 从薄弱单词中移除
      const updatedWeakWords = learningData.weakWords.filter(
        (w) => w.id !== word.id,
      );

      const updatedSession = learningData.currentSession
        ? {
            ...learningData.currentSession,
            wordsLearned: learningData.currentSession.wordsLearned + 1,
          }
        : undefined;

      saveData({
        ...learningData,
        masteredWords: updatedWords,
        weakWords: updatedWeakWords,
        currentSession: updatedSession,
        dailyMasteredWords: {
          ...learningData.dailyMasteredWords,
          [today]: (learningData.dailyMasteredWords?.[today] || 0) + 1,
        },
      });
    },
    [learningData, saveData],
  );

  // 添加薄弱单词
  const addWeakWord = useCallback(
    (word: Word) => {
      if (!learningData) return;

      const exists = learningData.weakWords.find((w) => w.id === word.id);
      if (exists) return;

      const updatedWords = [...learningData.weakWords, word];

      saveData({
        ...learningData,
        weakWords: updatedWords,
      });
    },
    [learningData, saveData],
  );

  // 记录角色互动
  const recordInteraction = useCallback(() => {
    if (!learningData) return;

    const today = new Date().toISOString().split("T")[0];

    const updatedSession = learningData.currentSession
      ? {
          ...learningData.currentSession,
          interactionCount: learningData.currentSession.interactionCount + 1,
        }
      : undefined;

    saveData({
      ...learningData,
      interactionCount: learningData.interactionCount + 1,
      currentSession: updatedSession,
      dailyInteractions: {
        ...learningData.dailyInteractions,
        [today]: (learningData.dailyInteractions?.[today] || 0) + 1,
      },
    });
  }, [learningData, saveData]);

  // 更新单词本进度（目前少儿英语还没有集成单词本）
  const updateBookProgress = useCallback(
    (bookName: string, progress: number) => {
      if (!learningData) return;

      saveData({
        ...learningData,
        currentBookProgress: {
          ...learningData.currentBookProgress,
          [bookName]: progress,
        },
      });
    },
    [learningData, saveData],
  );

  // 重置学习数据
  const resetLearningData = useCallback(() => {
    if (!userId) return;

    const newData = initializeLearningData(userId);
    saveData(newData);
  }, [userId, initializeLearningData, saveData]);

  // 获取平均每日学习时长
  const getAverageDailyStudyTime = useCallback(() => {
    if (!learningData) return 0;

    const times = Object.values(learningData.dailyStudyTime);
    if (times.length === 0) return 0;

    const total = times.reduce((sum, time) => sum + time, 0);
    return Math.round(total / times.length);
  }, [learningData]);

  // 验证打卡有效性
  const validateCheckIn = useCallback(
    (studyTime: number): boolean => {
      if (!learningData) return false;
      return studyTime >= learningData.dailyMinStudyTime;
    },
    [learningData],
  );

  // 更新连续打卡天数
  const updateCheckInStreak = useCallback(
    (studyTime: number) => {
      if (!learningData) return;

      const today = new Date().toISOString().split("T")[0];
      const isValid = validateCheckIn(studyTime);

      // 创建打卡记录
      const checkInRecord: CheckInRecord = {
        date: today,
        studyTime,
        isValid,
        timestamp: Date.now(),
      };

      // 更新打卡历史（保留最近30天）
      const updatedHistory = [...learningData.checkInHistory, checkInRecord]
        .filter((record) => {
          const recordDate = new Date(record.date);
          const daysAgo = Math.floor(
            (Date.now() - recordDate.getTime()) / (1000 * 60 * 60 * 24),
          );
          return daysAgo <= 30;
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      // 计算学习连续天数
      let newStreak = 0;
      if (isValid) {
        const lastCheckIn = learningData.lastCheckInDate;
        if (lastCheckIn) {
          const lastDate = new Date(lastCheckIn);
          const todayDate = new Date(today);
          const daysDiff = Math.floor(
            (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24),
          );

          if (daysDiff === 1) {
            // 连续打卡
            newStreak = learningData.learningStreak + 1;
          } else if (daysDiff === 0) {
            // 同一天，保持不变
            newStreak = learningData.learningStreak;
          } else {
            // 中断，重新开始
            newStreak = 1;
          }
        } else {
          // 首次打卡
          newStreak = 1;
        }
      } else {
        // 无效打卡，重置连续天数
        newStreak = 0;
      }

      // 更新最长连续天数
      const newLongestStreak = Math.max(
        learningData.longestStreak,
        newStreak,
      );

      const updatedData = {
        ...learningData,
        lastCheckInDate: isValid ? today : learningData.lastCheckInDate,
        checkInHistory: updatedHistory,
        validCheckIns: isValid
          ? learningData.validCheckIns + 1
          : learningData.validCheckIns,
        learningStreak: newStreak,
        longestStreak: newLongestStreak,
      };

      saveData(updatedData);
    },
    [learningData, validateCheckIn, saveData],
  );

  // 获取打卡历史
  const getCheckInHistory = useCallback((): CheckInRecord[] => {
    if (!learningData) return [];
    return learningData.checkInHistory;
  }, [learningData]);

  return {
    learningData,
    isLoading,
    startLearningSession,
    endLearningSession,
    recordAnswer,
    addMasteredWord,
    addWeakWord,
    recordInteraction,
    updateBookProgress,
    resetLearningData,
    getAverageDailyStudyTime,
    validateCheckIn,
    updateCheckInStreak,
    getCheckInHistory,
  };
};
