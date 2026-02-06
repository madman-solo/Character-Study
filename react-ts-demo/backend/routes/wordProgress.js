/**
 * Word Progress API Routes
 * 单词学习进度API路由 - 支持成人和少儿单词进度跟踪
 */

const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const {
  calculateNextReview,
  isDueForReview,
  getWordsForReview,
  isMastered,
  getStatistics
} = require('../utils/spacedRepetition');

/**
 * POST /api/word-progress
 * Track adult word learning progress
 * 跟踪成人单词学习进度
 *
 * @body {string} userId - User ID
 * @body {number} wordId - Word ID
 * @body {string} bookType - Book type (初一, 初二, etc.)
 * @body {boolean} correct - Whether answer was correct
 */
router.post('/word-progress', async (req, res) => {
  try {
    const { userId, wordId, bookType, correct } = req.body;

    // Validate input
    if (!userId || !wordId || !bookType || correct === undefined) {
      return res.status(400).json({
        error: 'Missing required fields: userId, wordId, bookType, correct'
      });
    }

    // Find existing progress
    let progress = await prisma.wordProgress.findUnique({
      where: {
        userId_wordId_bookType: {
          userId,
          wordId: parseInt(wordId),
          bookType
        }
      }
    });

    const now = new Date();

    if (progress) {
      // Update existing progress
      const updateData = {
        lastStudied: now,
        correctCount: correct ? progress.correctCount + 1 : progress.correctCount,
        wrongCount: correct ? progress.wrongCount : progress.wrongCount + 1
      };

      // Check if mastered
      updateData.mastered = isMastered({
        correctCount: updateData.correctCount,
        wrongCount: updateData.wrongCount
      });

      progress = await prisma.wordProgress.update({
        where: {
          userId_wordId_bookType: {
            userId,
            wordId: parseInt(wordId),
            bookType
          }
        },
        data: updateData
      });
    } else {
      // Create new progress
      progress = await prisma.wordProgress.create({
        data: {
          userId,
          wordId: parseInt(wordId),
          bookType,
          correctCount: correct ? 1 : 0,
          wrongCount: correct ? 0 : 1,
          lastStudied: now,
          mastered: false
        }
      });
    }

    // Calculate next review date
    const nextReview = calculateNextReview(progress);

    res.json({
      success: true,
      progress: {
        id: progress.id,
        userId: progress.userId,
        wordId: progress.wordId,
        bookType: progress.bookType,
        correctCount: progress.correctCount,
        wrongCount: progress.wrongCount,
        lastStudied: progress.lastStudied,
        mastered: progress.mastered,
        nextReview
      }
    });
  } catch (error) {
    console.error('Error tracking word progress:', error);
    res.status(500).json({ error: 'Failed to track progress' });
  }
});

/**
 * GET /api/word-progress/review/:userId
 * Get words due for review (adult vocabulary)
 * 获取需要复习的成人单词
 *
 * @param {string} userId - User ID
 * @query {string} bookType - Book type filter
 * @query {number} limit - Optional limit (default: 20)
 */
router.get('/word-progress/review/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const bookType = req.query.bookType;
    const limit = parseInt(req.query.limit) || 20;

    // Build where clause
    const where = { userId };
    if (bookType) {
      where.bookType = bookType;
    }

    // Fetch all progress records
    const progressRecords = await prisma.wordProgress.findMany({
      where,
      include: {
        word: true
      }
    });

    // Format for spaced repetition algorithm
    const wordsWithProgress = progressRecords.map(p => ({
      word: p.word,
      progress: {
        correctCount: p.correctCount,
        wrongCount: p.wrongCount,
        lastStudied: p.lastStudied,
        mastered: p.mastered
      }
    }));

    // Get words due for review, sorted by priority
    const dueWords = getWordsForReview(wordsWithProgress);

    // Limit results
    const limitedWords = dueWords.slice(0, limit);

    // Calculate next review dates
    const results = limitedWords.map(item => ({
      word: {
        id: item.word.id,
        word: item.word.word,
        phonetic: item.word.phonetic,
        translation: item.word.translation,
        definition: item.word.definition,
        pos: item.word.pos
      },
      progress: {
        correctCount: item.progress.correctCount,
        wrongCount: item.progress.wrongCount,
        lastStudied: item.progress.lastStudied,
        mastered: item.progress.mastered,
        nextReview: calculateNextReview(item.progress)
      }
    }));

    // Get statistics
    const stats = getStatistics(progressRecords.map(p => ({
      correctCount: p.correctCount,
      wrongCount: p.wrongCount,
      lastStudied: p.lastStudied,
      mastered: p.mastered
    })));

    res.json({
      userId,
      bookType: bookType || 'all',
      count: results.length,
      totalDue: dueWords.length,
      statistics: stats,
      words: results
    });
  } catch (error) {
    console.error('Error fetching review words:', error);
    res.status(500).json({ error: 'Failed to fetch review words' });
  }
});

