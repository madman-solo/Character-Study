/**
 * 用户认证路由
 * 处理用户注册、登录、信息更新等
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { generateToken, authMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * 用户注册
 * POST /api/auth/register
 */
router.post('/register', async (req, res) => {
  try {
    const { username, password, email, nickname, ageGroup } = req.body;

    // 验证必填字段
    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' });
    }

    // 验证用户名长度
    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({ error: '用户名长度必须在3-20个字符之间' });
    }

    // 验证密码强度
    if (password.length < 6) {
      return res.status(400).json({ error: '密码长度至少为6个字符' });
    }

    // 检查用户名是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return res.status(400).json({ error: '用户名已存在' });
    }

    // 检查邮箱是否已存在
    if (email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email },
      });

      if (existingEmail) {
        return res.status(400).json({ error: '邮箱已被使用' });
      }
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        email: email || null,
        nickname: nickname || username,
        ageGroup: ageGroup || null,
        isGuest: false,
      },
    });

    // 创建用户学习数据
    await prisma.userLearningData.create({
      data: { userId: user.id },
    });

    // 创建用户奖励数据
    await prisma.userRewardData.create({
      data: { userId: user.id },
    });

    // 生成 Token
    const token = generateToken({
      id: user.id,
      username: user.username,
      isGuest: false,
    });

    // 返回用户信息（不包含密码）
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        nickname: user.nickname,
        avatar: user.avatar,
        ageGroup: user.ageGroup,
        bio: user.bio,
        isGuest: false,
      },
    });
  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({ error: '注册失败，请稍后重试' });
  }
});

/**
 * 用户登录
 * POST /api/auth/login
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // 验证必填字段
    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' });
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    // 更新最后登录时间
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // 生成 Token
    const token = generateToken({
      id: user.id,
      username: user.username,
      isGuest: false,
    });

    // 返回用户信息
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        nickname: user.nickname,
        avatar: user.avatar,
        ageGroup: user.ageGroup,
        bio: user.bio,
        isGuest: false,
      },
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({ error: '登录失败，请稍后重试' });
  }
});

module.exports = router;
