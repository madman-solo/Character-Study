/**
 * 学习数据管理路由
 * 处理用户学习数据的增删改查
 */
/**
 * @swagger
 * /api/learning-data/{userId}:
 *   get:
 *     summary: 获取用户学习数据
 *     tags: [学习数据]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 返回学习数据
 *       403:
 *         description: 无权访问
 *
 * /api/learning-data:
 *   post:
 *     summary: 创建或更新学习数据
 *     tags: [学习数据]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId]
 *             properties:
 *               userId:
 *                 type: string
 *               totalStudyTime:
 *                 type: integer
 *                 description: 总学习时长（分钟）
 *               consecutiveDays:
 *                 type: integer
 *               masteredWords:
 *                 type: array
 *                 items:
 *                   type: string
 *               weakWords:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: 学习数据保存成功
 */

const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

/**
 * 获取用户学习数据
 * GET /api/learning-data/:userId
 */
router.get("/:userId", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    // 验证用户权限
    if (req.user.id !== userId) {
      return res.status(403).json({ error: "无权访问此数据" });
    }

    const learningData = await prisma.userLearningData.findUnique({
      where: { userId },
    });

    if (!learningData) {
      return res.status(404).json({ error: "学习数据不存在" });
    }

    // 解析 JSON 字段
    const data = {
      userId: learningData.userId,
      totalStudyTime: studyStats.totalMinutes,
      consecutiveDays: learningData.consecutiveDays,
      interactionCount: learningData.interactionCount,
      dailyStudyTime: JSON.parse(learningData.dailyStudyTime),
      currentBookProgress: JSON.parse(learningData.currentBookProgress),
      masteredWords: JSON.parse(learningData.masteredWords),
      weakWords: JSON.parse(learningData.weakWords),
      answerHistory: JSON.parse(learningData.answerHistory),
      lastSyncAt: learningData.lastSyncAt.toISOString(),
    };

    res.json({ success: true, data });
  } catch (error) {
    console.error("获取学习数据失败:", error);
    res.status(500).json({ error: "获取学习数据失败" });
  }
});

/**
 * 创建或更新用户学习数据
 * POST /api/learning-data
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      userId,
      totalStudyTime,
      consecutiveDays,
      interactionCount,
      dailyStudyTime,
      currentBookProgress,
      masteredWords,
      weakWords,
      answerHistory,
    } = req.body;

    // 验证用户权限
    if (req.user.id !== userId) {
      return res.status(403).json({ error: "无权修改此数据" });
    }

    // 检查是否已存在
    const existing = await prisma.userLearningData.findUnique({
      where: { userId },
    });

    const dataToSave = {
      userId,
      totalStudyTime: totalStudyTime || 0,
      consecutiveDays: consecutiveDays || 0,
      interactionCount: interactionCount || 0,
      dailyStudyTime: JSON.stringify(dailyStudyTime || {}),
      currentBookProgress: JSON.stringify(currentBookProgress || {}),
      masteredWords: JSON.stringify(masteredWords || []),
      weakWords: JSON.stringify(weakWords || []),
      answerHistory: JSON.stringify(answerHistory || {}),
      lastSyncAt: new Date(),
    };

    let learningData;
    if (existing) {
      // 更新
      learningData = await prisma.userLearningData.update({
        where: { userId },
        data: dataToSave,
      });
    } else {
      // 创建
      learningData = await prisma.userLearningData.create({
        data: dataToSave,
      });
    }

    res.json({ success: true, message: "学习数据保存成功" });
  } catch (error) {
    console.error("保存学习数据失败:", error);
    res.status(500).json({ error: "保存学习数据失败" });
  }
});

module.exports = router;
