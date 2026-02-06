/**
 * 校园故事页面
 * 校园生活英语
 */

import { useNavigate } from "react-router-dom";
import "../../../styles/ChildStageCss/SchoolStoriesPage.css";

interface SchoolTopic {
  id: string;
  title: string;
  description: string;
  icon: string;
  lessons: number;
}

const SchoolStoriesPage = () => {
  const navigate = useNavigate();

  const topics: SchoolTopic[] = [
    {
      id: "1",
      title: "课堂用语",
      description: "上课时常用的英语表达",
      icon: "📚",
      lessons: 20,
    },
    {
      id: "2",
      title: "课间活动",
      description: "课间休息时的英语对话",
      icon: "⚽",
      lessons: 15,
    },
    {
      id: "3",
      title: "图书馆",
      description: "在图书馆的英语交流",
      icon: "📖",
      lessons: 12,
    },
    {
      id: "4",
      title: "食堂用餐",
      description: "学校食堂相关英语",
      icon: "🍱",
      lessons: 10,
    },
    {
      id: "5",
      title: "体育课",
      description: "体育运动相关英语",
      icon: "🏃",
      lessons: 18,
    },
    {
      id: "6",
      title: "美术课",
      description: "美术创作相关英语",
      icon: "🎨",
      lessons: 14,
    },
    {
      id: "7",
      title: "音乐课",
      description: "音乐学习相关英语",
      icon: "🎵",
      lessons: 16,
    },
    {
      id: "8",
      title: "校园活动",
      description: "学校活动和比赛英语",
      icon: "🎪",
      lessons: 22,
    },
  ];

  const handleBack = () => {
    navigate("/child-english-home");
  };

  const handleTopicClick = (topic: SchoolTopic) => {
    alert(`主题: ${topic.title}\n${topic.description}\n功能开发中...`);
  };

  return (
    <div className="school-stories-page">
      <div className="school-stories-header">
        <button className="back-btn" onClick={handleBack}>
          ← 返回
        </button>
        <h1 className="page-title">🏫 校园故事</h1>
        <div className="header-spacer"></div>
      </div>

      <div className="school-stories-intro">
        <p>学习校园生活中的英语表达，轻松融入学校环境！</p>
      </div>

      <div className="school-stories-grid">
        {topics.map((topic) => (
          <div
            key={topic.id}
            className="school-topic-card"
            onClick={() => handleTopicClick(topic)}
          >
            <div className="school-topic-icon">{topic.icon}</div>
            <div className="school-topic-info">
              <h3 className="school-topic-title">{topic.title}</h3>
              <p className="school-topic-description">{topic.description}</p>
              <p className="school-topic-lessons">📝 {topic.lessons} 课时</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SchoolStoriesPage;
