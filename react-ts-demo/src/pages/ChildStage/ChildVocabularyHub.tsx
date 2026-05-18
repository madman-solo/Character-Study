/**
 * ChildVocabularyHub Page
 * 7-12岁单词学习中心 - 完整学习中心布局
 */
import axios from "axios";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useChildLearning } from "../../hooks/useChildLearning";
import { useChildRewards } from "../../hooks/useChildRewards";
import ChildCarousel from "./components/ChildCarousel";
import LearningCharts from "./components/LearningCharts";
import "../../styles/ChildStageCss/ChildVocabularyHub.css";

const ChildVocabularyHub = () => {
  const navigate = useNavigate();
  const { user, skipLogin } = useAuth();
  const [timeRange, setTimeRange] = useState<"7days" | "30days" | "90days">(
    "7days",
  );
  const userId = user?.id || "guest";

  const { learningData } = useChildLearning(userId);
  const { rewardData } = useChildRewards(userId);

  const [showCharts, setShowCharts] = useState(false);
  const [studyStats, setStudyStats] = useState({ totalMinutes: 0 });
  useEffect(() => {
    if (user?.id) {
      axios
        .get("/api/study/stats")
        .then((r) => setStudyStats(r.data))
        .catch(() => {});
    }
  }, [user?.id]);
  useEffect(() => {
    if (!user) {
      skipLogin();
    }
  }, [user, skipLogin]);

  const banners = [
    {
      id: "1",
      image:
        "https://via.placeholder.com/1200x400/FFE66D/333333?text=欢迎来到单词学习中心",
      title: "欢迎来到单词学习中心",
    },
    {
      id: "2",
      image:
        "https://via.placeholder.com/1200x400/4ECDC4/FFFFFF?text=每天学习新单词",
      title: "每天学习新单词",
    },
    {
      id: "3",
      image:
        "https://via.placeholder.com/1200x400/FF6B6B/FFFFFF?text=复习巩固记忆",
      title: "复习巩固记忆",
    },
  ];

  return (
    <div className="child-vocab-hub-page">
      {/* Navigation Bar */}
      <div className="child-vocab-hub-navbar">
        <button className="nav-back-btn" onClick={() => navigate(-1)}>
          ← 返回
        </button>
        <h1 className="nav-title">单词学习中心</h1>
        <div className="nav-user-info">
          <span className="user-points">⭐ {rewardData?.totalPoints || 0}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="child-vocab-hub-content">
        {/* Banner Carousel */}
        <div className="banner-section">
          <ChildCarousel
            items={banners}
            autoPlay={true}
            interval={3000}
            height="300px"
          />
        </div>

        {/* Learning Progress */}
        <div className="progress-section">
          <h2 className="section-title">
            <img
              src="/src/assets/iconfont/child/理财统计表.svg"
              alt=""
              aria-hidden="true"
              width={36}
              height={36}
            />
            学习进度
          </h2>
          <div className="progress-cards">
            <div className="progress-card">
              <div className="progress-icon">
                <img
                  src="/src/assets/iconfont/child/掌握.svg"
                  alt=""
                  aria-hidden="true"
                  width={36}
                  height={36}
                />
              </div>
              <div className="progress-label">已掌握单词</div>
              <div className="progress-value">
                {learningData?.masteredWords.length || 0}
              </div>
            </div>
            <div className="progress-card">
              <div className="progress-icon">
                <img
                  src="/src/assets/iconfont/child/薄弱.svg"
                  alt=""
                  aria-hidden="true"
                  width={36}
                  height={36}
                />{" "}
              </div>
              <div className="progress-label">薄弱单词</div>
              <div className="progress-value">
                {learningData?.weakWords.length || 0}
              </div>
            </div>
            <div className="progress-card">
              <div className="progress-icon">
                {" "}
                <img
                  src="/src/assets/iconfont/child/火花.svg"
                  alt=""
                  aria-hidden="true"
                  width={36}
                  height={36}
                />
              </div>
              <div className="progress-label">连续打卡</div>
              <div className="progress-value">
                {learningData?.consecutiveDays || 0}天
              </div>
            </div>
            <div className="progress-card">
              <div className="progress-icon">
                <img
                  src="/src/assets/iconfont/闹钟.svg"
                  alt=""
                  aria-hidden="true"
                  width={36}
                  height={36}
                />
              </div>
              <div className="progress-label">学习时长</div>
              <div className="progress-value">
                {studyStats.totalMinutes}分钟
              </div>
            </div>
          </div>
        </div>

        {/* Learning Charts Section */}
        <div className="charts-section">
          <button
            className="charts-toggle-btn"
            onClick={() => setShowCharts((v) => !v)}
          >
            {showCharts ? "▲ 收起学习数据统计" : "▼ 点击查看学习数据统计"}
          </button>
          {showCharts && learningData && (
            <LearningCharts
              learningData={learningData}
              wordProgressList={[]}
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChildVocabularyHub;