/**
 * POST /api/child-word-progress
 * Track child word learning progress
 * 跟踪少儿单词学习进度
 *
 * @body {string} userId - User ID
 * @body {number} wordId - Child word ID
 * @body {boolean} correct - Whether answer was correct
 */
router.post('/child-word-progress', async (req, res) => {
  try {
    const { userId, wordId, correct } = req.body;

    // Validate input
    if (!userId || !wordId || correct === undefined) {
      return res.status(400).json({
        error: 'Missing required fields: userId, wordId, correct'
      });
    }

    // Find existing progress
    let progress = await prisma.childWordProgress.findUnique({
      where: {
        userId_wordId: {
          userId,
          wordId: parseInt(wordId)
        }
      }
    });

    const now = new Date();

    if (progress) {
      // Update existing progress
      const updateData = {
        lastStudied: now,
        correctCount: correct ? progress.correctCount + 1 : progress.correctCount,
        wrongCount: correct ? progress.wrongCount : progress.wrongCount + 1
      };

      // Check if mastered
      updateData.mastered = isMastered({
        correctCount: updateData.correctCount,
        wrongCount: updateData.wrongCount
      });

      progress = await prisma.childWordProgress.update({
        where: {
          userId_wordId: {
            userId,
            wordId: parseInt(wordId)
          }
        },
        data: updateData
      });
    } else {
      // Create new progress
      progress = await prisma.childWordProgress.create({
        data: {
          userId,
          wordId: parseInt(wordId),
          correctCount: correct ? 1 : 0,
          wrongCount: correct ? 0 : 1,
          lastStudied: now,
          mastered: false
        }
      });
    }

    // Calculate next review date
    const nextReview = calculateNextReview(progress);

    res.json({
      success: true,
      progress: {
        id: progress.id,
        userId: progress.userId,
        wordId: progress.wordId,
        correctCount: progress.correctCount,
        wrongCount: progress.wrongCount,
        lastStudied: progress.lastStudied,
        mastered: progress.mastered,
        nextReview
      }
    });
  } catch (error) {
    console.error('Error tracking child word progress:', error);
    res.status(500).json({ error: 'Failed to track progress' });
  }
});

/**
 * GET /api/child-word-progress/review/:userId
 * Get child words due for review
 * 获取需要复习的少儿单词
 *
 * @param {string} userId - User ID
 * @query {number} grade - Optional grade filter (0-6)
 * @query {number} limit - Optional limit (default: 10)
 */
