/**
 * 日常用语页面
 * 常用英语短语
 */

import { useNavigate } from "react-router-dom";
import "../../../styles/ChildStageCss/DailyPhrasesPage.css";

interface PhraseCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  phrases: number;
}

const DailyPhrasesPage = () => {
  const navigate = useNavigate();

  const categories: PhraseCategory[] = [
    {
      id: "1",
      title: "问候语",
      description: "日常打招呼用语",
      icon: "👋",
      phrases: 20,
    },
    {
      id: "2",
      title: "感谢道歉",
      description: "表达感谢和道歉",
      icon: "🙏",
      phrases: 18,
    },
    {
      id: "3",
      title: "请求帮助",
      description: "寻求帮助的表达",
      icon: "🤝",
      phrases: 22,
    },
    {
      id: "4",
      title: "表达情感",
      description: "情绪和感受的表达",
      icon: "😊",
      phrases: 25,
    },
    {
      id: "5",
      title: "询问信息",
      description: "提问和询问的方式",
      icon: "❓",
      phrases: 30,
    },
    {
      id: "6",
      title: "表达意见",
      description: "表达看法和观点",
      icon: "💭",
      phrases: 28,
    },
    {
      id: "7",
      title: "邀请建议",
      description: "邀请和提建议",
      icon: "📨",
      phrases: 24,
    },
    {
      id: "8",
      title: "告别用语",
      description: "道别和祝福语",
      icon: "👋",
      phrases: 16,
    },
  ];

  const handleBack = () => {
    navigate("/child-english-home");
  };

  const handleCategoryClick = (category: PhraseCategory) => {
    alert(`分类: ${category.title}\n${category.description}\n功能开发中...`);
  };

  return (
    <div className="daily-phrases-page">
      <div className="daily-phrases-header">
        <button className="back-btn" onClick={handleBack}>
          ← 返回
        </button>
        <h1 className="page-title">💬 日常用语</h1>
        <div className="header-spacer"></div>
      </div>

      <div className="daily-phrases-intro">
        <p>掌握最实用的日常英语短语，轻松交流！</p>
      </div>

      <div className="daily-phrases-grid">
        {categories.map((category) => (
          <div
            key={category.id}
            className="phrase-category-card"
            onClick={() => handleCategoryClick(category)}
          >
            <div className="phrase-category-icon">{category.icon}</div>
            <div className="phrase-category-info">
              <h3 className="phrase-category-title">{category.title}</h3>
              <p className="phrase-category-description">
                {category.description}
              </p>
              <p className="phrase-category-count">
                💬 {category.phrases} 个短语
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DailyPhrasesPage;
