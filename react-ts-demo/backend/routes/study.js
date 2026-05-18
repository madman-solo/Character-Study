const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { authMiddleware } = require("../middleware/auth");

const HEARTBEAT_TIMEOUT = 60; // 超过60秒无心跳，判定挂机

// 开始学习会话
router.post("/start", authMiddleware, async (req, res) => {
  const userId = req.user.id;
  // 结束该用户所有未结束的旧会话
  await prisma.studySession.updateMany({
    where: { userId, status: { in: ["active", "paused"] } },
    data: { status: "ended", endedAt: new Date() },
  });
  const session = await prisma.studySession.create({ data: { userId } });
  res.json({ sessionId: session.id });
});

// 心跳
router.post("/heartbeat", authMiddleware, async (req, res) => {
  const { sessionId } = req.body;
  const session = await prisma.studySession.findFirst({
    where: { id: sessionId, userId: req.user.id, status: "active" },
  });
  if (!session) return res.status(404).json({ error: "session not found" });
  // 更新 updatedAt（用 touchedAt 字段记录最后心跳时间）
  await prisma.studySession.update({
    where: { id: sessionId },
    data: { pausedAt: null }, // 用 pausedAt=null 表示活跃
  });
  res.json({ ok: true });
});

// 暂停
router.post("/pause", authMiddleware, async (req, res) => {
  const { sessionId } = req.body;
  await prisma.studySession.updateMany({
    where: { id: sessionId, userId: req.user.id, status: "active" },
    data: { status: "paused", pausedAt: new Date() },
  });
  res.json({ ok: true });
});

// 恢复
router.post("/resume", authMiddleware, async (req, res) => {
  const { sessionId } = req.body;
  const session = await prisma.studySession.findFirst({
    where: { id: sessionId, userId: req.user.id, status: "paused" },
  });
  if (!session) return res.status(404).json({ error: "not found" });
  const pauseDuration = Math.floor(
    (Date.now() - new Date(session.pausedAt).getTime()) / 1000,
  );
  await prisma.studySession.update({
    where: { id: sessionId },
    data: {
      status: "active",
      pausedAt: null,
      totalPause: { increment: pauseDuration },
    },
  });
  res.json({ ok: true });
});

// 结束并计算真实时长
router.post("/end", authMiddleware, async (req, res) => {
  const { sessionId } = req.body;
  const session = await prisma.studySession.findFirst({
    where: { id: sessionId, userId: req.user.id },
  });
  if (!session) return res.status(404).json({ error: "not found" });
  const now = new Date();
  const totalSeconds = Math.floor((now - new Date(session.startedAt)) / 1000);
  const realSeconds = Math.max(0, totalSeconds - session.totalPause);
  await prisma.studySession.update({
    where: { id: sessionId },
    data: { status: "ended", endedAt: now, realSeconds },
  });
  // 同步到 UserLearningData（分钟）
  const realMinutes = Math.floor(realSeconds / 60);
  if (realMinutes > 0) {
    const today = now.toISOString().slice(0, 10);
    const ld = await prisma.userLearningData.findUnique({
      where: { userId: req.user.id },
    });
    if (ld) {
      const daily = JSON.parse(ld.dailyStudyTime || "{}");
      daily[today] = (daily[today] || 0) + realMinutes;
      await prisma.userLearningData.update({
        where: { userId: req.user.id },
        data: {
          totalStudyTime: { increment: realMinutes },
          dailyStudyTime: JSON.stringify(daily),
        },
      });
    }
  }
  res.json({ realSeconds });
});

// 查询今日及总学习时长
// router.get("/stats", authMiddleware, async (req, res) => {
//   const ld = await prisma.userLearningData.findUnique({
//     where: { userId: req.user.id },
//   });
//   const activeSession = await prisma.studySession.findFirst({
//     where: { userId: req.user.id, status: "active" },
//   });
//   let liveSeconds = 0;
//   if (activeSession) {
//     liveSeconds = Math.max(
//       0,
//       Math.floor(
//         (Date.now() - new Date(activeSession.startedAt).getTime()) / 1000,
//       ) - activeSession.totalPause,
//     );
//   }
//   const liveMinutes = Math.floor(liveSeconds / 60);

//   // 返回时加上 liveMinutes：
//   res.json({
//     totalMinutes: (ld?.totalStudyTime || 0) + liveMinutes,
//     todayMinutes: todayMinutes + liveMinutes,
//     avgDailyMinutes: avgDailyMinutes,
//   });
//   if (!ld)
//     return res.json({ totalMinutes: 0, todayMinutes: 0, avgDailyMinutes: 0 });
//   const daily = JSON.parse(ld.dailyStudyTime || "{}");
//   const today = new Date().toISOString().slice(0, 10);
//   const todayMinutes = daily[today] || 0;
//   const days = Object.keys(daily).length || 1;
//   const avgDailyMinutes = Math.round(ld.totalStudyTime / days);
//   res.json({ totalMinutes: ld.totalStudyTime, todayMinutes, avgDailyMinutes });
// });
router.get("/stats", authMiddleware, async (req, res) => {
  const ld = await prisma.userLearningData.findUnique({
    where: { userId: req.user.id },
  });
  const activeSession = await prisma.studySession.findFirst({
    where: { userId: req.user.id, status: "active" },
  });
  let liveMinutes = 0;
  if (activeSession) {
    const liveSeconds = Math.max(
      0,
      Math.floor(
        (Date.now() - new Date(activeSession.startedAt).getTime()) / 1000,
      ) - activeSession.totalPause,
    );
    liveMinutes = Math.floor(liveSeconds / 60);
  }
  if (!ld)
    return res.json({
      totalMinutes: liveMinutes,
      todayMinutes: liveMinutes,
      avgDailyMinutes: 0,
    });
  const daily = JSON.parse(ld.dailyStudyTime || "{}");
  const today = new Date().toISOString().slice(0, 10);
  const todayMinutes = (daily[today] || 0) + liveMinutes;
  const days = Object.keys(daily).length || 1;
  const avgDailyMinutes = Math.round(ld.totalStudyTime / days);
  res.json({
    totalMinutes: ld.totalStudyTime + liveMinutes,
    todayMinutes,
    avgDailyMinutes,
  });
});

module.exports = router;
