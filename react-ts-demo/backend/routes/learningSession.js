/**
 * Learning Session Management API
 * 学习会话管理API - 管理学习会话的生命周期和心跳检测
 */

const express = require('express');
const router = express.Router();

// In-memory session storage (consider using Redis for production)
// 内存会话存储（生产环境建议使用Redis）
const activeSessions = new Map();

// Session timeout: 5 minutes
const SESSION_TIMEOUT = 5 * 60 * 1000;

// Cleanup interval: check every minute
const CLEANUP_INTERVAL = 60 * 1000;

/**
 * Session data structure
 * 会话数据结构
 */
class LearningSession {
  constructor(userId, sessionType = 'learning') {
    this.sessionId = `${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.userId = userId;
    this.sessionType = sessionType;
    this.startTime = Date.now();
    this.lastHeartbeat = Date.now();
    this.activeTime = 0;
    this.pausedTime = 0;
    this.isActive = true;
  }

  updateHeartbeat() {
    this.lastHeartbeat = Date.now();
  }

  isExpired() {
    return Date.now() - this.lastHeartbeat > SESSION_TIMEOUT;
  }

  calculateDuration() {
    return Date.now() - this.startTime;
  }

  calculateValidTime(activeTime, pausedTime) {
    const totalTime = this.calculateDuration();
    this.activeTime = activeTime || totalTime;
    this.pausedTime = pausedTime || 0;
    return Math.max(0, this.activeTime - this.pausedTime);
  }
}

/**
 * Cleanup expired sessions
 * 清理过期会话
 */
function cleanupExpiredSessions() {
  const now = Date.now();
  let cleanedCount = 0;

  for (const [sessionId, session] of activeSessions.entries()) {
    if (session.isExpired()) {
      activeSessions.delete(sessionId);
      cleanedCount++;
      console.log(`Cleaned up expired session: ${sessionId}`);
    }
  }

  if (cleanedCount > 0) {
    console.log(`Cleaned up ${cleanedCount} expired sessions. Active sessions: ${activeSessions.size}`);
  }
}

// Start cleanup timer
setInterval(cleanupExpiredSessions, CLEANUP_INTERVAL);

/**
 * POST /api/learning-session/start
 * Start a new learning session
 * 开始新的学习会话
 */
router.post('/start', (req, res) => {
  try {
    const { userId, sessionType } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    // Create new session
    const session = new LearningSession(userId, sessionType);
    activeSessions.set(session.sessionId, session);

    console.log(`Started session ${session.sessionId} for user ${userId}. Active sessions: ${activeSessions.size}`);

    res.json({
      success: true,
      sessionId: session.sessionId,
      startTime: session.startTime,
      message: 'Learning session started successfully'
    });
  } catch (error) {
    console.error('Error starting learning session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start learning session'
    });
  }
});

/**
 * POST /api/learning-session/heartbeat
 * Send heartbeat to keep session alive
 * 发送心跳保持会话活跃
 */
router.post('/heartbeat', (req, res) => {
  try {
    const { sessionId, timestamp } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required'
      });
    }

    const session = activeSessions.get(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found or expired',
        isValid: false
      });
    }

    // Update heartbeat
    session.updateHeartbeat();

    res.json({
      success: true,
      isValid: true,
      serverTime: Date.now(),
      sessionDuration: session.calculateDuration(),
      message: 'Heartbeat received'
    });
  } catch (error) {
    console.error('Error processing heartbeat:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process heartbeat'
    });
  }
});

/**
 * POST /api/learning-session/end
 * End learning session and calculate valid time
 * 结束学习会话并计算有效时长
 */
router.post('/end', (req, res) => {
  try {
    const { sessionId, activeTime, pausedTime } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required'
      });
    }

    const session = activeSessions.get(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found or expired'
      });
    }

    // Calculate valid time
    const totalTime = session.calculateDuration();
    const validTime = session.calculateValidTime(activeTime, pausedTime);
    const validTimeMinutes = Math.floor(validTime / 1000 / 60);

    // Remove session from active sessions
    activeSessions.delete(sessionId);

    console.log(`Ended session ${sessionId}. Total: ${Math.floor(totalTime / 1000 / 60)}min, Valid: ${validTimeMinutes}min. Active sessions: ${activeSessions.size}`);

    // Calculate points based on valid time (optional)
    const points = Math.floor(validTimeMinutes / 10) * 20; // 20 points per 10 minutes

    res.json({
      success: true,
      totalTime: Math.floor(totalTime / 1000 / 60), // minutes
      validTime: validTimeMinutes, // minutes
      activeTime: Math.floor((activeTime || totalTime) / 1000 / 60), // minutes
      pausedTime: Math.floor((pausedTime || 0) / 1000 / 60), // minutes
      points,
      message: 'Learning session ended successfully'
    });
  } catch (error) {
    console.error('Error ending learning session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to end learning session'
    });
  }
});

/**
 * GET /api/learning-session/active/:userId
 * Get active sessions for a user
 * 获取用户的活跃会话
 */
router.get('/active/:userId', (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    const userSessions = [];
    for (const [sessionId, session] of activeSessions.entries()) {
      if (session.userId === userId && !session.isExpired()) {
        userSessions.push({
          sessionId: session.sessionId,
          sessionType: session.sessionType,
          startTime: session.startTime,
          duration: session.calculateDuration(),
          lastHeartbeat: session.lastHeartbeat
        });
      }
    }

    res.json({
      success: true,
      sessions: userSessions,
      count: userSessions.length
    });
  } catch (error) {
    console.error('Error getting active sessions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get active sessions'
    });
  }
});

/**
 * GET /api/learning-session/stats
 * Get session statistics (for debugging)
 * 获取会话统计信息（用于调试）
 */
router.get('/stats', (req, res) => {
  try {
    const stats = {
      totalActiveSessions: activeSessions.size,
      sessions: []
    };

    for (const [sessionId, session] of activeSessions.entries()) {
      stats.sessions.push({
        sessionId,
        userId: session.userId,
        duration: Math.floor(session.calculateDuration() / 1000 / 60), // minutes
        lastHeartbeat: new Date(session.lastHeartbeat).toISOString(),
        isExpired: session.isExpired()
      });
    }

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error getting session stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get session stats'
    });
  }
});

module.exports = router;
