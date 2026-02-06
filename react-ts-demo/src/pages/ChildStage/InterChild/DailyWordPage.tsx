/**
 * 每日一词页面
 * 集成ECDICT数据库，展示每日推荐单词
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { useChildLearning } from "../../../hooks/useChildLearning";
import { useChildRewards, POINT_RULES } from "../../../hooks/useChildRewards";
import { useChildSound } from "../../../hooks/useChildSound";
import WordLearningCard from "../components/WordLearningCard";
import type { Word } from "../../../hooks/useChildLearning";
import "../../../styles/ChildStageCss/DailyWordPage.css";

const DailyWordPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id || "guest";

  const { learningData, addMasteredWord, addWeakWord } =
    useChildLearning(userId);

  const { addPoints } = useChildRewards(userId);
  const { playSound, speakWord } = useChildSound();

  const [dailyWord, setDailyWord] = useState<Word | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 获取每日一词
  useEffect(() => {
    fetchDailyWord();
  }, []);

  const fetchDailyWord = async () => {
    try {
      setLoading(true);
      setError(null);

      // 从后端获取每日推荐单词
      const response = await fetch(
        "http://localhost:3001/api/dictionary/daily-word",
      );

      if (!response.ok) {
        throw new Error("获取每日一词失败");
      }

      const data = await response.json();

      // 转换为Word格式
      const word: Word = {
        id: data.word,
        word: data.word,
        phonetic: data.phonetic || "",
        translation: data.translation || "",
        example: data.example || "",
        mastered: false,
        reviewCount: 0,
      };

      setDailyWord(word);
    } catch (err) {
      console.error("Error fetching daily word:", err);
      setError("加载失败，请稍后重试");

      // 使用备用单词
      setDailyWord({
        id: "hello",
        word: "hello",
        phonetic: "/həˈləʊ/",
        translation: "你好；喂",
        example: "Hello, how are you today?",
        mastered: false,
        reviewCount: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMastered = (word: Word) => {
    addMasteredWord(word);
    addPoints(POINT_RULES.MASTER_WORD, "掌握单词");
    playSound("correct-answer");
  };

  const handleWeak = (word: Word) => {
    addWeakWord(word);
    playSound("interaction");
  };

  const handleSpeak = (word: string) => {
    speakWord(word);
  };

  const handleBack = () => {
    navigate("/child-english-home");
  };

  const handleRefresh = () => {
    fetchDailyWord();
  };

  if (loading) {
    return (
      <div className="daily-word-page">
        <div className="daily-word-loading">
          <div className="loading-spinner"></div>
          <p>加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="daily-word-page">
      {/* 顶部导航 */}
      <div className="daily-word-header">
        <button className="back-btn" onClick={handleBack}>
          ← 返回
        </button>
        <h1 className="page-title">📖 每日一词</h1>
        <button className="refresh-btn" onClick={handleRefresh}>
          🔄 换一个
        </button>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="error-banner">
          <span>⚠️ {error}</span>
        </div>
      )}

      {/* 每日一词卡片 */}
      <div className="daily-word-content">
        {dailyWord && (
          <div className="daily-word-card-container">
            <div className="daily-word-badge">
              <span className="badge-icon">⭐</span>
              <span className="badge-text">今日推荐</span>
            </div>

            <WordLearningCard
              word={dailyWord}
              onMastered={handleMastered}
              onWeak={handleWeak}
              onSpeak={handleSpeak}
              animationsEnabled={true}
            />

            {/* 学习提示 */}
            <div className="learning-tips">
              <h3 className="tips-title">💡 学习小贴士</h3>
              <ul className="tips-list">
                <li>点击 🔊 按钮听发音</li>
                <li>点击卡片翻转查看释义</li>
                <li>掌握后点击 ✨ 掌握按钮</li>
                <li>不熟悉点击 😕 薄弱按钮</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* 学习统计 */}
      {learningData && (
        <div className="learning-stats">
          <div className="stat-card">
            <div className="stat-icon">📚</div>
            <div className="stat-info">
              <div className="stat-value">
                {learningData.masteredWords.length}
              </div>
              <div className="stat-label">已掌握</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💪</div>
            <div className="stat-info">
              <div className="stat-value">{learningData.weakWords.length}</div>
              <div className="stat-label">需加强</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🔥</div>
            <div className="stat-info">
              <div className="stat-value">{learningData.consecutiveDays}</div>
              <div className="stat-label">连续天数</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyWordPage;
