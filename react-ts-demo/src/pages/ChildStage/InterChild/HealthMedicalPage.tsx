/**
 * 健康医疗页面
 * 健康和医疗相关英语
 */

import { useNavigate } from "react-router-dom";
import "../../../styles/ChildStageCss/HealthMedicalPage.css";

interface HealthTopic {
  id: string;
  title: string;
  description: string;
  icon: string;
  terms: number;
}

const HealthMedicalPage = () => {
  const navigate = useNavigate();

  const topics: HealthTopic[] = [
    {
      id: "1",
      title: "身体部位",
      description: "人体各部位的英文名称",
      icon: "🧍",
      terms: 40,
    },
    {
      id: "2",
      title: "常见疾病",
      description: "日常疾病和症状英语",
      icon: "🤒",
      terms: 35,
    },
    {
      id: "3",
      title: "看病就医",
      description: "医院就诊相关英语",
      icon: "🏥",
      terms: 45,
    },
    {
      id: "4",
      title: "药品用药",
      description: "药物和用药指导英语",
      icon: "💊",
      terms: 30,
    },
    {
      id: "5",
      title: "健康习惯",
      description: "健康生活方式英语",
      icon: "🏃‍♂️",
      terms: 28,
    },
    {
      id: "6",
      title: "急救知识",
      description: "急救和应急处理英语",
      icon: "🚑",
      terms: 32,
    },
    {
      id: "7",
      title: "牙齿保健",
      description: "口腔健康相关英语",
      icon: "🦷",
      terms: 25,
    },
    {
      id: "8",
      title: "营养健康",
      description: "营养和饮食健康英语",
      icon: "🥗",
      terms: 38,
    },
  ];

  const handleBack = () => {
    navigate("/child-english-home");
  };

  const handleTopicClick = (topic: HealthTopic) => {
    alert(`主题: ${topic.title}\n${topic.description}\n功能开发中...`);
  };

  return (
    <div className="health-medical-page">
      <div className="health-medical-header">
        <button className="back-btn" onClick={handleBack}>
          ← 返回
        </button>
        <h1 className="page-title">🏥 健康医疗</h1>
        <div className="header-spacer"></div>
      </div>

      <div className="health-medical-intro">
        <p>学习健康医疗英语，关爱身体健康！</p>
      </div>

      <div className="health-medical-grid">
        {topics.map((topic) => (
          <div
            key={topic.id}
            className="health-topic-card"
            onClick={() => handleTopicClick(topic)}
          >
            <div className="health-topic-icon">{topic.icon}</div>
            <div className="health-topic-info">
              <h3 className="health-topic-title">{topic.title}</h3>
              <p className="health-topic-description">{topic.description}</p>
              <p className="health-topic-terms">📝 {topic.terms} 个术语</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HealthMedicalPage;
