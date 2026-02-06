/**
 * 奖励数据管理路由
 * 处理用户奖励数据的增删改查
 */

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * 获取用户奖励数据
 * GET /api/reward-data/:userId
 */
router.get('/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    // 验证用户权限
    if (req.user.id !== userId) {
      return res.status(403).json({ error: '无权访问此数据' });
    }

    const rewardData = await prisma.userRewardData.findUnique({
      where: { userId },
    });

    if (!rewardData) {
      return res.status(404).json({ error: '奖励数据不存在' });
    }

    // 解析 JSON 字段
    const data = {
      userId: rewardData.userId,
      totalPoints: rewardData.totalPoints,
      badges: JSON.parse(rewardData.badges),
      recentPoints: JSON.parse(rewardData.recentPoints),
      lastSyncAt: rewardData.lastSyncAt.toISOString(),
    };

    res.json({ success: true, data });
  } catch (error) {
    console.error('获取奖励数据失败:', error);
    res.status(500).json({ error: '获取奖励数据失败' });
  }
});

/**
 * 创建或更新用户奖励数据
 * POST /api/reward-data
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { userId, totalPoints, badges, recentPoints } = req.body;

    // 验证用户权限
    if (req.user.id !== userId) {
      return res.status(403).json({ error: '无权修改此数据' });
    }

    // 检查是否已存在
    const existing = await prisma.userRewardData.findUnique({
      where: { userId },
    });

    const dataToSave = {
      userId,
      totalPoints: totalPoints || 0,
      badges: JSON.stringify(badges || []),
      recentPoints: JSON.stringify(recentPoints || []),
      lastSyncAt: new Date(),
    };

    if (existing) {
      // 更新
      await prisma.userRewardData.update({
        where: { userId },
        data: dataToSave,
      });
    } else {
      // 创建
      await prisma.userRewardData.create({
        data: dataToSave,
      });
    }

    res.json({ success: true, message: '奖励数据保存成功' });
  } catch (error) {
    console.error('保存奖励数据失败:', error);
    res.status(500).json({ error: '保存奖励数据失败' });
  }
});

module.exports = router;
