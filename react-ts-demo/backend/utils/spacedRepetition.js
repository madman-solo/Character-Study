/**
 * Spaced Repetition Algorithm - Ebbinghaus Forgetting Curve Implementation
 * 艾宾浩斯遗忘曲线算法实现
 */

// Review intervals in days (复习间隔天数)
const INTERVALS = {
  first: 1,      // 第一次复习：1天后
  second: 3,     // 第二次复习：3天后
  third: 7,      // 第三次复习：7天后
  fourth: 15,    // 第四次复习：15天后
  fifth: 30,     // 第五次复习：30天后
  mastered: 60   // 已掌握：60天后（认为已完全掌握）
};

// Child mode intervals - shorter for better retention (儿童模式间隔 - 更短以提高记忆效果)
const CHILD_INTERVALS = {
  first: 1,      // 第一次复习：1天后
  second: 2,     // 第二次复习：2天后
  third: 5,      // 第三次复习：5天后
  fourth: 10,    // 第四次复习：10天后
  fifth: 20,     // 第五次复习：20天后
  mastered: 40   // 已掌握：40天后
};

/**
 * Add days to a date
 * @param {Date|string} date - Starting date
 * @param {number} days - Number of days to add
 * @returns {Date} New date
 */
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Calculate next review date based on learning progress
 * 根据学习进度计算下次复习日期
 *
 * @param {Object} progress - Word progress object
 * @param {number} progress.correctCount - Number of correct answers
 * @param {number} progress.wrongCount - Number of wrong answers
 * @param {Date|string} progress.lastStudied - Last study date
 * @param {boolean} isChild - Whether to use child mode intervals (default: false)
 * @returns {Date} Next review date
 */
function calculateNextReview(progress, isChild = false) {
  const { correctCount, wrongCount, lastStudied } = progress;
  const lastStudyDate = new Date(lastStudied);

  // Select intervals based on mode
  const intervals = isChild ? CHILD_INTERVALS : INTERVALS;

  // If more wrong than correct, reset to first interval
  // 如果错误次数多于正确次数，重置到第一个间隔
  if (wrongCount > correctCount) {
    return addDays(lastStudyDate, intervals.first);
  }

  // Progressive intervals based on correct count
  // 根据正确次数递进间隔
  if (correctCount === 0) return addDays(lastStudyDate, intervals.first);
  if (correctCount === 1) return addDays(lastStudyDate, intervals.first);
  if (correctCount === 2) return addDays(lastStudyDate, intervals.second);
  if (correctCount === 3) return addDays(lastStudyDate, intervals.third);
  if (correctCount === 4) return addDays(lastStudyDate, intervals.fourth);
  if (correctCount >= 5) return addDays(lastStudyDate, intervals.fifth);

  // Default to mastered interval
  return addDays(lastStudyDate, intervals.mastered);
}

/**
 * Check if a word is due for review
 * 检查单词是否需要复习
 *
 * @param {Object} progress - Word progress object
 * @returns {boolean} True if due for review
 */
function isDueForReview(progress) {
  if (!progress.lastStudied) return true;

  const nextReview = calculateNextReview(progress);
  const now = new Date();

  return now >= nextReview;
}

/**
 * Calculate priority score for review scheduling
 * Higher score = higher priority
 * 计算复习优先级分数（分数越高优先级越高）
 *
 * @param {Object} progress - Word progress object
 * @returns {number} Priority score
 */
function calculatePriority(progress) {
  const nextReview = calculateNextReview(progress);
  const now = new Date();
  const daysOverdue = Math.floor((now - nextReview) / (1000 * 60 * 60 * 24));

  // Base priority on how overdue the review is
  let priority = Math.max(0, daysOverdue * 10);

  // Boost priority for words with more wrong answers
  priority += progress.wrongCount * 5;

  // Reduce priority for words with high correct count (already well-learned)
  priority -= progress.correctCount * 2;

  return Math.max(0, priority);
}

/**
 * Sort words by review priority
 * 按复习优先级排序单词
 *
 * @param {Array} wordsWithProgress - Array of {word, progress} objects
 * @returns {Array} Sorted array
 */
function sortByPriority(wordsWithProgress) {
  return wordsWithProgress.sort((a, b) => {
    const priorityA = calculatePriority(a.progress);
    const priorityB = calculatePriority(b.progress);
    return priorityB - priorityA; // Descending order
  });
}

/**
 * Filter words that are due for review
 * 筛选需要复习的单词
 *
 * @param {Array} wordsWithProgress - Array of {word, progress} objects
 * @returns {Array} Filtered and sorted array
 */
function getWordsForReview(wordsWithProgress) {
  // Filter words due for review
  const dueWords = wordsWithProgress.filter(item =>
    isDueForReview(item.progress)
  );

  // Sort by priority
  return sortByPriority(dueWords);
}

/**
 * Check if word is mastered
 * 检查单词是否已掌握
 *
 * @param {Object} progress - Word progress object
 * @returns {boolean} True if mastered
 */
function isMastered(progress) {
  // Consider mastered if:
  // - At least 5 correct answers
  // - Less than 2 wrong answers
  // - Last review was correct (implied by correctCount > wrongCount)
  return progress.correctCount >= 5 &&
         progress.wrongCount < 2 &&
         progress.correctCount > progress.wrongCount;
}

/**
 * Get statistics for a set of word progress records
 * 获取单词学习进度统计
 *
 * @param {Array} progressRecords - Array of progress objects
 * @returns {Object} Statistics
 */
function getStatistics(progressRecords) {
  const total = progressRecords.length;
  const mastered = progressRecords.filter(p => isMastered(p)).length;
  const dueForReview = progressRecords.filter(p => isDueForReview(p)).length;
  const learning = total - mastered;

  return {
    total,
    mastered,
    learning,
    dueForReview,
    masteryRate: total > 0 ? (mastered / total * 100).toFixed(1) : 0
  };
}

module.exports = {
  INTERVALS,
  CHILD_INTERVALS,
  calculateNextReview,
  isDueForReview,
  calculatePriority,
  sortByPriority,
  getWordsForReview,
  isMastered,
  getStatistics,
  addDays
};
