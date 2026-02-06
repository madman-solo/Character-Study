/**
 * Learning Reports API
 * 学习报告生成API - 生成每日、每周、每月学习报告
 */

const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Helper function to parse date string
 */
function parseDate(dateString) {
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? new Date() : date;
}

/**
 * Helper function to format date as YYYY-MM-DD
 */
function formatDate(date) {
  return date.toISOString().split('T')[0];
}

/**
 * Helper function to get date range
 */
function getDateRange(startDate, endDate) {
  const dates = [];
  const current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    dates.push(formatDate(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

/**
 * Calculate achievements based on learning data
 */
function calculateAchievements(learningData, progressData) {
  const achievements = [];

  // 连续打卡成就
  if (learningData.consecutiveDays >= 7) {
    achievements.push({
      type: 'streak',
      title: `连续学习${learningData.consecutiveDays}天`,
      description: '坚持就是胜利！',
      icon: '🔥'
    });
  }

  // 掌握单词成就
  const masteredCount = learningData.masteredWords?.length || 0;
  if (masteredCount >= 50) {
    achievements.push({
      type: 'mastery',
      title: `掌握${masteredCount}个单词`,
      description: '词汇量稳步增长！',
      icon: '📚'
    });
  }

  // 学习时长成就
  const totalHours = Math.floor(learningData.totalStudyTime / 60);
  if (totalHours >= 10) {
    achievements.push({
      type: 'time',
      title: `累计学习${totalHours}小时`,
      description: '时间的积累带来进步！',
      icon: '⏰'
    });
  }

  // 准确率成就
  const accuracy = learningData.answerHistory?.accuracy || 0;
  if (accuracy >= 90) {
    achievements.push({
      type: 'accuracy',
      title: `答题准确率${accuracy.toFixed(1)}%`,
      description: '学习效果非常好！',
      icon: '🎯'
    });
  }

  return achievements;
}

/**
 * Generate improvement suggestions
 */
function generateSuggestions(learningData, progressData) {
  const suggestions = [];

  // 学习时长建议
  const avgDailyTime = Object.values(learningData.dailyStudyTime || {}).length > 0
    ? Object.values(learningData.dailyStudyTime).reduce((sum, time) => sum + time, 0) /
      Object.values(learningData.dailyStudyTime).length
    : 0;

  if (avgDailyTime < 15) {
    suggestions.push({
      type: 'time',
      priority: 'high',
      title: '增加学习时长',
      description: `当前平均每日学习${Math.round(avgDailyTime)}分钟，建议增加到15-20分钟`,
      icon: '⏰'
    });
  }

  // 复习频率建议
  const weakWordsCount = learningData.weakWords?.length || 0;
  if (weakWordsCount > 10) {
    suggestions.push({
      type: 'review',
      priority: 'high',
      title: '加强薄弱单词复习',
      description: `有${weakWordsCount}个薄弱单词需要重点复习`,
      icon: '📝'
    });
  }

  // 准确率建议
  const accuracy = learningData.answerHistory?.accuracy || 0;
  if (accuracy < 70) {
    suggestions.push({
      type: 'accuracy',
      priority: 'medium',
      title: '提高答题准确率',
      description: '建议放慢学习节奏，注重理解和记忆',
      icon: '🎯'
    });
  }

  // 连续打卡建议
  if (learningData.consecutiveDays < 3) {
    suggestions.push({
      type: 'consistency',
      priority: 'medium',
      title: '保持学习连续性',
      description: '建议每天坚持学习，养成良好习惯',
      icon: '🔥'
    });
  }

  return suggestions;
}

/**
 * GET /api/reports/daily/:userId
 * Get daily report for a specific date
 * 获取每日报告
 */
router.get('/daily/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { date } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    const targetDate = date ? parseDate(date) : new Date();
    const dateString = formatDate(targetDate);

    // Get user learning data
    const learningData = await prisma.userLearningData.findUnique({
      where: { userId }
    });

    if (!learningData) {
      return res.status(404).json({
        success: false,
        error: 'Learning data not found'
      });
    }

    // Parse JSON fields
    const dailyStudyTime = JSON.parse(learningData.dailyStudyTime || '{}');
    const dailyMasteredWords = JSON.parse(learningData.dailyMasteredWords || '{}');
    const dailyAccuracy = JSON.parse(learningData.dailyAccuracy || '{}');

    // Generate daily report
    const report = {
      date: dateString,
      studyTime: dailyStudyTime[dateString] || 0,
      newWords: dailyMasteredWords[dateString] || 0,
      accuracy: dailyAccuracy[dateString] || 0,
      consecutiveDays: learningData.consecutiveDays,
      summary: `今日学习${dailyStudyTime[dateString] || 0}分钟，掌握${dailyMasteredWords[dateString] || 0}个新单词`
    };

    res.json({
      success: true,
      report
    });
  } catch (error) {
    console.error('Error generating daily report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate daily report'
    });
  }
});

