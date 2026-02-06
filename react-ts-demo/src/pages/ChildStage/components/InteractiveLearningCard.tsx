/**
 * 互动学习卡片组件
 * 支持点击学习、获得积分、播放音效
 */

import React, { useState } from 'react';
import './InteractiveLearningCard.css';

interface InteractiveLearningCardProps {
  icon: string;
  title: string;
  description: string;
  points: number;
  onComplete: (points: number) => void;
  onPlaySound?: () => void;
  animationsEnabled?: boolean;
}

const InteractiveLearningCard: React.FC<InteractiveLearningCardProps> = ({
  icon,
  title,
  description,
  points,
  onComplete,
  onPlaySound,
  animationsEnabled = true,
}) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const [showPoints, setShowPoints] = useState(false);

  const handleClick = () => {
    if (isCompleted) return;

    // 播放音效
    if (onPlaySound) {
      onPlaySound();
    }

    // 标记为完成
    setIsCompleted(true);

    // 显示积分动画
    setShowPoints(true);
    setTimeout(() => setShowPoints(false), 1500);

    // 触发完成回调
    onComplete(points);

    // 3秒后重置状态，允许再次点击
    setTimeout(() => {
      setIsCompleted(false);
    }, 3000);
  };

  return (
    <div
      className={`interactive-learning-card ${isCompleted ? 'completed' : ''} ${
        animationsEnabled ? 'child-animate-bounce-in' : ''
      }`}
      onClick={handleClick}
    >
      <div className="card-icon-wrapper">
        <div className={`card-icon ${isCompleted ? 'child-animate-heartbeat' : ''}`}>
          {icon}
        </div>
        {isCompleted && (
          <div className="completion-badge child-animate-badge-unlock">✓</div>
        )}
      </div>

      <h3 className="card-title">{title}</h3>
      <p className="card-description">{description}</p>

      <div className="card-footer">
        <span className="card-points">
          <span className="points-icon">⭐</span>
          {points} 积分
        </span>
      </div>

      {showPoints && (
        <div className="points-popup child-animate-point-fly">
          +{points}
        </div>
      )}
    </div>
  );
};

export default InteractiveLearningCard;
