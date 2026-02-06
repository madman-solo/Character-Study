/**
 * 家庭时光页面
 * 家庭生活英语
 */

import { useNavigate } from "react-router-dom";
import "../../../styles/ChildStageCss/FamilyTimePage.css";

interface FamilyTopic {
  id: string;
  title: string;
  description: string;
  icon: string;
  phrases: number;
}

const FamilyTimePage = () => {
  const navigate = useNavigate();

  const topics: FamilyTopic[] = [
    {
      id: "1",
      title: "家庭成员",
      description: "介绍家人的英语表达",
      icon: "👨‍👩‍👧‍👦",
      phrases: 25,
    },
    {
      id: "2",
      title: "亲子游戏",
      description: "和父母一起玩游戏的英语",
      icon: "🎮",
      phrases: 30,
    },
    {
      id: "3",
      title: "做饭烹饪",
      description: "厨房和烹饪相关英语",
      icon: "👨‍🍳",
      phrases: 35,
    },
    {
      id: "4",
      title: "看电视",
      description: "看电视节目的英语对话",
      icon: "📺",
      phrases: 20,
    },
    {
      id: "5",
      title: "户外郊游",
      description: "家庭出游相关英语",
      icon: "🚗",
      phrases: 40,
    },
    {
      id: "6",
      title: "节日庆祝",
      description: "节日和庆祝活动英语",
      icon: "🎉",
      phrases: 45,
    },
    {
      id: "7",
      title: "宠物照顾",
      description: "照顾宠物的英语表达",
      icon: "🐕",
      phrases: 28,
    },
    {
      id: "8",
      title: "睡前故事",
      description: "睡前阅读时光的英语",
      icon: "📚",
      phrases: 22,
    },
  ];

  const handleBack = () => {
    navigate("/child-english-home");
  };

  const handleTopicClick = (topic: FamilyTopic) => {
    alert(`主题: ${topic.title}\n${topic.description}\n功能开发中...`);
  };

  return (
    <div className="family-time-page">
      <div className="family-time-header">
        <button className="back-btn" onClick={handleBack}>
          ← 返回
        </button>
        <h1 className="page-title">👨‍👩‍👧 家庭时光</h1>
        <div className="header-spacer"></div>
      </div>

      <div className="family-time-intro">
        <p>学习家庭生活中的温馨英语表达！</p>
      </div>

      <div className="family-time-grid">
        {topics.map((topic) => (
          <div
            key={topic.id}
            className="family-topic-card"
            onClick={() => handleTopicClick(topic)}
          >
            <div className="family-topic-icon">{topic.icon}</div>
            <div className="family-topic-info">
              <h3 className="family-topic-title">{topic.title}</h3>
              <p className="family-topic-description">{topic.description}</p>
              <p className="family-topic-phrases">💬 {topic.phrases} 个短语</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FamilyTimePage;