/**
 * GET /api/reports/weekly/:userId
 * Get weekly report
 * 获取周报
 */
router.get('/weekly/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { weekStart } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    // Calculate week range
    const startDate = weekStart ? parseDate(weekStart) : new Date();
    if (!weekStart) {
      startDate.setDate(startDate.getDate() - startDate.getDay()); // Start of week (Sunday)
    }
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6); // End of week (Saturday)

    // Get user learning data
    const learningData = await prisma.userLearningData.findUnique({
      where: { userId }
    });

    if (!learningData) {
      return res.status(404).json({
        success: false,
        error: 'Learning data not found'
      });
    }

    // Parse JSON fields
    const dailyStudyTime = JSON.parse(learningData.dailyStudyTime || '{}');
    const dailyMasteredWords = JSON.parse(learningData.dailyMasteredWords || '{}');
    const dailyAccuracy = JSON.parse(learningData.dailyAccuracy || '{}');
    const masteredWords = JSON.parse(learningData.masteredWords || '[]');
    const weakWords = JSON.parse(learningData.weakWords || '[]');

    // Calculate weekly statistics
    const dateRange = getDateRange(startDate, endDate);
    let totalStudyTime = 0;
    let totalNewWords = 0;
    let activeDays = 0;
    let totalAccuracy = 0;
    let accuracyCount = 0;

    dateRange.forEach(date => {
      const studyTime = dailyStudyTime[date] || 0;
      if (studyTime > 0) {
        totalStudyTime += studyTime;
        activeDays++;
      }
      totalNewWords += dailyMasteredWords[date] || 0;
      if (dailyAccuracy[date]) {
        totalAccuracy += dailyAccuracy[date];
        accuracyCount++;
      }
    });

    const avgAccuracy = accuracyCount > 0 ? totalAccuracy / accuracyCount : 0;

    // Generate achievements and suggestions
    const achievements = calculateAchievements(learningData, {});
    const suggestions = generateSuggestions(learningData, {});

    const report = {
      weekStart: formatDate(startDate),
      weekEnd: formatDate(endDate),
      totalStudyTime,
      activeDays,
      totalNewWords,
      masteredWordsCount: masteredWords.length,
      weakWordsCount: weakWords.length,
      avgAccuracy: Math.round(avgAccuracy * 10) / 10,
      consecutiveDays: learningData.consecutiveDays,
      achievements,
      suggestions,
      summary: `本周学习${activeDays}天，累计${totalStudyTime}分钟，掌握${totalNewWords}个新单词`
    };

    res.json({
      success: true,
      report
    });
  } catch (error) {
    console.error('Error generating weekly report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate weekly report'
    });
  }
});

/**
 * GET /api/reports/monthly/:userId
 * Get monthly report
 * 获取月报
 */
