/**
 * VIP专属页面
 * VIP会员专享内容
 */

import { useNavigate } from "react-router-dom";
import "../../../styles/ChildStageCss/VIPPage.css";

interface VIPContent {
  id: string;
  title: string;
  description: string;
  icon: string;
  features: string;
}

const VIPPage = () => {
  const navigate = useNavigate();

  const vipContents: VIPContent[] = [
    {
      id: "1",
      title: "外教一对一",
      description: "专业外教在线辅导，纯正英语发音",
      icon: "👨‍🏫",
      features: "每周2节课",
    },
    {
      id: "2",
      title: "定制学习计划",
      description: "根据孩子水平量身定制学习路径",
      icon: "📋",
      features: "个性化方案",
    },
    {
      id: "3",
      title: "专属学习资料",
      description: "海量VIP专属教材和练习题",
      icon: "📚",
      features: "1000+资源",
    },
    {
      id: "4",
      title: "进度跟踪报告",
      description: "详细的学习进度和能力分析报告",
      icon: "📊",
      features: "每月更新",
    },
    {
      id: "5",
      title: "优先客服支持",
      description: "7x24小时专属客服团队",
      icon: "💬",
      features: "即时响应",
    },
    {
      id: "6",
      title: "线下活动优先",
      description: "优先参加英语角、夏令营等活动",
      icon: "🎪",
      features: "会员专享",
    },
    {
      id: "7",
      title: "学习礼包",
      description: "每月赠送精美学习用品和奖励",
      icon: "🎁",
      features: "月月有礼",
    },
    {
      id: "8",
      title: "家长课堂",
      description: "专业育儿和英语启蒙指导",
      icon: "👨‍👩‍👧",
      features: "每周直播",
    },
  ];

  const handleBack = () => {
    navigate("/child-english-home");
  };

  const handleVIPClick = (content: VIPContent) => {
    alert(`VIP专属: ${content.title}\n${content.description}\n功能开发中...`);
  };

  return (
    <div className="vip-page">
      {/* 顶部导航 */}
      <div className="vip-header">
        <button className="back-btn" onClick={handleBack}>
          ← 返回
        </button>
        <h1 className="page-title">👑 VIP专属</h1>
        <div className="header-spacer"></div>
      </div>

      {/* 说明 */}
      <div className="vip-intro">
        <p>成为VIP会员，享受更多专属权益和优质服务！</p>
      </div>

      {/* VIP内容网格 */}
      <div className="vip-grid">
        {vipContents.map((content) => (
          <div
            key={content.id}
            className="vip-card"
            onClick={() => handleVIPClick(content)}
          >
            <div className="vip-badge">VIP</div>
            <div className="vip-icon">{content.icon}</div>
            <div className="vip-info">
              <h3 className="vip-title">{content.title}</h3>
              <p className="vip-description">{content.description}</p>
              <p className="vip-features">✨ {content.features}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VIPPage;
