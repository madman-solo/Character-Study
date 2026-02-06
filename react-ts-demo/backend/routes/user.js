/**
 * 用户信息管理路由
 * 处理用户信息查询、更新、游客转换等
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware, generateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * 获取当前用户信息
 * GET /api/user/me
 */
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        nickname: true,
        avatar: true,
        ageGroup: true,
        bio: true,
        isGuest: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({ error: '获取用户信息失败' });
  }
});

/**
 * 更新用户信息
 * PUT /api/user/me
 */
router.put('/me', authMiddleware, async (req, res) => {
  try {
    const { nickname, avatar, ageGroup, bio, email } = req.body;

    // 构建更新数据
    const updateData = {};
    if (nickname !== undefined) updateData.nickname = nickname;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (ageGroup !== undefined) updateData.ageGroup = ageGroup;
    if (bio !== undefined) updateData.bio = bio;
    if (email !== undefined) {
      // 检查邮箱是否已被其他用户使用
      if (email) {
        const existingEmail = await prisma.user.findFirst({
          where: {
            email,
            NOT: { id: req.user.id },
          },
        });

        if (existingEmail) {
          return res.status(400).json({ error: '邮箱已被使用' });
        }
      }
      updateData.email = email;
    }

    // 更新用户信息
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        nickname: true,
        avatar: true,
        ageGroup: true,
        bio: true,
        isGuest: true,
      },
    });

    res.json({ success: true, user });
  } catch (error) {
    console.error('更新用户信息失败:', error);
    res.status(500).json({ error: '更新用户信息失败' });
  }
});

/**
 * 游客转换为正式用户
 * POST /api/user/convert-guest
 */
router.post('/convert-guest', async (req, res) => {
  try {
    const { guestId, username, password, email, nickname } = req.body;

    // 验证必填字段
    if (!guestId || !username || !password) {
      return res.status(400).json({ error: '缺少必填字段' });
    }

    // 验证用户名长度
    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({ error: '用户名长度必须在3-20个字符之间' });
    }

    // 验证密码强度
    if (password.length < 6) {
      return res.status(400).json({ error: '密码长度至少为6个字符' });
    }

    // 检查游客是否存在
    const guest = await prisma.user.findUnique({
      where: { id: guestId },
    });

    if (!guest || !guest.isGuest) {
      return res.status(400).json({ error: '无效的游客账号' });
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

    // 更新游客为正式用户
    const user = await prisma.user.update({
      where: { id: guestId },
      data: {
        username,
        password: hashedPassword,
        email: email || null,
        nickname: nickname || username,
        isGuest: false,
      },
    });

    // 生成新的 Token
    const token = generateToken({
      id: user.id,
      username: user.username,
      isGuest: false,
    });

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
    console.error('游客转换失败:', error);
    res.status(500).json({ error: '游客转换失败' });
  }
});

module.exports = router;
