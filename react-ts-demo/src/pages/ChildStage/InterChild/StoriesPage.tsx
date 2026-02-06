/**
 * 绘本故事页面
 * 通过故事学英语
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../../styles/ChildStageCss/StoriesPage.css";

interface StoryIndex {
  id: string;
  slug: string;
  title: string;
  titleCn: string;
  collection: string;
  collectionName: string;
  difficulty: "easy" | "medium" | "hard";
  stats: {
    totalSections: number;
    totalSentences: number;
    totalQuestions: number;
    totalWords: number;
  };
}

const StoriesPage = () => {
  const navigate = useNavigate();
  const [selectedStory, setSelectedStory] = useState<StoryIndex | null>(null);
  const [stories, setStories] = useState<StoryIndex[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState<"all" | "easy" | "medium" | "hard">("all");

  // 加载故事索引数据
  useEffect(() => {
    fetch("/stories-data/story-index.json")
      .then((res) => res.json())
      .then((data: StoryIndex[]) => {
        setStories(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("加载故事数据失败:", error);
        setLoading(false);
      });
  }, []);

  // 根据难度筛选故事
  const filteredStories = selectedDifficulty === "all"
    ? stories
    : stories.filter(s => s.difficulty === selectedDifficulty);

  const handleBack = () => {
    navigate("/child-english-home");
  };

  const handleStorySelect = (story: StoryIndex) => {
    setSelectedStory(story);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "#4CAF50";
      case "medium":
        return "#FF9800";
      case "hard":
        return "#F44336";
      default:
        return "#999";
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "简单";
      case "medium":
        return "中等";
      case "hard":
        return "困难";
      default:
        return "";
    }
  };

  // 获取随机装饰元素
  const getRandomDecorations = (storyId: string) => {
    // 使用故事ID作为种子，确保每个故事的装饰是固定的
    const seed = storyId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

    const decorations = [
      { emoji: '⭐', className: 'deco-star' },
      { emoji: '✨', className: 'deco-sparkle' },
      { emoji: '🌟', className: 'deco-star-glow' },
      { emoji: '☁️', className: 'deco-cloud' },
      { emoji: '🌸', className: 'deco-flower' },
      { emoji: '🌺', className: 'deco-flower-pink' },
      { emoji: '💖', className: 'deco-heart' },
      { emoji: '🌈', className: 'deco-rainbow' },
      { emoji: '🦋', className: 'deco-butterfly' },
      { emoji: '🐦', className: 'deco-bird' },
      { emoji: '🌙', className: 'deco-moon' },
      { emoji: '☀️', className: 'deco-sun' }
    ];

    // 基于种子选择3个装饰
    const selected = [];
    for (let i = 0; i < 3; i++) {
      const index = (seed + i * 7) % decorations.length;
      selected.push(decorations[index]);
    }

    return selected;
  };

  // 统计各难度的故事数量
  const difficultyStats = {
    all: stories.length,
    easy: stories.filter(s => s.difficulty === 'easy').length,
    medium: stories.filter(s => s.difficulty === 'medium').length,
    hard: stories.filter(s => s.difficulty === 'hard').length
  };

  if (loading) {
    return (
      <div className="stories-page">
        <div className="stories-header">
          <button className="back-btn" onClick={handleBack}>
            ← 返回
          </button>
          <h1 className="page-title">📚 绘本故事</h1>
          <div className="header-spacer"></div>
        </div>
        <div className="loading-container">
          <p>加载故事中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="stories-page">
      {/* 顶部导航 */}
      <div className="stories-header">
        <button className="back-btn" onClick={handleBack}>
          ← 返回
        </button>
        <h1 className="page-title">📚 绘本故事</h1>
        <div className="header-spacer"></div>
      </div>

      {/* 说明 */}
      <div className="stories-intro">
        <p>精选 {stories.length} 个英文绘本故事，在阅读中快乐学习！</p>
      </div>

      {/* 难度筛选 */}
      <div className="difficulty-filter">
        <button
          className={`filter-btn ${selectedDifficulty === "all" ? "active" : ""}`}
          onClick={() => setSelectedDifficulty("all")}
        >
          全部 ({difficultyStats.all})
        </button>
        <button
          className={`filter-btn ${selectedDifficulty === "easy" ? "active" : ""}`}
          onClick={() => setSelectedDifficulty("easy")}
          style={{ borderColor: "#4CAF50" }}
        >
          简单 ({difficultyStats.easy})
        </button>
        <button
          className={`filter-btn ${selectedDifficulty === "medium" ? "active" : ""}`}
          onClick={() => setSelectedDifficulty("medium")}
          style={{ borderColor: "#FF9800" }}
        >
          中等 ({difficultyStats.medium})
        </button>
        <button
          className={`filter-btn ${selectedDifficulty === "hard" ? "active" : ""}`}
          onClick={() => setSelectedDifficulty("hard")}
          style={{ borderColor: "#F44336" }}
        >
          困难 ({difficultyStats.hard})
        </button>
      </div>

      {/* 故事网格 */}
      <div className="stories-grid">
        {filteredStories.map((story) => {
          const decorations = getRandomDecorations(story.id);
          return (
            <div
              key={story.id}
              className="story-card"
              onClick={() => handleStorySelect(story)}
            >
              {/* 随机装饰元素 */}
              <span className={`card-decoration ${decorations[0].className} deco-top-left`}>
                {decorations[0].emoji}
              </span>
              <span className={`card-decoration ${decorations[1].className} deco-top-right`}>
                {decorations[1].emoji}
              </span>
              <span className={`card-decoration ${decorations[2].className} deco-bottom-left`}>
                {decorations[2].emoji}
              </span>

              <div className="story-cover">
                <div className="story-cover-placeholder">
                  <span className="story-icon">📖</span>
                  <span className="collection-badge">{story.collectionName}</span>
                </div>
                <div
                  className="difficulty-badge"
                  style={{ background: getDifficultyColor(story.difficulty) }}
                >
                  {getDifficultyText(story.difficulty)}
                </div>
              </div>
              <div className="story-info">
                <h3 className="story-title">{story.title}</h3>
                <p className="story-title-cn">{story.titleCn}</p>
                <p className="story-collection">{story.collectionName}</p>
                <div className="story-stats">
                  <span>📝 {story.stats.totalSections} 段</span>
                  <span>❓ {story.stats.totalQuestions} 题</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredStories.length === 0 && (
        <div className="no-stories">
          <p>暂无该难度的故事</p>
        </div>
      )}

      {/* 故事详情模态框 */}
      {selectedStory && (
        <div className="story-modal" onClick={() => setSelectedStory(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setSelectedStory(null)}
            >
              ✕
            </button>
            <div className="modal-cover">
              <div className="modal-cover-placeholder">
                <span className="story-icon-large">📖</span>
              </div>
            </div>
            <h2 className="modal-title">{selectedStory.title}</h2>
            <p className="modal-title-cn">{selectedStory.titleCn}</p>
            <p className="modal-collection">来自: {selectedStory.collectionName}</p>
            <div className="modal-description">
              <h3>故事信息</h3>
              <div className="story-details">
                <p>📝 共 {selectedStory.stats.totalSections} 段落</p>
                <p>💬 约 {selectedStory.stats.totalWords} 个单词</p>
                <p>❓ {selectedStory.stats.totalQuestions} 道理解题</p>
              </div>
            </div>
            <div className="modal-stats">
              <span
                className="modal-difficulty"
                style={{
                  background: getDifficultyColor(selectedStory.difficulty),
                }}
              >
                {getDifficultyText(selectedStory.difficulty)}
              </span>
            </div>
            <button
              className="read-btn"
              onClick={() => navigate(`/story-reader/${selectedStory.slug}`, {
                state: { storyId: selectedStory.id }
              })}
            >
              开始阅读
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoriesPage;
