import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

export default function StudyTimePage() {
  const { token } = useAuth();
  const [stats, setStats] = useState({
    totalMinutes: 0,
    todayMinutes: 0,
    avgDailyMinutes: 0,
  });

  useEffect(() => {
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };
    const fetch = () =>
      axios
        .get("/api/study/stats", { headers })
        .then((r) => setStats(r.data))
        .catch(() => {});
    fetch();
    const timer = setInterval(fetch, 30000);
    return () => clearInterval(timer);
  }, [token]);
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
