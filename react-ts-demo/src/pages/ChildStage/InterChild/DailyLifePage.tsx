/**
 * 日常生活页面
 * 日常生活英语
 */

import { useNavigate } from "react-router-dom";
import "../../../styles/ChildStageCss/DailyLifePage.css";

interface DailyTopic {
  id: string;
  title: string;
  description: string;
  icon: string;
  words: number;
}

const DailyLifePage = () => {
  const navigate = useNavigate();

  const topics: DailyTopic[] = [
    {
      id: "1",
      title: "起床洗漱",
      description: "早晨起床相关英语",
      icon: "🌅",
      words: 30,
    },
    {
      id: "2",
      title: "穿衣打扮",
      description: "衣服和配饰英语",
      icon: "👔",
      words: 40,
    },
    {
      id: "3",
      title: "吃饭用餐",
      description: "餐桌礼仪和用餐英语",
      icon: "🍽️",
      words: 50,
    },
    {
      id: "4",
      title: "做家务",
      description: "家务活动相关英语",
      icon: "🧹",
      words: 35,
    },
    {
      id: "5",
      title: "购物逛街",
      description: "购物场景英语对话",
      icon: "🛒",
      words: 45,
    },
    {
      id: "6",
      title: "看病就医",
      description: "医院就诊英语",
      icon: "🏥",
      words: 40,
    },
    {
      id: "7",
      title: "运动健身",
      description: "运动和健身英语",
      icon: "⚽",
      words: 38,
    },
    {
      id: "8",
      title: "睡前准备",
      description: "晚上睡觉前的英语",
      icon: "🌙",
      words: 25,
    },
  ];

  const handleBack = () => {
    navigate("/child-english-home");
  };

  const handleTopicClick = (topic: DailyTopic) => {
    alert(`主题: ${topic.title}\n${topic.description}\n功能开发中...`);
  };

  return (
    <div className="daily-life-page">
      <div className="daily-life-header">
        <button className="back-btn" onClick={handleBack}>
          ← 返回
        </button>
        <h1 className="page-title">🏠 日常生活</h1>
        <div className="header-spacer"></div>
      </div>

      <div className="daily-life-intro">
        <p>学习日常生活中最实用的英语表达！</p>
      </div>

      <div className="daily-life-grid">
        {topics.map((topic) => (
          <div
            key={topic.id}
            className="daily-topic-card"
            onClick={() => handleTopicClick(topic)}
          >
            <div className="daily-topic-icon">{topic.icon}</div>
            <div className="daily-topic-info">
              <h3 className="daily-topic-title">{topic.title}</h3>
              <p className="daily-topic-description">{topic.description}</p>
              <p className="daily-topic-words">📝 {topic.words} 个词汇</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DailyLifePage;
