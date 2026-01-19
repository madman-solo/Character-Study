import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/ChildStageCss/ChildQuizGame.css';

const ChildQuizGame = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => setLoading(false), 500);
          return 100;
        }
        return prev + 2;
      });
    }, 60);

    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div className="child-quiz-loading">
        <div className="child-loading-content">
          <h1 className="child-loading-title">答题闯关</h1>
          <p className="child-loading-subtitle">游戏加载中...</p>
          <div className="child-progress-bar">
            <div
              className="child-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="child-progress-text">{progress}%</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="child-rotate-hint">
        <div className="child-rotate-content">
          <div className="child-rotate-icon">📱</div>
          <p className="child-rotate-text">请横屏使用</p>
          <p className="child-rotate-subtext">获得更好的游戏体验</p>
        </div>
      </div>

      <div className="child-quiz-game">
        <button className="child-quiz-back" onClick={() => navigate(-1)}>
          ← 返回
        </button>

        <div className="child-quiz-header">
          <h1 className="child-quiz-title">答题闯关</h1>
          <div className="child-quiz-score">得分: 0</div>
        </div>

        <div className="child-quiz-content">
          <div className="child-quiz-placeholder">
            <div className="child-placeholder-icon">🎮</div>
            <h2 className="child-placeholder-title">游戏内容开发中</h2>
            <p className="child-placeholder-text">敬请期待精彩的答题闯关游戏！</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChildQuizGame;
