import { useEffect, useRef } from "react";
import axios from "axios";

export function useStudyTimer(userId: string | undefined, token: string | null) {
  const sessionId = useRef<number | null>(null);
  const heartbeatTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPaused = useRef(false);
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const start = async () => {
    if (!userId || !token) return;
    const res = await axios.post("/api/study/start", {}, { headers });
    sessionId.current = res.data.sessionId;
    heartbeatTimer.current = setInterval(async () => {
      if (!sessionId.current) return;
      try {
        await axios.post("/api/study/heartbeat", { sessionId: sessionId.current }, { headers });
      } catch (e: any) {
        // 后端重启或会话失效，重新创建会话
        if (e?.response?.status === 404 || !e?.response) {
          sessionId.current = null;
          try {
            const res = await axios.post("/api/study/start", {}, { headers });
            sessionId.current = res.data.sessionId;
            isPaused.current = false;
          } catch {}
        }
      }
    }, 25000);
  };

  const pause = () => {
    if (!sessionId.current || isPaused.current) return;
    isPaused.current = true;
    axios
      .post("/api/study/pause", { sessionId: sessionId.current }, { headers })
      .catch(() => {});
  };

  const resume = () => {
    if (!sessionId.current || !isPaused.current) return;
    isPaused.current = false;
    axios
      .post("/api/study/resume", { sessionId: sessionId.current }, { headers })
      .catch(() => {});
  };

  const end = () => {
    if (!sessionId.current) return;
    if (heartbeatTimer.current) clearInterval(heartbeatTimer.current);
    axios
      .post("/api/study/end", { sessionId: sessionId.current }, { headers })
      .catch(() => {});
    sessionId.current = null;
  };

  useEffect(() => {
    if (!userId) return;
    start();

    const onVisibilityChange = () => (document.hidden ? pause() : resume());
    const onBlur = () => pause();
    const onFocus = () => resume();
    const onUnload = () => end();

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    window.addEventListener("beforeunload", onUnload);

    return () => {
      end();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("beforeunload", onUnload);
    };
  }, [userId]);
}
