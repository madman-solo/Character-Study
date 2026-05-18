import { describe, it, expect } from 'vitest';
import {
  calculateMasteryScore,
  getMasteryLevel,
  analyzeMasteryDistribution,
  getMasteryPercentage,
  identifyWeakWords,
  calculateAverageMasteryScore,
} from '../masteryAnalysis';
import type { WordProgress } from '../masteryAnalysis';

// 辅助函数：创建测试用的 WordProgress
function makeProgress(
  correctCount: number,
  wrongCount: number,
  daysAgo: number = 0
): WordProgress {
  const lastStudied = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
  return {
    id: 1,
    userId: 'user1',
    wordId: 1,
    bookType: 'cet4',
    correctCount,
    wrongCount,
    lastStudied,
    nextReview: new Date(),
    interval: 1,
    easeFactor: 2.5,
    repetitions: correctCount + wrongCount,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

describe('calculateMasteryScore', () => {
  it('全部答对且刚复习过，分数应接近满分', () => {
    const progress = makeProgress(10, 0, 0);
    const score = calculateMasteryScore(progress);
    // 正确率50分 + 时间30分 + 复习次数20分 = 100
    expect(score).toBe(100);
  });

  it('从未答题（0次），时间分仍存在，分数应为30', () => {
    const progress = makeProgress(0, 0, 0);
    const score = calculateMasteryScore(progress);
    // 正确率0分 + 时间30分（刚复习）+ 复习次数0分 = 30
    expect(score).toBe(30);
  });

  it('30天前复习过，时间衰减应为0', () => {
    const progress = makeProgress(10, 0, 30);
    const score = calculateMasteryScore(progress);
    // 正确率50分 + 时间0分 + 复习次数20分 = 70
    expect(score).toBe(70);
  });

  it('全部答错，正确率分数应为0', () => {
    const progress = makeProgress(0, 10, 0);
    const score = calculateMasteryScore(progress);
    // 正确率0分 + 时间30分 + 复习次数20分 = 50
    expect(score).toBe(50);
  });

  it('分数应在 0-100 范围内', () => {
    const progress = makeProgress(100, 0, 0);
    const score = calculateMasteryScore(progress);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('lastStudied 支持字符串格式', () => {
    const progress = makeProgress(10, 0, 0);
    const progressWithString = {
      ...progress,
      lastStudied: new Date().toISOString() as unknown as Date,
    };
    expect(() => calculateMasteryScore(progressWithString)).not.toThrow();
  });
});

describe('getMasteryLevel', () => {
  it.each([
    [95, 'mastered'],
    [90, 'mastered'],
    [75, 'proficient'],
    [70, 'proficient'],
    [55, 'learning'],
    [50, 'learning'],
    [35, 'needsWork'],
    [30, 'needsWork'],
    [10, 'new'],
    [0, 'new'],
  ])('分数 %i 应返回 %s', (score, expected) => {
    expect(getMasteryLevel(score)).toBe(expected);
  });
});

describe('analyzeMasteryDistribution', () => {
  it('空列表应返回所有分类为空', () => {
    const result = analyzeMasteryDistribution([]);
    expect(result.mastered).toHaveLength(0);
    expect(result.new).toHaveLength(0);
  });

  it('应正确分类单词到对应级别', () => {
    const mastered = makeProgress(10, 0, 0);   // score=100 → mastered
    const newWord = makeProgress(0, 0, 60);    // score=0   → new (60天前，时间衰减为0)
    const result = analyzeMasteryDistribution([mastered, newWord]);
    expect(result.mastered).toHaveLength(1);
    expect(result.new).toHaveLength(1);
  });

  it('所有分类的总数应等于输入列表长度', () => {
    const list = [makeProgress(10, 0, 0), makeProgress(0, 0, 0), makeProgress(5, 5, 5)];
    const result = analyzeMasteryDistribution(list);
    const total = Object.values(result).reduce((sum, arr) => sum + arr.length, 0);
    expect(total).toBe(list.length);
  });
});

describe('getMasteryPercentage', () => {
  it('空分布应返回全0', () => {
    const dist = analyzeMasteryDistribution([]);
    const pct = getMasteryPercentage(dist);
    expect(pct.mastered).toBe(0);
    expect(pct.new).toBe(0);
  });

  it('所有百分比之和应约等于100', () => {
    const list = Array.from({ length: 10 }, (_, i) => makeProgress(i, 10 - i, i));
    const dist = analyzeMasteryDistribution(list);
    const pct = getMasteryPercentage(dist);
    const sum = Object.values(pct).reduce((a, b) => a + b, 0);
    // 由于四舍五入，允许±2的误差
    expect(sum).toBeGreaterThanOrEqual(98);
    expect(sum).toBeLessThanOrEqual(102);
  });
});

describe('identifyWeakWords', () => {
  it('应返回分数低于阈值的单词，按分数升序排列', () => {
    const weak = makeProgress(0, 10, 30);   // score低
    const strong = makeProgress(10, 0, 0);  // score=100
    const result = identifyWeakWords([strong, weak]);
    expect(result).toContain(weak);
    expect(result).not.toContain(strong);
  });

  it('自定义阈值应生效', () => {
    const list = [makeProgress(10, 0, 0), makeProgress(0, 0, 0)];
    // 阈值设为0，没有单词低于0
    expect(identifyWeakWords(list, 0)).toHaveLength(0);
    // 阈值设为101，所有单词都低于101
    expect(identifyWeakWords(list, 101)).toHaveLength(2);
  });
});

describe('calculateAverageMasteryScore', () => {
  it('空列表应返回0', () => {
    expect(calculateAverageMasteryScore([])).toBe(0);
  });

  it('单个元素应返回其自身分数', () => {
    const progress = makeProgress(10, 0, 0);
    expect(calculateAverageMasteryScore([progress])).toBe(calculateMasteryScore(progress));
  });

  it('平均分应在所有单词分数的范围内', () => {
    const list = [makeProgress(10, 0, 0), makeProgress(0, 0, 0)];
    const avg = calculateAverageMasteryScore(list);
    expect(avg).toBeGreaterThanOrEqual(0);
    expect(avg).toBeLessThanOrEqual(100);
  });
});
