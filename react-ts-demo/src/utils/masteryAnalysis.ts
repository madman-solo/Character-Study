/**
 * Mastery Analysis Utilities
 * 单词掌握度分析工具
 *
 * 基于多维度评估单词掌握程度：
 * - 正确率（50%权重）
 * - 时间衰减（30%权重）
 * - 复习次数（20%权重）
 */

import type { WordProgress } from '../types/vocabulary';
export type { WordProgress };

export type MasteryLevel = 'mastered' | 'proficient' | 'learning' | 'needsWork' | 'new';

export interface MasteryDistribution {
  mastered: WordProgress[];
  proficient: WordProgress[];
  learning: WordProgress[];
  needsWork: WordProgress[];
  new: WordProgress[];
}

/**
 * Calculate mastery score for a word
 * 计算单词的掌握度分数
 *
 * @param progress - Word progress data
 * @returns Mastery score (0-100)
 */
export function calculateMasteryScore(progress: WordProgress): number {
  const { correctCount, wrongCount, lastStudied } = progress;

  // 1. 基础分数（正确率）：权重 50%
  const total = correctCount + wrongCount;
  const accuracy = total > 0 ? (correctCount / total) * 100 : 0;
  const accuracyScore = accuracy * 0.5;

  // 2. 时间衰减因子：权重 30%
  const lastStudiedDate = typeof lastStudied === 'string'
    ? new Date(lastStudied)
    : lastStudied;
  const daysSinceReview = Math.floor(
    (Date.now() - lastStudiedDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  // 30天后衰减到0
  const timeFactor = Math.max(0, 1 - daysSinceReview / 30);
  const timeScore = timeFactor * 100 * 0.3;

  // 3. 复习次数因子：权重 20%
  // 10次复习达到满分
  const reviewFactor = Math.min(1, total / 10);
  const reviewScore = reviewFactor * 100 * 0.2;

  // 综合得分
  const finalScore = accuracyScore + timeScore + reviewScore;

  return Math.round(Math.max(0, Math.min(100, finalScore)));
}

/**
 * Get mastery level based on score
 * 根据分数获取掌握度级别
 *
 * @param score - Mastery score (0-100)
 * @returns Mastery level with label and color
 */
export function getMasteryLevel(score: number): MasteryLevel {
  if (score >= 90) return 'mastered';
  if (score >= 70) return 'proficient';
  if (score >= 50) return 'learning';
  if (score >= 30) return 'needsWork';
  return 'new';
}

/**
 * Analyze mastery distribution for a list of words
 * 分析单词列表的掌握度分布
 *
 * @param progressList - List of word progress data
 * @returns Distribution of mastery levels
 */
export function analyzeMasteryDistribution(
  progressList: WordProgress[]
): MasteryDistribution {
  const distribution: MasteryDistribution = {
    mastered: [],
    proficient: [],
    learning: [],
    needsWork: [],
    new: [],
  };

  progressList.forEach(progress => {
    const score = calculateMasteryScore(progress);
    const level = getMasteryLevel(score);
    distribution[level].push(progress);
  });

  return distribution;
}

/**
 * Get mastery percentage
 * 获取掌握度百分比
 *
 * @param distribution - Mastery distribution
 * @returns Percentage of mastered and proficient words
 */
export function getMasteryPercentage(distribution: MasteryDistribution): Record<MasteryLevel, number> {
  const total = Object.values(distribution).reduce((sum, arr) => sum + arr.length, 0);
  if (total === 0) {
    return { mastered: 0, proficient: 0, learning: 0, needsWork: 0, new: 0 };
  }
  return {
    mastered: Math.round((distribution.mastered.length / total) * 100),
    proficient: Math.round((distribution.proficient.length / total) * 100),
    learning: Math.round((distribution.learning.length / total) * 100),
    needsWork: Math.round((distribution.needsWork.length / total) * 100),
    new: Math.round((distribution.new.length / total) * 100),
  };
}

/**
 * Identify weak words that need more practice
 * 识别需要加强练习的薄弱单词
 *
 * @param progressList - List of word progress data
 * @param threshold - Score threshold (default: 50)
 * @returns List of weak word progress
 */
export function identifyWeakWords(
  progressList: WordProgress[],
  threshold: number = 50
): WordProgress[] {
  return progressList
    .filter(progress => {
      const score = calculateMasteryScore(progress);
      return score < threshold;
    })
    .sort((a, b) => {
      const scoreA = calculateMasteryScore(a);
      const scoreB = calculateMasteryScore(b);
      return scoreA - scoreB; // Sort by score ascending (weakest first)
    });
}

/**
 * Calculate average mastery score
 * 计算平均掌握度分数
 *
 * @param progressList - List of word progress data
 * @returns Average mastery score
 */
export function calculateAverageMasteryScore(
  progressList: WordProgress[]
): number {
  if (progressList.length === 0) return 0;

  const totalScore = progressList.reduce((sum, progress) => {
    return sum + calculateMasteryScore(progress);
  }, 0);

  return Math.round(totalScore / progressList.length);
}
