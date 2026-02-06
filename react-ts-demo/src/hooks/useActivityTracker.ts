/**
 * useActivityTracker Hook
 * 页面活跃度追踪Hook - 监听用户活动和页面可见性
 * 用于准确追踪学习时长，防止挂机刷时长
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export interface ActivityTrackerState {
  isActive: boolean; // 用户是否活跃
  isVisible: boolean; // 页面是否可见
  lastActivityTime: number; // 最后活动时间戳
  pausedDuration: number; // 暂停累计时长（毫秒）
  activeDuration: number; // 实际活跃时长（毫秒）
}

interface UseActivityTrackerOptions {
  inactivityTimeout?: number; // 无活动超时时间（毫秒），默认3分钟
  heartbeatInterval?: number; // 心跳间隔（毫秒），默认30秒
  onPause?: () => void; // 暂停回调
  onResume?: () => void; // 恢复回调
  onHeartbeat?: (state: ActivityTrackerState) => void; // 心跳回调
}

export function useActivityTracker(
  options: UseActivityTrackerOptions = {}
): ActivityTrackerState {
  const {
    inactivityTimeout = 3 * 60 * 1000, // 3分钟
    heartbeatInterval = 30 * 1000, // 30秒
    onPause,
    onResume,
    onHeartbeat,
  } = options;

  // State
  const [isActive, setIsActive] = useState(true);
  const [isVisible, setIsVisible] = useState(!document.hidden);
  const [lastActivityTime, setLastActivityTime] = useState(Date.now());
  const [pausedDuration, setPausedDuration] = useState(0);
  const [activeDuration, setActiveDuration] = useState(0);

  // Refs for tracking
  const sessionStartTime = useRef(Date.now());
  const lastPauseTime = useRef<number | null>(null);
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimer = useRef<NodeJS.Timeout | null>(null);

  // Refs for callbacks to avoid dependency issues
  const onPauseRef = useRef(onPause);
  const onResumeRef = useRef(onResume);
  const onHeartbeatRef = useRef(onHeartbeat);

  // Update refs when callbacks change
  useEffect(() => {
    onPauseRef.current = onPause;
    onResumeRef.current = onResume;
    onHeartbeatRef.current = onHeartbeat;
  }, [onPause, onResume, onHeartbeat]);

  /**
   * Handle user activity
   * 处理用户活动
   */
  const handleActivity = useCallback(() => {
    const now = Date.now();
    setLastActivityTime(now);

    // If was inactive, resume
    setIsActive(prev => {
      if (!prev) {
        // Calculate paused duration
        if (lastPauseTime.current) {
          const pauseDuration = now - lastPauseTime.current;
          setPausedDuration(prevPaused => prevPaused + pauseDuration);
          lastPauseTime.current = null;
        }

        onResumeRef.current?.();
      }
      return true;
    });

    // Reset inactivity timer
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }

    // Set new inactivity timer
    inactivityTimer.current = setTimeout(() => {
      setIsActive(false);
      lastPauseTime.current = Date.now();
      onPauseRef.current?.();
    }, inactivityTimeout);
  }, [inactivityTimeout]);

  /**
   * Handle visibility change
   * 处理页面可见性变化
   */
  const handleVisibilityChange = useCallback(() => {
    const visible = !document.hidden;
    setIsVisible(visible);

    if (visible) {
      // Page became visible - resume
      handleActivity();
    } else {
      // Page became hidden - pause
      setIsActive(false);
      const now = Date.now();
      lastPauseTime.current = now;
      onPauseRef.current?.();

      // Clear timers
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
        inactivityTimer.current = null;
      }
    }
  }, [handleActivity]);

  /**
   * Calculate active duration
   * 计算活跃时长
   */
  const calculateActiveDuration = useCallback(() => {
    const now = Date.now();
    const totalDuration = now - sessionStartTime.current;

    let currentPausedDuration = pausedDuration;

    // If currently paused, add current pause duration
    if (!isActive && lastPauseTime.current) {
      currentPausedDuration += now - lastPauseTime.current;
    }

    const active = totalDuration - currentPausedDuration;
    setActiveDuration(active);

    return active;
  }, [isActive, pausedDuration]);

  /**
   * Heartbeat function
   * 心跳函数
   */
  const heartbeat = useCallback(() => {
    const active = calculateActiveDuration();

    const state: ActivityTrackerState = {
      isActive,
      isVisible,
      lastActivityTime,
      pausedDuration,
      activeDuration: active,
    };

    onHeartbeatRef.current?.(state);
  }, [
    isActive,
    isVisible,
    lastActivityTime,
    pausedDuration,
    calculateActiveDuration,
  ]);

  // Setup event listeners
  useEffect(() => {
    // Activity events
    const events = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart'];

    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    // Visibility change
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Initial activity
    handleActivity();

    // Cleanup
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
    };
  }, [handleActivity, handleVisibilityChange]);

  // Setup heartbeat timer
  useEffect(() => {
    heartbeatTimer.current = setInterval(heartbeat, heartbeatInterval);

    return () => {
      if (heartbeatTimer.current) {
        clearInterval(heartbeatTimer.current);
      }
    };
  }, [heartbeat, heartbeatInterval]);

  // Update active duration periodically
  useEffect(() => {
    const updateInterval = setInterval(() => {
      calculateActiveDuration();
    }, 1000); // Update every second

    return () => clearInterval(updateInterval);
  }, [calculateActiveDuration]);

  return {
    isActive,
    isVisible,
    lastActivityTime,
    pausedDuration,
    activeDuration,
  };
}

export default useActivityTracker;
