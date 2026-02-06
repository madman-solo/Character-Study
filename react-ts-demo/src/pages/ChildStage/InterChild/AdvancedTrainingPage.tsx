/**
 * 进阶训练页面
 * 高级英语训练
 */

import { useNavigate } from "react-router-dom";
import "../../../styles/ChildStageCss/AdvancedTrainingPage.css";

interface Training {
  id: string;
  title: string;
  description: string;
  icon: string;
  difficulty: string;
  duration: string;
}

const AdvancedTrainingPage = () => {
  const navigate = useNavigate();

  const trainings: Training[] = [
    {
      id: "1",
      title: "快速阅读训练",
      description: "提升阅读速度和理解效率",
      icon: "⚡",
      difficulty: "中级",
      duration: "20分钟/天",
    },
    {
      id: "2",
      title: "听力精听训练",
      description: "精细化听力理解训练",
      icon: "🎧",
      difficulty: "中级",
      duration: "15分钟/天",
    },
    {
      id: "3",
      title: "口语流利度训练",
      description: "提高口语表达流畅度",
      icon: "🗣️",
      difficulty: "高级",
      duration: "25分钟/天",
    },
    {
      id: "4",
      title: "词汇扩展训练",
      description: "系统扩充词汇量",
      icon: "📚",
      difficulty: "中级",
      duration: "15分钟/天",
    },
    {
      id: "5",
      title: "语法强化训练",
      description: "深入理解复杂语法结构",
      icon: "📖",
      difficulty: "高级",
      duration: "30分钟/天",
    },
    {
      id: "6",
      title: "写作提升训练",
      description: "提高英语写作水平",
      icon: "✍️",
      difficulty: "高级",
      duration: "30分钟/天",
    },
    {
      id: "7",
      title: "发音纠正训练",
      description: "纠正发音，说标准英语",
      icon: "🎤",
      difficulty: "中级",
      duration: "20分钟/天",
    },
    {
      id: "8",
      title: "综合能力测试",
      description: "全面评估英语水平",
      icon: "📊",
      difficulty: "高级",
      duration: "45分钟",
    },
  ];

  const handleBack = () => {
    navigate("/child-english-home");
  };

  const handleTrainingClick = (training: Training) => {
    alert(`训练: ${training.title}\n${training.description}\n功能开发中...`);
  };

  return (
    <div className="advanced-training-page">
      {/* 顶部导航 */}
      <div className="advanced-training-header">
        <button className="back-btn" onClick={handleBack}>
          ← 返回
        </button>
        <h1 className="page-title">💪 进阶训练</h1>
        <div className="header-spacer"></div>
      </div>

      {/* 说明 */}
      <div className="advanced-training-intro">
        <p>专业训练体系，全面提升英语综合能力！</p>
      </div>

      {/* 训练网格 */}
      <div className="advanced-training-grid">
        {trainings.map((training) => (
          <div
            key={training.id}
            className="training-card"
            onClick={() => handleTrainingClick(training)}
          >
            <div className="training-icon">{training.icon}</div>
            <div className="training-info">
              <h3 className="training-title">{training.title}</h3>
              <p className="training-description">{training.description}</p>
              <div className="training-meta">
                <span className="training-difficulty">
                  {training.difficulty}
                </span>
                <span>⏱️ {training.duration}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdvancedTrainingPage;
