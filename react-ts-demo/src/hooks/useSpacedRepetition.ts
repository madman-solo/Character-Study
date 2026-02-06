/**
 * useSpacedRepetition Hook
 * 间隔重复学习Hook - 管理单词复习状态和逻辑
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * Retry helper function for network requests
 * 网络请求重试辅助函数
 */
async function retryAsync<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error | unknown;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      console.warn(`Attempt ${i + 1} failed, retrying...`, error);

      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }

  throw lastError;
}
import type {
  ChildWord,
  Word,
  ReviewWordsResponse,
  WordProgress,
  ChildWordProgress,
  ReviewSession
} from '../types/vocabulary';
import {
  getReviewWords,
  getChildReviewWords,
  trackWordProgress,
  trackChildWordProgress,
  calculateAccuracy
} from '../services/spacedRepetitionService';

interface UseSpacedRepetitionOptions {
  userId: string;
  isChild?: boolean;
  bookType?: string;
  grade?: number;
  limit?: number;
}

interface UseSpacedRepetitionReturn {
  // State
  words: (ChildWord | Word)[];
  currentWordIndex: number;
  currentWord: (ChildWord | Word) | null;
  isLoading: boolean;
  error: string | null;
  session: ReviewSession | null;
  statistics: ReviewWordsResponse['statistics'] | null;

  // Actions
  loadReviewWords: () => Promise<void>;
  submitAnswer: (correct: boolean) => Promise<void>;
  nextWord: () => void;
  previousWord: () => void;
  startSession: () => void;
  endSession: () => ReviewSession | null;
  resetSession: () => void;
}

export function useSpacedRepetition(
  options: UseSpacedRepetitionOptions
): UseSpacedRepetitionReturn {
  const { userId, isChild = false, bookType, grade, limit = 20 } = options;

  // State
  const [words, setWords] = useState<(ChildWord | Word)[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<ReviewSession | null>(null);
  const [statistics, setStatistics] = useState<ReviewWordsResponse['statistics'] | null>(null);

  // Current word
  const currentWord = words.length > 0 ? words[currentWordIndex] : null;

  /**
   * Load review words from API
   * 从API加载复习单词
   */
  const loadReviewWords = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Use retry mechanism for network requests
      const response = await retryAsync(async () => {
        if (isChild) {
          return await getChildReviewWords(userId, grade, limit);
        } else {
          return await getReviewWords(userId, bookType, limit);
        }
      });

      const reviewWords = response.words.map(item => item.word);
      setWords(reviewWords);
      setStatistics(response.statistics);
      setCurrentWordIndex(0);

      if (reviewWords.length === 0) {
        setError('暂无需要复习的单词');
      }
    } catch (err) {
      console.error('Error loading review words:', err);
      setError('加载复习单词失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  }, [userId, isChild, bookType, grade, limit]);

  /**
   * Submit answer and track progress
   * 提交答案并跟踪进度
   */
  const submitAnswer = useCallback(async (correct: boolean) => {
    if (!currentWord || !session) return;

    try {
      // Track progress in backend with retry mechanism
      await retryAsync(async () => {
        if (isChild) {
          return await trackChildWordProgress(userId, currentWord.id, correct);
        } else {
          if (!bookType) {
            throw new Error('Book type is required for adult words');
          }
          return await trackWordProgress(userId, currentWord.id, bookType, correct);
        }
      });

      // Update session statistics
      setSession(prev => {
        if (!prev) return null;
        return {
          ...prev,
          wordsReviewed: prev.wordsReviewed + 1,
          correctAnswers: correct ? prev.correctAnswers + 1 : prev.correctAnswers,
          wrongAnswers: correct ? prev.wrongAnswers : prev.wrongAnswers + 1,
          accuracy: calculateAccuracy(
            correct ? prev.correctAnswers + 1 : prev.correctAnswers,
            correct ? prev.wrongAnswers : prev.wrongAnswers + 1
          )
        };
      });

      // Auto-advance to next word after a short delay (2 seconds for better feedback)
      // 答完最后一个单词后也要增加索引，以触发完成判断
      setTimeout(() => {
        setCurrentWordIndex(prev => prev + 1);
      }, 2000);
    } catch (err) {
      console.error('Error submitting answer:', err);
      setError('提交答案失败，请稍后重试');
    }
  }, [currentWord, session, userId, isChild, bookType]);

  /**
   * Move to next word
   * 移动到下一个单词
   */
  const nextWord = useCallback(() => {
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
    }
  }, [currentWordIndex, words.length]);

  /**
   * Move to previous word
   * 移动到上一个单词
   */
  const previousWord = useCallback(() => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex(prev => prev - 1);
    }
  }, [currentWordIndex]);

  /**
   * Start review session
   * 开始复习会话
   */
  const startSession = useCallback(() => {
    setSession({
      userId,
      startTime: new Date(),
      wordsReviewed: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      accuracy: 0
    });
  }, [userId]);

  /**
   * End review session
   * 结束复习会话
   */
  const endSession = useCallback((): ReviewSession | null => {
    if (!session) return null;

    const endedSession: ReviewSession = {
      ...session,
      endTime: new Date()
    };

    setSession(null);
    return endedSession;
  }, [session]);

  /**
   * Reset session and words
   * 重置会话和单词
   */
  const resetSession = useCallback(() => {
    setSession(null);
    setWords([]);
    setCurrentWordIndex(0);
    setError(null);
    setStatistics(null);
  }, []);

  // Auto-load words on mount
  useEffect(() => {
    if (userId) {
      loadReviewWords();
    }
  }, [userId, loadReviewWords]);

  return {
    // State
    words,
    currentWordIndex,
    currentWord,
    isLoading,
    error,
    session,
    statistics,

    // Actions
    loadReviewWords,
    submitAnswer,
    nextWord,
    previousWord,
    startSession,
    endSession,
    resetSession
  };
}

export default useSpacedRepetition;
