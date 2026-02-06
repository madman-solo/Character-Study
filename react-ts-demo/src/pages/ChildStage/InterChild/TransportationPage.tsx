/**
 * 交通出行页面
 * 交通工具和出行英语
 */

import { useNavigate } from "react-router-dom";
import "../../../styles/ChildStageCss/TransportationPage.css";

interface TransportTopic {
  id: string;
  title: string;
  description: string;
  icon: string;
  vocabulary: number;
}

const TransportationPage = () => {
  const navigate = useNavigate();

  const topics: TransportTopic[] = [
    {
      id: "1",
      title: "汽车出行",
      description: "汽车和驾驶相关英语",
      icon: "🚗",
      vocabulary: 35,
    },
    {
      id: "2",
      title: "公共交通",
      description: "公交地铁等公共交通英语",
      icon: "🚌",
      vocabulary: 40,
    },
    {
      id: "3",
      title: "飞机旅行",
      description: "机场和飞行相关英语",
      icon: "✈️",
      vocabulary: 45,
    },
    {
      id: "4",
      title: "火车高铁",
      description: "火车站和乘车英语",
      icon: "🚄",
      vocabulary: 30,
    },
    {
      id: "5",
      title: "自行车",
      description: "骑行相关英语",
      icon: "🚲",
      vocabulary: 20,
    },
    {
      id: "6",
      title: "船舶航海",
      description: "轮船和航海英语",
      icon: "🚢",
      vocabulary: 28,
    },
    {
      id: "7",
      title: "道路标识",
      description: "交通标志和路牌英语",
      icon: "🚦",
      vocabulary: 32,
    },
    {
      id: "8",
      title: "问路指路",
      description: "问路和指路的英语表达",
      icon: "🗺️",
      vocabulary: 38,
    },
  ];

  const handleBack = () => {
    navigate("/child-english-home");
  };

  const handleTopicClick = (topic: TransportTopic) => {
    alert(`主题: ${topic.title}\n${topic.description}\n功能开发中...`);
  };

  return (
    <div className="transportation-page">
      <div className="transportation-header">
        <button className="back-btn" onClick={handleBack}>
          ← 返回
        </button>
        <h1 className="page-title">🚗 交通出行</h1>
        <div className="header-spacer"></div>
      </div>

      <div className="transportation-intro">
        <p>学习交通出行英语，畅游世界无障碍！</p>
      </div>

      <div className="transportation-grid">
        {topics.map((topic) => (
          <div
            key={topic.id}
            className="transport-topic-card"
            onClick={() => handleTopicClick(topic)}
          >
            <div className="transport-topic-icon">{topic.icon}</div>
            <div className="transport-topic-info">
              <h3 className="transport-topic-title">{topic.title}</h3>
              <p className="transport-topic-description">{topic.description}</p>
              <p className="transport-topic-vocabulary">
                📝 {topic.vocabulary} 个词汇
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransportationPage;
