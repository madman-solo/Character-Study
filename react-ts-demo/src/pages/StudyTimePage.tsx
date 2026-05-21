import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../api/index";
function getLocalStats(userId: string) {
  try {
    const raw = localStorage.getItem(`child_learning_${userId}`);
    if (!raw) return null;
    const data = JSON.parse(raw);
    const daily: Record<string, number> = data.dailyStudyTime || {};
    const today = new Date().toISOString().slice(0, 10);
    const todayMinutes = daily[today] || 0;
    const days = Object.keys(daily).length || 1;
    const totalMinutes: number = data.totalStudyTime || 0;
    return {
      totalMinutes,
      todayMinutes,
      avgDailyMinutes: Math.round(totalMinutes / days),
    };
  } catch {
    return null;
  }
}

export default function StudyTimePage() {
  const { token, user } = useAuth();
  const [stats, setStats] = useState({
    totalMinutes: 0,
    todayMinutes: 0,
    avgDailyMinutes: 0,
  });

  useEffect(() => {
    if (!token) {
      // 游客：从 localStorage 读取少儿英语学习数据
      const userId = (user as any)?.id || "guest";
      const local = getLocalStats(userId);
      if (local) setStats(local);
      return;
    }
    const headers = { Authorization: `Bearer ${token}` };
    const doFetch = () =>
      api
        .get("/api/study/stats", { headers })
        .then((r) => setStats(r.data))
        .catch(() => {});

    doFetch();
    const timer = setInterval(doFetch, 30000);
    return () => clearInterval(timer);
  }, [token, user]);
  const fmt = (m: number) => `${Math.floor(m / 60)}h ${m % 60}min`;

  return (
    <div style={{ padding: "2rem", maxWidth: 480, margin: "0 auto" }}>
      <h2>学习时长</h2>
      <div style={{ display: "grid", gap: "1rem", marginTop: "1.5rem" }}>
        {[
          { label: "今日学习", value: fmt(stats.todayMinutes) },
          { label: "累计学习", value: fmt(stats.totalMinutes) },
          { label: "日均学习", value: fmt(stats.avgDailyMinutes) },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              background: "#f5f5f5",
              borderRadius: 12,
              padding: "1rem 1.5rem",
            }}
          >
            <div style={{ fontSize: 13, color: "#888" }}>{item.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, marginTop: 4 }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
