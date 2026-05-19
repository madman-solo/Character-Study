/**
 * Child Words API Routes
 * 少儿单词API路由
 */
/**
 * @swagger
 * /api/child-words/by-grade/{grade}:
 *   get:
 *     summary: 按年级获取少儿单词
 *     tags: [少儿词汇]
 *     parameters:
 *       - in: path
 *         name: grade
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 0
 *           maximum: 6
 *         description: 年级（0=幼儿园，1-6=小学）
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *     responses:
 *       200:
 *         description: 返回单词列表
 *
 * /api/child-words/by-letter/{letter}:
 *   get:
 *     summary: 按首字母获取少儿单词
 *     tags: [少儿词汇]
 *     parameters:
 *       - in: path
 *         name: letter
 *         required: true
 *         schema:
 *           type: string
 *         description: 首字母（A-Z）
 *       - in: query
 *         name: grade
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: 返回单词列表
 *
 * /api/child-words/random:
 *   get:
 *     summary: 获取随机少儿单词
 *     tags: [少儿词汇]
 *     parameters:
 *       - in: query
 *         name: grade
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 返回一个随机单词
 *
 * /api/child-words/{word}:
 *   get:
 *     summary: 查询特定单词详情
 *     tags: [少儿词汇]
 *     parameters:
 *       - in: path
 *         name: word
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 返回单词详情
 *       404:
 *         description: 单词不存在
 *
 * /api/child-words:
 *   get:
 *     summary: 获取所有少儿单词（支持分页）
 *     tags: [少儿词汇]
 *     parameters:
 *       - in: query
 *         name: grade
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: 返回单词列表及总数
 */

const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * GET /api/child-words/by-grade/:grade
 * Get child words by grade level
 * 根据年级获取少儿单词
 *
 * @param {string} grade - Grade level (0=kindergarten, 1-6=primary school)
 * @query {number} limit - Optional limit (default: 100, 0 = all)
 */
router.get("/by-grade/:grade", async (req, res) => {
  try {
    const grade = parseInt(req.params.grade);
    const limit = parseInt(req.query.limit) || 100;

    // Validate grade
    if (isNaN(grade) || grade < 0 || grade > 6) {
      return res.status(400).json({
        error:
          "Invalid grade. Must be 0-6 (0=kindergarten, 1-6=primary school)",
      });
    }

    // Build query
    const query = {
      where: { grade },
      orderBy: [
        { frq: "desc" }, // Order by frequency (most common first)
        { word: "asc" }, // Then alphabetically
      ],
    };

    // Add limit if specified
    if (limit > 0) {
      query.take = limit;
    }

    const words = await prisma.childWord.findMany(query);

    res.json({
      grade,
      count: words.length,
      words: words.map((w) => ({
        id: w.id,
        word: w.word,
        phonetic: w.phonetic,
        translation: w.translation,
        pos: w.pos,
        grade: w.grade,
        audio: w.audio,
      })),
    });
  } catch (error) {
    console.error("Error fetching child words by grade:", error);
    res.status(500).json({ error: "Failed to fetch words" });
  }
});

/**
 * GET /api/child-words/by-letter/:letter
 * Get words starting with specific letter
 * 获取以特定字母开头的单词
 *
 * @param {string} letter - Starting letter (A-Z)
 * @query {number} grade - Optional grade filter
 * @query {number} limit - Optional limit (default: 50)
 */
