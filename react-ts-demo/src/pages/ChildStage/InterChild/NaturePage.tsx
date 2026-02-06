/**
 * 大自然页面
 * 自然世界英语
 */

import { useNavigate } from "react-router-dom";
import "../../../styles/ChildStageCss/NaturePage.css";

interface NatureTopic {
  id: string;
  title: string;
  description: string;
  icon: string;
  items: number;
}

const NaturePage = () => {
  const navigate = useNavigate();

  const topics: NatureTopic[] = [
    {
      id: "1",
      title: "动物世界",
      description: "各种动物的英文名称",
      icon: "🦁",
      items: 50,
    },
    {
      id: "2",
      title: "植物花草",
      description: "植物和花卉的英语",
      icon: "🌸",
      items: 40,
    },
    {
      id: "3",
      title: "天气气候",
      description: "天气现象相关英语",
      icon: "🌤️",
      items: 30,
    },
    {
      id: "4",
      title: "四季变化",
      description: "春夏秋冬的英语表达",
      icon: "🍂",
      items: 25,
    },
    {
      id: "5",
      title: "山川河流",
      description: "地理景观英语",
      icon: "⛰️",
      items: 35,
    },
    {
      id: "6",
      title: "海洋世界",
      description: "海洋生物和现象英语",
      icon: "🌊",
      items: 45,
    },
    {
      id: "7",
      title: "昆虫世界",
      description: "各种昆虫的英文",
      icon: "🦋",
      items: 28,
    },
    {
      id: "8",
      title: "宇宙星空",
      description: "天文和星空英语",
      icon: "🌟",
      items: 32,
    },
  ];

  const handleBack = () => {
    navigate("/child-english-home");
  };

  const handleTopicClick = (topic: NatureTopic) => {
    alert(`主题: ${topic.title}\n${topic.description}\n功能开发中...`);
  };

  return (
    <div className="nature-page">
      <div className="nature-header">
        <button className="back-btn" onClick={handleBack}>
          ← 返回
        </button>
        <h1 className="page-title">🌿 大自然</h1>
        <div className="header-spacer"></div>
      </div>

      <div className="nature-intro">
        <p>探索大自然，学习自然世界的英语表达！</p>
      </div>

      <div className="nature-grid">
        {topics.map((topic) => (
          <div
            key={topic.id}
            className="nature-topic-card"
            onClick={() => handleTopicClick(topic)}
          >
            <div className="nature-topic-icon">{topic.icon}</div>
            <div className="nature-topic-info">
              <h3 className="nature-topic-title">{topic.title}</h3>
              <p className="nature-topic-description">{topic.description}</p>
              <p className="nature-topic-items">📝 {topic.items} 个词汇</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NaturePage;
