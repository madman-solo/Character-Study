import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useChildLearning } from '../../hooks/useChildLearning';
import { useActivityTracker } from '../../hooks/useActivityTracker';
import { useChildRewards, POINT_RULES } from '../../hooks/useChildRewards';
import { useChildSound } from '../../hooks/useChildSound';
import ChildCarousel from './components/ChildCarousel';
import ChildCard from './components/ChildCard';
import RecommendSection from './components/RecommendSection';
import SVIPSection from './components/SVIPSection';
import AnimationSection from './components/AnimationSection';
import RewardCenter from './components/RewardCenter';
import ParentPanel from './components/ParentPanel';
import SoundControl from './components/SoundControl';
import InteractiveLearningCard from './components/InteractiveLearningCard';
import '../../styles/ChildStageCss/ChildEnglishHome.css';

const ChildEnglishHome = () => {
  const navigate = useNavigate();
  const { user, skipLogin } = useAuth();
  const [activeTab, setActiveTab] = useState('推荐');
  const [showRewardCenter, setShowRewardCenter] = useState(false);
  const [showParentPanel, setShowParentPanel] = useState(false);
  const [parentPassword, setParentPassword] = useState('');
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [storedPassword, setStoredPassword] = useState<string>('1234');

  // 学习会话ID（从后端API获取）
  const [sessionId, setSessionId] = useState<string | null>(null);

  // 使用 ref 跟踪是否已经尝试领取每日奖励
  const hasClaimedDailyReward = useRef(false);

  // 如果用户未登录，自动以游客身份登录
  useEffect(() => {
    if (!user) {
      skipLogin();
    }
  }, [user, skipLogin]);

  // 从 localStorage 加载家长密码
  useEffect(() => {
    const savedPassword = localStorage.getItem('parent_password');
    if (savedPassword) {
      setStoredPassword(savedPassword);
    }
  }, []);

  // 使用自定义 Hooks - 使用 'guest' 作为默认 ID
  const userId = user?.id || 'guest';

  const {
    learningData,
    isLoading: learningLoading,
    startLearningSession,
    endLearningSession,
    resetLearningData,
  } = useChildLearning(userId);

  const {
    rewardData,
    isLoading: rewardLoading,
    recentPoints,
    addPoints,
    claimDailyLoginReward,
    completeTask,
    checkAndUnlockBadges,
    resetRewardData,
  } = useChildRewards(userId);

  const {
    config: soundConfig,
    playSound,
    playMilestoneSound,
    speakWord,
    toggleSound,
    setVolume,
  } = useChildSound();

  // 活跃度追踪 - 监听用户活动和页面可见性
  const activityState = useActivityTracker({
    inactivityTimeout: 3 * 60 * 1000, // 3分钟无活动自动暂停
    heartbeatInterval: 30 * 1000, // 30秒心跳间隔
    onPause: () => {
      console.log('⏸️ 用户暂停学习（页面失焦或无活动）');
    },
    onResume: () => {
      console.log('▶️ 用户恢复学习');
    },
    onHeartbeat: async (state) => {
      // 发送心跳到服务器，保持会话活跃
      if (sessionId) {
        try {
          await fetch('http://localhost:3001/api/learning-session/heartbeat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId,
              timestamp: Date.now()
            })
          });
          console.log('💓 心跳已发送，活跃时长:', Math.floor(state.activeDuration / 1000 / 60), '分钟');
        } catch (error) {
          console.error('心跳发送失败:', error);
        }
      }
    }
  });

  const tabs = ['推荐', 'SVIP', '动画专区', '答题闯关', '英语妙用'];

  const mainBanners = [
    { id: '1', image: 'https://via.placeholder.com/1200x400/FF6B6B/FFFFFF?text=欢迎来到少儿英语', title: '欢迎来到少儿英语' },
    { id: '2', image: 'https://via.placeholder.com/1200x400/4ECDC4/FFFFFF?text=快乐学英语', title: '快乐学英语' },
    { id: '3', image: 'https://via.placeholder.com/1200x400/FFE66D/333333?text=和角色一起学习', title: '和角色一起学习' },
  ];

  const interactiveLearning = [
    { id: '1', icon: '🎤', title: '跟读练习', description: '模仿发音', points: POINT_RULES.INTERACTION },
    { id: '2', icon: '🎧', title: '听力训练', description: '提升听力', points: POINT_RULES.INTERACTION },
    { id: '3', icon: '✍️', title: '单词拼写', description: '记忆单词', points: POINT_RULES.MASTER_WORD },
    { id: '4', icon: '🗣️', title: '口语对话', description: '情景对话', points: POINT_RULES.INTERACTION },
  ];

  // 处理互动学习完成
  const handleLearningComplete = (points: number, title: string) => {
    addPoints(points, title);
    playSound('correct-answer');

    // 检查勋章解锁
    if (learningData && rewardData) {
      checkAndUnlockBadges(learningData);
    }
  };

  // 初始化：开始学习会话和领取每日奖励
  useEffect(() => {
    if (user && learningData && rewardData && !hasClaimedDailyReward.current) {
      console.log('🎯 初始化：准备领取每日奖励');

      // 开始学习会话
      startLearningSession();

      // 调用后端API启动学习会话
      const startBackendSession = async () => {
        try {
          const response = await fetch('http://localhost:3001/api/learning-session/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              sessionType: 'child-home'
            })
          });

          const data = await response.json();
          if (data.success) {
            setSessionId(data.sessionId);
            console.log('✅ 学习会话已开始，会话ID:', data.sessionId);
          }
        } catch (error) {
          console.error('启动学习会话失败:', error);
        }
      };

      startBackendSession();

      // 尝试领取每日登录奖励
      const claimed = claimDailyLoginReward();
      if (claimed) {
        console.log('🎉 每日登录奖励领取成功！');
        playSound('milestone');
      } else {
        console.log('ℹ️ 今天已经领取过每日奖励');
      }

      // 标记已经尝试过领取
      hasClaimedDailyReward.current = true;

      // 检查并解锁勋章
      checkAndUnlockBadges(learningData);
    }

    // 组件卸载时结束学习会话
    return () => {
      if (user && learningData) {
        // 调用后端API结束学习会话
        const endBackendSession = async () => {
          if (sessionId) {
            try {
              const response = await fetch('http://localhost:3001/api/learning-session/end', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  sessionId,
                  activeTime: activityState.activeDuration,
                  pausedTime: activityState.pausedDuration
                })
              });

              const data = await response.json();
              if (data.success) {
                console.log('✅ 学习会话已结束');
                console.log('📊 总时长:', data.totalTime, '分钟');
                console.log('✅ 有效时长:', data.validTime, '分钟');
              }
            } catch (error) {
              console.error('结束学习会话失败:', error);
            }
          }
        };

        endBackendSession();

        const duration = endLearningSession();
        if (duration && duration >= 10) {
          // 学习满10分钟，奖励积分
          addPoints(POINT_RULES.STUDY_10MIN, '学习满10分钟');
          playMilestoneSound();
        }
      }
    };
  }, [user, learningData, rewardData, claimDailyLoginReward, startLearningSession, checkAndUnlockBadges, playSound, endLearningSession, addPoints, playMilestoneSound]);

  // 定期检查勋章解锁
  useEffect(() => {
    if (learningData && rewardData) {
      checkAndUnlockBadges(learningData);
    }
  }, [learningData?.masteredWords.length, learningData?.consecutiveDays, learningData?.interactionCount]);

  const handleTabClick = (tab: string) => {
    if (tab === '答题闯关') {
      navigate('/child-quiz-game');
    } else {
      setActiveTab(tab);
    }
  };

  const handleParentModeClick = () => {
    setShowPasswordPrompt(true);
  };

  const handlePasswordSubmit = () => {
    // 验证家长密码
    if (parentPassword === storedPassword) {
      setShowPasswordPrompt(false);
      setShowParentPanel(true);
      setParentPassword('');
    } else {
      alert('密码错误！请重新输入');
      setParentPassword('');
    }
  };

  // 修改家长密码
  const handleChangePassword = (newPassword: string) => {
    setStoredPassword(newPassword);
    localStorage.setItem('parent_password', newPassword);
    alert('密码修改成功！');
  };

  const handleResetProgress = () => {
    resetLearningData();
    resetRewardData();
    alert('学习进度已重置！');
    setShowParentPanel(false);
  };

  const handleToggleAnimations = (enabled: boolean) => {
    setAnimationsEnabled(enabled);
    localStorage.setItem('child_animations_enabled', JSON.stringify(enabled));
  };

  const renderContent = () => {
    switch (activeTab) {
      case '推荐':
        return (
          <RecommendSection
            learningData={learningData}
            rewardData={rewardData}
            animationsEnabled={animationsEnabled}
            onTaskComplete={completeTask}
          />
        );
      case 'SVIP':
        return <SVIPSection />;
      case '动画专区':
        return <AnimationSection />;
      case '英语妙用':
        return (
          <div className="child-content-section">
            <h2 className="child-section-title">英语妙用</h2>
            <div className="child-content-grid">
              <ChildCard
                icon="📱"
                title="日常用语"
                description="生活常用英语"
                onClick={() => navigate('/child-daily-phrases')}
              />
              <ChildCard
                icon="🍔"
                title="美食英语"
                description="食物相关词汇"
                onClick={() => navigate('/child-food-english')}
              />
              <ChildCard
                icon="🚗"
                title="交通出行"
                description="出行常用语"
                onClick={() => navigate('/child-transportation')}
              />
              <ChildCard
                icon="🏥"
                title="健康医疗"
                description="医疗相关词汇"
                onClick={() => navigate('/child-health-medical')}
              />
            </div>
          </div>
        );
      default:
        return (
          <RecommendSection
            learningData={learningData}
            rewardData={rewardData}
            animationsEnabled={animationsEnabled}
            onTaskComplete={completeTask}
          />
        );
    }
  };

  if (learningLoading || rewardLoading) {
    return (
      <div className="child-home-container">
        <div className="child-loading">加载中...</div>
      </div>
    );
  }

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
          {/* 积分快速显示 */}
          {rewardData && (
            <div
              className="child-points-badge"
              onClick={() => setShowRewardCenter(true)}
              title="点击查看奖励中心"
            >
              <span className="points-icon">⭐</span>
              <span className="points-text">{rewardData.totalPoints}</span>
            </div>
          )}

          {/* 音效控制 */}
          <SoundControl
            config={soundConfig}
            onToggle={toggleSound}
            onVolumeChange={setVolume}
          />

          {/* 家长模式入口 */}
          <button
            className="child-icon-button child-parent-mode-btn"
            onClick={handleParentModeClick}
            aria-label="家长模式"
            title="家长模式"
          >
            👨‍👩‍👧
          </button>

          {/* 用户头像 */}
          <div className="child-avatar" onClick={() => setShowRewardCenter(!showRewardCenter)}>
            {user ? '👤' : '🎭'}
          </div>
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
        <h2 className="child-section-title">🎯 角色互动学英语</h2>
        <div className="child-special-grid">
          {interactiveLearning.map((item) => (
            <InteractiveLearningCard
              key={item.id}
              icon={item.icon}
              title={item.title}
              description={item.description}
              points={item.points}
              onComplete={(points) => handleLearningComplete(points, item.title)}
              onPlaySound={() => playSound('interaction')}
              animationsEnabled={animationsEnabled}
            />
          ))}
        </div>
      </div>

      {/* 第五层：底部内容区 */}
      <div className="child-content-area">
        {renderContent()}
      </div>

      {/* 单词本学习模块 */}
      <div className="child-vocabulary-module">
        <h2 className="child-section-title">📚 单词本学习</h2>
        <div className="child-content-grid">
          <ChildCard
            icon="📖"
            title="我的单词本"
            description="学习新单词"
            onClick={() => navigate('/child-vocabulary-book')}
          />
          <ChildCard
            icon="🔄"
            title="复习单词"
            description="巩固已学单词"
            onClick={() => navigate('/child-vocabulary-review')}
          />
          <ChildCard
            icon="📊"
            title="学习统计"
            description="查看学习进度"
            onClick={() => navigate('/child-vocabulary-hub')}
          />
        </div>
      </div>

      {/* 奖励中心侧边栏 */}
      {showRewardCenter && user && (
        <div className="child-reward-sidebar">
          <RewardCenter
            rewardData={rewardData}
            recentPoints={recentPoints}
            onClose={() => setShowRewardCenter(false)}
          />
        </div>
      )}

      {/* 家长密码验证弹窗 */}
      {showPasswordPrompt && (
        <div className="child-modal-overlay" onClick={() => setShowPasswordPrompt(false)}>
          <div className="child-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="child-modal-title">家长验证</h3>
            <p className="child-modal-text">请输入家长密码（默认：1234）</p>
            <input
              type="password"
              className="child-modal-input"
              value={parentPassword}
              onChange={(e) => setParentPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
              placeholder="输入密码"
              autoFocus
            />
            <div className="child-modal-buttons">
              <button className="child-modal-btn child-modal-btn-cancel" onClick={() => setShowPasswordPrompt(false)}>
                取消
              </button>
              <button className="child-modal-btn child-modal-btn-confirm" onClick={handlePasswordSubmit}>
                确认
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 家长监控面板 */}
      {showParentPanel && user && (
        <ParentPanel
          learningData={learningData}
          rewardData={rewardData}
          onClose={() => setShowParentPanel(false)}
          onResetProgress={handleResetProgress}
          onToggleAnimations={handleToggleAnimations}
          onToggleSound={toggleSound}
          onChangePassword={handleChangePassword}
          animationsEnabled={animationsEnabled}
          soundEnabled={soundConfig.enabled}
        />
      )}
    </div>
  );
};

export default ChildEnglishHome;
