/**
 * Spaced Repetition Service
 * 间隔重复服务 - 处理单词复习相关的API请求
 */

import type {
  WordProgress,
  ChildWordProgress,
  ReviewWordsResponse,
  ProgressUpdateResponse,
  Word,
  ChildWord
} from '../types/vocabulary';

const API_BASE_URL = 'http://localhost:3001/api';

/**
 * Track adult word progress
 * 跟踪成人单词学习进度
 */
export async function trackWordProgress(
  userId: string,
  wordId: number,
  bookType: string,
  correct: boolean
): Promise<WordProgress> {
  try {
    const response = await fetch(`${API_BASE_URL}/word-progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId,
        wordId,
        bookType,
        correct
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to track progress: ${response.statusText}`);
    }

    const data: ProgressUpdateResponse = await response.json();
    return data.progress as WordProgress;
  } catch (error) {
    console.error('Error tracking word progress:', error);
    throw error;
  }
}

/**
 * Get adult words due for review
 * 获取需要复习的成人单词
 */
export async function getReviewWords(
  userId: string,
  bookType?: string,
  limit: number = 20
): Promise<ReviewWordsResponse> {
  try {
    const params = new URLSearchParams();
    if (bookType) params.append('bookType', bookType);
    params.append('limit', limit.toString());

    const url = `${API_BASE_URL}/word-progress/review/${userId}?${params.toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch review words: ${response.statusText}`);
    }

    const data: ReviewWordsResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching review words:', error);
    throw error;
  }
}

/**
 * Track child word progress
 * 跟踪少儿单词学习进度
 */
export async function trackChildWordProgress(
  userId: string,
  wordId: number,
  correct: boolean
): Promise<ChildWordProgress> {
  try {
    const response = await fetch(`${API_BASE_URL}/child-word-progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId,
        wordId,
        correct
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to track progress: ${response.statusText}`);
    }

    const data: ProgressUpdateResponse = await response.json();
    return data.progress as ChildWordProgress;
  } catch (error) {
    console.error('Error tracking child word progress:', error);
    throw error;
  }
}

/**
 * Get child words due for review
 * 获取需要复习的少儿单词
 */
export async function getChildReviewWords(
  userId: string,
  grade?: number,
  limit: number = 10
): Promise<ReviewWordsResponse> {
  try {
    const params = new URLSearchParams();
    if (grade !== undefined) params.append('grade', grade.toString());
    params.append('limit', limit.toString());

    const url = `${API_BASE_URL}/child-word-progress/review/${userId}?${params.toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch review words: ${response.statusText}`);
    }

    const data: ReviewWordsResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching child review words:', error);
    throw error;
  }
}

/**
 * Get learning statistics
 * 获取学习统计
 */
export async function getStatistics(
  userId: string,
  bookType?: string
): Promise<any> {
  try {
    const params = bookType ? `?bookType=${bookType}` : '';
    const url = `${API_BASE_URL}/word-progress/statistics/${userId}${params}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch statistics: ${response.statusText}`);
    }

    const data = await response.json();
    return data.statistics;
  } catch (error) {
    console.error('Error fetching statistics:', error);
    throw error;
  }
}

/**
 * Calculate accuracy percentage
 * 计算准确率百分比
 */
export function calculateAccuracy(correctCount: number, wrongCount: number): number {
  const total = correctCount + wrongCount;
  if (total === 0) return 0;
  return Math.round((correctCount / total) * 100);
}

/**
 * Get all learned child words (including those not due for review)
 * 获取所有已学少儿单词（包括不需要复习的）
 */
export async function getAllLearnedChildWords(
  userId: string,
  grade?: number
): Promise<ReviewWordsResponse> {
  try {
    const params = new URLSearchParams();
    if (grade !== undefined) params.append('grade', grade.toString());
    params.append('includeAll', 'true'); // 包含所有单词，不仅仅是需要复习的

    const url = `${API_BASE_URL}/child-word-progress/all/${userId}?${params.toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch learned words: ${response.statusText}`);
    }

    const data: ReviewWordsResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching all learned child words:', error);
    throw error;
  }
}

/**
 * Check if word should be reviewed today
 * 检查单词今天是否需要复习
 */
export function isDueToday(nextReview: Date | string): boolean {
  const reviewDate = new Date(nextReview);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  reviewDate.setHours(0, 0, 0, 0);
  return reviewDate <= today;
}

/**
 * Format next review date
 * 格式化下次复习日期
 */
export function formatNextReview(nextReview: Date | string): string {
  const reviewDate = new Date(nextReview);
  const today = new Date();
  const diffTime = reviewDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return '需要复习';
  } else if (diffDays === 0) {
    return '今天';
  } else if (diffDays === 1) {
    return '明天';
  } else if (diffDays < 7) {
    return `${diffDays}天后`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks}周后`;
  } else {
    const months = Math.floor(diffDays / 30);
    return `${months}个月后`;
  }
}

/**
 * Get mastery level label
 * 获取掌握程度标签
 */
export function getMasteryLevel(correctCount: number, wrongCount: number): {
  level: string;
  color: string;
  label: string;
} {
  const total = correctCount + wrongCount;
  const accuracy = total > 0 ? (correctCount / total) * 100 : 0;

  if (correctCount >= 5 && wrongCount < 2) {
    return { level: 'mastered', color: '#4ECDC4', label: '已掌握' };
  } else if (accuracy >= 70 && correctCount >= 3) {
    return { level: 'good', color: '#FFE66D', label: '良好' };
  } else if (accuracy >= 50 && total >= 2) {
    return { level: 'learning', color: '#FFA07A', label: '学习中' };
  } else {
    return { level: 'weak', color: '#FF6B6B', label: '需加强' };
  }
}

export default {
  trackWordProgress,
  getReviewWords,
  trackChildWordProgress,
  getChildReviewWords,
  getStatistics,
  calculateAccuracy,
  isDueToday,
  formatNextReview,
  getMasteryLevel
};