router.get('/child-word-progress/review/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const grade = req.query.grade ? parseInt(req.query.grade) : null;
    const limit = parseInt(req.query.limit) || 10;

    // Fetch all child word progress records
    const progressRecords = await prisma.childWordProgress.findMany({
      where: { userId },
      include: {
        word: true
      }
    });

    // Filter by grade if specified
    let filteredRecords = progressRecords;
    if (grade !== null && !isNaN(grade)) {
      filteredRecords = progressRecords.filter(p => p.word.grade === grade);
    }

    // Format for spaced repetition algorithm
    const wordsWithProgress = filteredRecords.map(p => ({
      word: p.word,
      progress: {
        correctCount: p.correctCount,
        wrongCount: p.wrongCount,
        lastStudied: p.lastStudied,
        mastered: p.mastered
      }
    }));

    // Get words due for review, sorted by priority
    const dueWords = getWordsForReview(wordsWithProgress);

    // Limit results
    const limitedWords = dueWords.slice(0, limit);

    // Calculate next review dates
    const results = limitedWords.map(item => ({
      word: {
        id: item.word.id,
        word: item.word.word,
        phonetic: item.word.phonetic,
        translation: item.word.translation,
        pos: item.word.pos,
        grade: item.word.grade
      },
      progress: {
        correctCount: item.progress.correctCount,
        wrongCount: item.progress.wrongCount,
        lastStudied: item.progress.lastStudied,
        mastered: item.progress.mastered,
        nextReview: calculateNextReview(item.progress)
      }
    }));

    // Get statistics
    const stats = getStatistics(filteredRecords.map(p => ({
      correctCount: p.correctCount,
      wrongCount: p.wrongCount,
      lastStudied: p.lastStudied,
      mastered: p.mastered
    })));

    res.json({
      userId,
      grade: grade !== null ? grade : 'all',
      count: results.length,
      totalDue: dueWords.length,
      statistics: stats,
      words: results
    });
  } catch (error) {
    console.error('Error fetching child review words:', error);
    res.status(500).json({ error: 'Failed to fetch review words' });
  }
});

/**
 * GET /api/child-word-progress/all/:userId
 * Get all learned child words (including those not due for review)
 * 获取所有已学少儿单词（包括不需要复习的）
 *
 * @param {string} userId - User ID
 * @query {number} grade - Optional grade filter (0-6)
 */
router.get('/child-word-progress/all/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const grade = req.query.grade ? parseInt(req.query.grade) : null;

    // Fetch all child word progress records
    const progressRecords = await prisma.childWordProgress.findMany({
      where: { userId },
      include: {
        word: true
      },
      orderBy: {
        lastStudied: 'desc' // 最近学习的排在前面
      }
    });

    // Filter by grade if specified
    let filteredRecords = progressRecords;
    if (grade !== null && !isNaN(grade)) {
      filteredRecords = progressRecords.filter(p => p.word.grade === grade);
    }

    // Format for response with next review dates
    const results = filteredRecords.map(p => {
      const nextReview = calculateNextReview({
        correctCount: p.correctCount,
        wrongCount: p.wrongCount,
        lastStudied: p.lastStudied,
        mastered: p.mastered
      });

      return {
        word: {
          id: p.word.id,
          word: p.word.word,
          phonetic: p.word.phonetic,
          translation: p.word.translation,
          pos: p.word.pos,
          grade: p.word.grade
        },
        progress: {
          correctCount: p.correctCount,
          wrongCount: p.wrongCount,
          lastStudied: p.lastStudied,
          mastered: p.mastered,
          nextReview,
          isDue: isDueForReview({
            correctCount: p.correctCount,
            wrongCount: p.wrongCount,
            lastStudied: p.lastStudied,
            mastered: p.mastered
          })
        }
      };
    });

    // Get statistics
    const stats = getStatistics(filteredRecords.map(p => ({
      correctCount: p.correctCount,
      wrongCount: p.wrongCount,
      lastStudied: p.lastStudied,
      mastered: p.mastered
    })));

    res.json({
      userId,
      grade: grade !== null ? grade : 'all',
      count: results.length,
      statistics: stats,
      words: results
    });
  } catch (error) {
    console.error('Error fetching all learned child words:', error);
    res.status(500).json({ error: 'Failed to fetch learned words' });
  }
});

/**
 * GET /api/word-progress/statistics/:userId
 * Get learning statistics for a user
 * 获取用户学习统计
 *
 * @param {string} userId - User ID
 * @query {string} bookType - Optional book type filter
 */
router.get('/word-progress/statistics/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const bookType = req.query.bookType;

    const where = { userId };
    if (bookType) {
      where.bookType = bookType;
    }

    const progressRecords = await prisma.wordProgress.findMany({ where });

    const stats = getStatistics(progressRecords.map(p => ({
      correctCount: p.correctCount,
      wrongCount: p.wrongCount,
      lastStudied: p.lastStudied,
      mastered: p.mastered
    })));

    res.json({
      userId,
      bookType: bookType || 'all',
      statistics: stats
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router;
