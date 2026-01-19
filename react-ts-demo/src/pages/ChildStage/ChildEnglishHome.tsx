import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ChildCarousel from './components/ChildCarousel';
import ChildCard from './components/ChildCard';
import RecommendSection from './components/RecommendSection';
import SVIPSection from './components/SVIPSection';
import AnimationSection from './components/AnimationSection';
import '../../styles/ChildStageCss/ChildEnglishHome.css';

const ChildEnglishHome = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('推荐');

  const tabs = ['推荐', 'SVIP', '动画专区', '答题闯关', '英语妙用'];

  const mainBanners = [
    { id: '1', image: 'https://via.placeholder.com/1200x400/FF6B6B/FFFFFF?text=欢迎来到少儿英语', title: '欢迎来到少儿英语' },
    { id: '2', image: 'https://via.placeholder.com/1200x400/4ECDC4/FFFFFF?text=快乐学英语', title: '快乐学英语' },
    { id: '3', image: 'https://via.placeholder.com/1200x400/FFE66D/333333?text=和角色一起学习', title: '和角色一起学习' },
  ];

  const interactiveLearning = [
    { id: '1', icon: '🎤', title: '跟读练习', description: '模仿发音' },
    { id: '2', icon: '🎧', title: '听力训练', description: '提升听力' },
    { id: '3', icon: '✍️', title: '单词拼写', description: '记忆单词' },
    { id: '4', icon: '🗣️', title: '口语对话', description: '情景对话' },
  ];

  const handleTabClick = (tab: string) => {
    if (tab === '答题闯关') {
      navigate('/child-quiz-game');
    } else {
      setActiveTab(tab);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case '推荐':
        return <RecommendSection />;
      case 'SVIP':
        return <SVIPSection />;
      case '动画专区':
        return <AnimationSection />;
      case '英语妙用':
        return (
          <div className="child-content-section">
            <h2 className="child-section-title">英语妙用</h2>
            <div className="child-content-grid">
              <ChildCard icon="📱" title="日常用语" description="生活常用英语" />
              <ChildCard icon="🍔" title="美食英语" description="食物相关词汇" />
              <ChildCard icon="🚗" title="交通出行" description="出行常用语" />
              <ChildCard icon="🏥" title="健康医疗" description="医疗相关词汇" />
            </div>
          </div>
        );
      default:
        return <RecommendSection />;
    }
  };

  return (
    <div className="child-home-container">
      {/* 第一层：顶部导航栏 */}
      <div className="child-navbar">
        <div className="child-navbar-left">
          <button className="child-icon-button" aria-label="搜索">
            🔍
          </button>
          <button className="child-icon-button" aria-label="历史记录">
            📜
          </button>
        </div>
        <h1 className="child-navbar-title">少儿英语</h1>
        <div className="child-navbar-right">
          <div className="child-avatar">👤</div>
        </div>
      </div>

      {/* 第二层：分类导航栏 */}
      <div className="child-category-nav">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`child-category-tab ${activeTab === tab ? 'child-active' : ''}`}
            onClick={() => handleTabClick(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 第三层：自动轮播图 */}
      <div className="child-banner-section">
        <ChildCarousel items={mainBanners} height="400px" autoPlayInterval={3000} />
      </div>

      {/* 第四层：固定专栏板块 */}
      <div className="child-special-section">
        <h2 className="child-section-title">角色互动学英语</h2>
        <div className="child-special-grid">
          {interactiveLearning.map((item) => (
            <ChildCard
              key={item.id}
              icon={item.icon}
              title={item.title}
              description={item.description}
            />
          ))}
        </div>
      </div>

      {/* 第五层：底部内容区 */}
      <div className="child-content-area">
        {renderContent()}
      </div>
    </div>
  );
};

export default ChildEnglishHome;