router.get("/by-letter/:letter", async (req, res) => {
  try {
    const letter = req.params.letter.toLowerCase();
    const grade = req.query.grade ? parseInt(req.query.grade) : null;
    const limit = parseInt(req.query.limit) || 50;

    // Validate letter
    if (!/^[a-z]$/.test(letter)) {
      return res.status(400).json({ error: "Invalid letter. Must be A-Z" });
    }

    // Build query
    const where = {
      word: {
        startsWith: letter,
      },
    };

    // Add grade filter if specified
    if (grade !== null && !isNaN(grade)) {
      where.grade = grade;
    }

    const words = await prisma.childWord.findMany({
      where,
      orderBy: [{ word: "asc" }],
      take: limit,
    });

    res.json({
      letter: letter.toUpperCase(),
      grade: grade,
      count: words.length,
      words: words.map((w) => ({
        id: w.id,
        word: w.word,
        phonetic: w.phonetic,
        translation: w.translation,
        pos: w.pos,
        grade: w.grade,
        audio: w.audio,
      })),
    });
  } catch (error) {
    console.error("Error fetching child words by letter:", error);
    res.status(500).json({ error: "Failed to fetch words" });
  }
});

/**
 * GET /api/child-words/random
 * Get random word for featured display
 * 获取随机单词用于展示
 *
 * @query {number} grade - Optional grade filter
 */
router.get("/random", async (req, res) => {
  try {
    const grade = req.query.grade ? parseInt(req.query.grade) : null;

    // Build where clause
    const where = {};
    if (grade !== null && !isNaN(grade)) {
      where.grade = grade;
    }

    // Get total count
    const count = await prisma.childWord.count({ where });

    if (count === 0) {
      return res.status(404).json({ error: "No words found" });
    }

    // Get random offset
    const randomOffset = Math.floor(Math.random() * count);

    // Fetch random word
    const word = await prisma.childWord.findMany({
      where,
      skip: randomOffset,
      take: 1,
    });

    if (word.length === 0) {
      return res.status(404).json({ error: "No word found" });
    }

    res.json({
      id: word[0].id,
      word: word[0].word,
      phonetic: word[0].phonetic,
      translation: word[0].translation,
      pos: word[0].pos,
      grade: word[0].grade,
      audio: word[0].audio,
    });
  } catch (error) {
    console.error("Error fetching random child word:", error);
    res.status(500).json({ error: "Failed to fetch word" });
  }
});

/**
 * GET /api/child-words/:word
 * Get specific word details
 * 获取特定单词详情
 *
 * @param {string} word - Word to look up
 */
router.get("/:word", async (req, res) => {
  try {
    const wordParam = req.params.word.toLowerCase();

    const word = await prisma.childWord.findFirst({
      where: {
        word: wordParam,
      },
    });

    if (!word) {
      return res.status(404).json({ error: "Word not found" });
    }

    res.json({
      id: word.id,
      word: word.word,
      phonetic: word.phonetic,
      translation: word.translation,
      pos: word.pos,
      grade: word.grade,
      bnc: word.bnc,
      frq: word.frq,
      audio: word.audio,
    });
  } catch (error) {
    console.error("Error fetching child word:", error);
    res.status(500).json({ error: "Failed to fetch word" });
  }
});

/**
 * GET /api/child-words
 * Get all child words with optional filters
 * 获取所有少儿单词（可选过滤）
 *
 * @query {number} grade - Optional grade filter
 * @query {number} limit - Optional limit (default: 100)
 * @query {number} offset - Optional offset for pagination (default: 0)
 */
router.get("/", async (req, res) => {
  try {
    const grade = req.query.grade ? parseInt(req.query.grade) : null;
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;

    // Build where clause
    const where = {};
    if (grade !== null && !isNaN(grade)) {
      where.grade = grade;
    }

    // Get total count
    const total = await prisma.childWord.count({ where });

    // Fetch words
    const words = await prisma.childWord.findMany({
      where,
      orderBy: [{ grade: "asc" }, { frq: "desc" }, { word: "asc" }],
      skip: offset,
      take: limit,
    });

    res.json({
      total,
      offset,
      limit,
      count: words.length,
      words: words.map((w) => ({
        id: w.id,
        word: w.word,
        phonetic: w.phonetic,
        translation: w.translation,
        pos: w.pos,
        grade: w.grade,
        audio: w.audio,
      })),
    });
  } catch (error) {
    console.error("Error fetching child words:", error);
    res.status(500).json({ error: "Failed to fetch words" });
  }
});

module.exports = router;
