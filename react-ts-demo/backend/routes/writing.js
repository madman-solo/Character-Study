/**
 * @swagger
 * /api/writing/correct:
 *   post:
 *     summary: AI 语法纠错
 *     tags: [写作练习]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [text]
 *             properties:
 *               text:
 *                 type: string
 *                 description: 待纠错的英文文本
 *     responses:
 *       200:
 *         description: 返回纠错后的文本
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 corrected:
 *                   type: string
 *
 * /api/writing/submit:
 *   post:
 *     summary: 提交作文（AI 打分并保存）
 *     tags: [写作练习]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               userId:
 *                 type: string
 *               title:
 *                 type: string
 *                 default: 无标题
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: 返回作文 ID 和 AI 评分反馈
 *
 * /api/writing/history/{userId}:
 *   get:
 *     summary: 获取用户历史作文
 *     tags: [写作练习]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 返回作文列表（含评分）
 *
 * /api/writing/continue:
 *   post:
 *     summary: AI 续写
 *     tags: [写作练习]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [text]
 *             properties:
 *               text:
 *                 type: string
 *     responses:
 *       200:
 *         description: 返回续写后的完整文本
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 continued:
 *                   type: string
 */

const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const QIANFAN_API_KEY = process.env.QIANFAN_API_KEY;
const QIANFAN_BASE_URL = "https://qianfan.baidubce.com/v2";

async function callAI(messages) {
  const res = await fetch(`${QIANFAN_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${QIANFAN_API_KEY}`,
    },
    body: JSON.stringify({ model: "ernie-speed-pro-128k", messages }),
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

// AI 纠正
router.post("/correct", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "text is required" });

    const content = await callAI([
      {
        role: "system",
        content:
          "你是一位专业的英语写作老师。请对用户提供的英文文本进行语法、拼写、表达纠正，直接返回纠正后的完整文本，不要添加任何解释。",
      },
      { role: "user", content: text },
    ]);

    res.json({ corrected: content });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 提交作文（AI打分 + 保存）
router.post("/submit", async (req, res) => {
  try {
    const { userId, title = "无标题", content } = req.body;
    if (!content) return res.status(400).json({ error: "content is required" });

    const aiContent = await callAI([
      {
        role: "system",
        content: `你是一位专业的英语写作评分老师。请对用户的作文进行评分，返回严格的JSON格式（不要有多余文字）：
{
  "score": <0-100的整数>,
  "summary": "<整体评价，1-2句>",
  "suggestions": ["<改进建议1>", "<改进建议2>", "<改进建议3>"],
  "optimized": "<优化后的完整作文>"
}`,
      },
      { role: "user", content },
    ]);

    let feedback;
    try {
      // 提取 JSON（防止 AI 在前后加了多余文字）
      const match = aiContent.match(/\{[\s\S]*\}/);
      feedback = JSON.parse(match ? match[0] : aiContent);
    } catch {
      feedback = {
        score: 0,
        summary: aiContent,
        suggestions: [],
        optimized: content,
      };
    }

    const essay = await prisma.essay.create({
      data: {
        userId,
        title,
        content,
        score: feedback.score,
        feedback: JSON.stringify(feedback),
      },
    });

    res.json({ id: essay.id, feedback });
  } catch (e) {
    console.error("[writing/submit error]", e.message);
    res.status(500).json({ error: e.message });
  }
});

// 获取历史作文
router.get("/history/:userId", async (req, res) => {
  try {
    const essays = await prisma.essay.findMany({
      where: { userId: req.params.userId },
      select: {
        id: true,
        title: true,
        score: true,
        createdAt: true,
        content: true,
        feedback: true,
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(essays);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
// AI续写
router.post("/continue", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "text is required" });

    const content = await callAI([
      {
        role: "system",
        content:
          "你是一位专业的英语写作续写老师。请对用户提供的英文文本进行续写，直接返回续写后的完整文本，不要添加任何解释。",
      },
      { role: "user", content: text },
    ]);

    res.json({ continued: content });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