router.get('/monthly/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { month } = req.query; // Format: YYYY-MM

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    // Calculate month range
    let year, monthNum;
    if (month) {
      [year, monthNum] = month.split('-').map(Number);
    } else {
      const now = new Date();
      year = now.getFullYear();
      monthNum = now.getMonth() + 1;
    }

    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0); // Last day of month

    // Get user learning data
    const learningData = await prisma.userLearningData.findUnique({
      where: { userId }
    });

    if (!learningData) {
      return res.status(404).json({
        success: false,
        error: 'Learning data not found'
      });
    }

    // Parse JSON fields
    const dailyStudyTime = JSON.parse(learningData.dailyStudyTime || '{}');
    const dailyMasteredWords = JSON.parse(learningData.dailyMasteredWords || '{}');
    const dailyAccuracy = JSON.parse(learningData.dailyAccuracy || '{}');
    const masteredWords = JSON.parse(learningData.masteredWords || '[]');
    const weakWords = JSON.parse(learningData.weakWords || '[]');

    // Calculate monthly statistics
    const dateRange = getDateRange(startDate, endDate);
    let totalStudyTime = 0;
    let totalNewWords = 0;
    let activeDays = 0;
    let totalAccuracy = 0;
    let accuracyCount = 0;

    dateRange.forEach(date => {
      const studyTime = dailyStudyTime[date] || 0;
      if (studyTime > 0) {
        totalStudyTime += studyTime;
        activeDays++;
      }
      totalNewWords += dailyMasteredWords[date] || 0;
      if (dailyAccuracy[date]) {
        totalAccuracy += dailyAccuracy[date];
        accuracyCount++;
      }
    });

    const avgAccuracy = accuracyCount > 0 ? totalAccuracy / accuracyCount : 0;
    const avgDailyTime = activeDays > 0 ? Math.round(totalStudyTime / activeDays) : 0;

    // Generate achievements and suggestions
    const achievements = calculateAchievements(learningData, {});
    const suggestions = generateSuggestions(learningData, {});

    const report = {
      month: `${year}-${String(monthNum).padStart(2, '0')}`,
      monthStart: formatDate(startDate),
      monthEnd: formatDate(endDate),
      totalStudyTime,
      activeDays,
      totalNewWords,
      masteredWordsCount: masteredWords.length,
      weakWordsCount: weakWords.length,
      avgAccuracy: Math.round(avgAccuracy * 10) / 10,
      avgDailyTime,
      longestStreak: learningData.longestStreak || 0,
      achievements,
      suggestions,
      summary: `本月学习${activeDays}天，累计${totalStudyTime}分钟，平均每日${avgDailyTime}分钟，掌握${totalNewWords}个新单词`
    };

    res.json({
      success: true,
      report
    });
  } catch (error) {
    console.error('Error generating monthly report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate monthly report'
    });
  }
});

/**
 * POST /api/reports/generate/:userId
 * Manually trigger report generation (for caching)
 * 手动触发报告生成
 */
router.post('/generate/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { reportType } = req.body; // 'daily', 'weekly', 'monthly'

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    // Get user learning data
    const learningData = await prisma.userLearningData.findUnique({
      where: { userId }
    });

    if (!learningData) {
      return res.status(404).json({
        success: false,
        error: 'Learning data not found'
      });
    }

    // Generate report based on type
    let report;
    const now = new Date();

    switch (reportType) {
      case 'daily':
        report = {
          type: 'daily',
          date: formatDate(now),
          generated: true
        };
        break;

      case 'weekly':
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        report = {
          type: 'weekly',
          weekStart: formatDate(weekStart),
          generated: true
        };
        break;

      case 'monthly':
        report = {
          type: 'monthly',
          month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
          generated: true
        };
        break;

      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid report type'
        });
    }

    res.json({
      success: true,
      message: 'Report generated successfully',
      report
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate report'
    });
  }
});

module.exports = router;
