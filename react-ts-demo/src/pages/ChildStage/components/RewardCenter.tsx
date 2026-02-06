/**
 * 奖励中心组件
 * 展示积分、勋章、进度等奖励信息
 */

import React from "react";
import type { RewardData } from "../../../hooks/useChildRewards";
import "./RewardCenter.css";

interface RewardCenterProps {
  rewardData: RewardData | null;
  recentPoints: number | null;
  onClose?: () => void;
}

const RewardCenter: React.FC<RewardCenterProps> = ({
  rewardData,
  recentPoints,
  onClose,
}) => {
  if (!rewardData) {
    return null;
  }

  const unlockedBadges = rewardData.badges.filter((badge) => badge.unlocked);
  const lockedBadges = rewardData.badges.filter((badge) => !badge.unlocked);

  return (
    <div className="child-reward-center">
      <div className="child-reward-header">
        <h3 className="child-reward-title">🎁 奖励中心</h3>
        {onClose && (
          <button
            className="child-reward-close"
            onClick={onClose}
            aria-label="关闭"
          >
            ✕
          </button>
        )}
      </div>

      {/* 积分展示 */}
      <div className="child-points-section">
        <div className="child-points-display">
          <div className="child-points-icon">⭐</div>
          <div className="child-points-info">
            <div className="child-points-label">我的积分</div>
            <div className="child-points-value">{rewardData.totalPoints}</div>
          </div>
        </div>

        {/* 积分飞入动画 */}
        {recentPoints !== null && (
          <div className="child-points-fly child-animate-point-fly">
            +{recentPoints}
          </div>
        )}
      </div>

      {/* 勋章展示 */}
      <div className="child-badges-section">
        <h4 className="child-section-subtitle">
          我的勋章 ({unlockedBadges.length}/{rewardData.badges.length})
        </h4>

        {/* 已解锁勋章 */}
        {unlockedBadges.length > 0 && (
          <div className="child-badges-grid">
            {unlockedBadges.map((badge) => (
              <div
                key={badge.id}
                className="child-badge-item child-badge-unlocked child-animate-star-twinkle"
                title={badge.description}
              >
                <div className="child-badge-icon">{badge.icon}</div>
                <div className="child-badge-name">{badge.name}</div>
              </div>
            ))}
          </div>
        )}

        {/* 未解锁勋章 */}
        {lockedBadges.length > 0 && (
          <>
            <h5 className="child-section-subtitle-small">待解锁</h5>
            <div className="child-badges-grid">
              {lockedBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="child-badge-item child-badge-locked"
                  title={badge.requirement}
                >
                  <div className="child-badge-icon child-badge-icon-locked">
                    {badge.icon}
                  </div>
                  <div className="child-badge-name">{badge.name}</div>
                  {badge.progress !== undefined && badge.progress > 0 && (
                    <div className="child-badge-progress">
                      <div
                        className="child-badge-progress-fill"
                        style={{ width: `${badge.progress}%` }}
                      />
                    </div>
                  )}
                  <div className="child-badge-requirement">
                    {badge.requirement}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* 最近积分记录 */}
      {rewardData.pointHistory.length > 0 && (
        <div className="child-points-history">
          <h4 className="child-section-subtitle">最近获得</h4>
          <div className="child-history-list">
            {rewardData.pointHistory.slice(0, 5).map((record) => (
              <div key={record.id} className="child-history-item">
                <span className="child-history-reason">{record.reason}</span>
                <span className="child-history-points">+{record.amount}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RewardCenter;
