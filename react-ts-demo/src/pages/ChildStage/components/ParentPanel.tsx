/**
 * 家长监控面板组件
 * 展示孩子的学习数据、互动数据、奖励数据等
 */

import React, { useState } from "react";
import type { LearningData } from "../../../hooks/useChildLearning";
import type { RewardData } from "../../../hooks/useChildRewards";
import LearningCharts from "./LearningCharts";
import "./ParentPanel.css";

interface ParentPanelProps {
  learningData: LearningData | null;
  rewardData: RewardData | null;
  onClose: () => void;
  onResetProgress: () => void;
  onToggleAnimations: (enabled: boolean) => void;
  onToggleSound: (enabled: boolean) => void;
  onChangePassword: (newPassword: string) => void;
  animationsEnabled: boolean;
  soundEnabled: boolean;
}

const ParentPanel: React.FC<ParentPanelProps> = ({
  learningData,
  rewardData,
  onClose,
  onResetProgress,
  onToggleAnimations,
  onToggleSound,
  onChangePassword,
  animationsEnabled,
  soundEnabled,
}) => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "guidance" | "settings"
  >("overview");
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [timeRange, setTimeRange] = useState<'7days' | '30days' | '90days'>('7days');

  if (!learningData || !rewardData) {
    return null;
  }

  // 处理密码修改
  const handlePasswordChange = () => {
    // 验证旧密码
    const storedPassword = localStorage.getItem('parent_password') || '1234';
    if (oldPassword !== storedPassword) {
      alert('旧密码错误！');
      return;
    }

    // 验证新密码
    if (!newPassword || newPassword.length < 4) {
      alert('新密码至少需要4位！');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('两次输入的新密码不一致！');
      return;
    }

    // 修改密码
    onChangePassword(newPassword);
    setShowPasswordChange(false);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  // 计算统计数据
  const totalStudyHours = Math.floor(learningData.totalStudyTime / 60);
  const totalStudyMinutes = learningData.totalStudyTime % 60;
  const averageDailyTime =
    Object.values(learningData.dailyStudyTime).length > 0
      ? Math.round(
          Object.values(learningData.dailyStudyTime).reduce(
            (sum: number, time: number) => sum + time,
            0,
          ) / Object.values(learningData.dailyStudyTime).length,
        )
      : 0;

  const masteredWordsCount = learningData.masteredWords.length;
  const weakWordsCount = learningData.weakWords.length;
  const accuracy = learningData.answerHistory.accuracy.toFixed(1);

  const unlockedBadgesCount = rewardData.badges.filter(
    (b) => b.unlocked,
  ).length;
  const totalBadgesCount = rewardData.badges.length;

  // 渲染概览标签页
  const renderOverview = () => (
    <div className="parent-panel-content">
      {/* 核心学习数据 */}
      <section className="parent-section">
        <h3 className="parent-section-title">📊 学习数据</h3>
        <div className="parent-stats-grid">
          <div className="parent-stat-card">
            <div className="parent-stat-icon">⏰</div>
            <div className="parent-stat-info">
              <div className="parent-stat-label">总学习时长</div>
              <div className="parent-stat-value">
                {totalStudyHours}小时{totalStudyMinutes}分钟
              </div>
            </div>
          </div>

          <div className="parent-stat-card">
            <div className="parent-stat-icon">📅</div>
            <div className="parent-stat-info">
              <div className="parent-stat-label">平均每日学习</div>
              <div className="parent-stat-value">{averageDailyTime}分钟</div>
            </div>
          </div>

          <div className="parent-stat-card">
            <div className="parent-stat-icon">📚</div>
            <div className="parent-stat-info">
              <div className="parent-stat-label">掌握单词数</div>
              <div className="parent-stat-value">{masteredWordsCount}个</div>
            </div>
          </div>

          <div className="parent-stat-card">
            <div className="parent-stat-icon">🎯</div>
            <div className="parent-stat-info">
              <div className="parent-stat-label">答题正确率</div>
              <div className="parent-stat-value">{accuracy}%</div>
            </div>
          </div>

          <div className="parent-stat-card">
            <div className="parent-stat-icon">🔥</div>
            <div className="parent-stat-info">
              <div className="parent-stat-label">连续打卡</div>
              <div className="parent-stat-value">
                {learningData.consecutiveDays}天
              </div>
            </div>
          </div>

          <div className="parent-stat-card">
            <div className="parent-stat-icon">💬</div>
            <div className="parent-stat-info">
              <div className="parent-stat-label">互动次数</div>
              <div className="parent-stat-value">
                {learningData.interactionCount}次
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 学习数据分析图表 */}
      <section className="parent-section">
        <h3 className="parent-section-title">📈 学习数据分析</h3>
        <LearningCharts
          learningData={learningData}
          wordProgressList={[]}
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
        />
      </section>

      {/* 单词本进度 */}
      {Object.keys(learningData.currentBookProgress).length > 0 && (
        <section className="parent-section">
          <h3 className="parent-section-title">📖 单词本进度</h3>
          <div className="parent-progress-list">
            {Object.entries(learningData.currentBookProgress).map(
              ([bookName, progress]) => (
                <div key={bookName} className="parent-progress-item">
                  <div className="parent-progress-header">
                    <span className="parent-progress-name">{bookName}</span>
                    <span className="parent-progress-percent">{progress}%</span>
                  </div>
                  <div className="parent-progress-bar">
                    <div
                      className="parent-progress-fill"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              ),
            )}
          </div>
        </section>
      )}

      {/* 薄弱单词 */}
      {weakWordsCount > 0 && (
        <section className="parent-section">
          <h3 className="parent-section-title">⚠️ 薄弱单词（需重点辅导）</h3>
          <div className="parent-weak-words">
            {learningData.weakWords.slice(0, 10).map((word) => (
              <div key={word.id} className="parent-weak-word-item">
                <span className="parent-weak-word">{word.word}</span>
                <span className="parent-weak-translation">
                  {word.translation}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 奖励数据 */}
      <section className="parent-section">
        <h3 className="parent-section-title">🏆 奖励成就</h3>
        <div className="parent-stats-grid">
          <div className="parent-stat-card">
            <div className="parent-stat-icon">⭐</div>
            <div className="parent-stat-info">
              <div className="parent-stat-label">当前积分</div>
              <div className="parent-stat-value">{rewardData.totalPoints}</div>
            </div>
          </div>

          <div className="parent-stat-card">
            <div className="parent-stat-icon">🏅</div>
            <div className="parent-stat-info">
              <div className="parent-stat-label">已解锁勋章</div>
              <div className="parent-stat-value">
                {unlockedBadgesCount}/{totalBadgesCount}
              </div>
            </div>
          </div>
        </div>

        <div className="parent-badges-preview">
          {rewardData.badges
            .filter((b) => b.unlocked)
            .map((badge) => (
              <div
                key={badge.id}
                className="parent-badge-mini"
                title={badge.description}
              >
                {badge.icon}
              </div>
            ))}
        </div>
      </section>
    </div>
  );

  // 渲染辅导指导标签页
  const renderGuidance = () => (
    <div className="parent-panel-content">
      <section className="parent-section">
        <h3 className="parent-section-title">💡 学习计划建议</h3>
        <div className="parent-guidance-card">
          <p className="parent-guidance-text">根据孩子当前的学习进度，建议：</p>
          <ul className="parent-guidance-list">
            <li>
              每日学习时长：{averageDailyTime < 15 ? "15-20" : "20-30"}分钟
            </li>
            <li>每日记忆单词：{masteredWordsCount < 50 ? "5-8" : "8-10"}个</li>
            <li>每周互动次数：至少3次</li>
            <li>
              建议学习时段：
              {averageDailyTime < 10 ? "早晨或晚饭后" : "保持当前时段"}
            </li>
          </ul>
        </div>
      </section>

      <section className="parent-section">
        <h3 className="parent-section-title">🎯 单词记忆技巧</h3>
        <div className="parent-guidance-card">
          <ul className="parent-guidance-list">
            <li>
              <strong>联想记忆法：</strong>将单词与熟悉的事物联系起来
            </li>
            <li>
              <strong>情景记忆法：</strong>在实际场景中使用单词
            </li>
            <li>
              <strong>重复记忆法：</strong>定期复习已学单词
            </li>
            <li>
              <strong>游戏记忆法：</strong>通过游戏和互动加深印象
            </li>
            <li>
              <strong>亲子互动：</strong>家长陪同学习，增加趣味性
            </li>
          </ul>
        </div>
      </section>

      <section className="parent-section">
        <h3 className="parent-section-title">📚 少儿英语启蒙知识</h3>
        <div className="parent-guidance-card">
          <h4 className="parent-guidance-subtitle">基础发音规则</h4>
          <p className="parent-guidance-text">
            帮助孩子掌握26个字母的标准发音，注意元音字母（a, e, i, o,
            u）的长短音区别。
          </p>

          <h4 className="parent-guidance-subtitle">日常用语积累</h4>
          <p className="parent-guidance-text">
            从简单的问候语开始：Hello, Good morning, Thank you, Please等，
            在日常生活中多使用，培养语感。
          </p>

          <h4 className="parent-guidance-subtitle">兴趣培养</h4>
          <p className="parent-guidance-text">
            通过英文儿歌、动画片、绘本等多种形式，让孩子在轻松愉快的氛围中学习英语。
          </p>
        </div>
      </section>
    </div>
  );

  // 渲染设置标签页
  const renderSettings = () => (
    <div className="parent-panel-content">
      <section className="parent-section">
        <h3 className="parent-section-title">🔐 家长密码管理</h3>

        {!showPasswordChange ? (
          <div className="parent-setting-item">
            <div className="parent-setting-info">
              <div className="parent-setting-label">修改家长密码</div>
              <div className="parent-setting-desc">
                修改进入家长监控面板的验证密码
              </div>
            </div>
            <button
              className="parent-toggle-btn"
              onClick={() => setShowPasswordChange(true)}
            >
              修改密码
            </button>
          </div>
        ) : (
          <div className="parent-password-change-form">
            <div className="parent-form-group">
              <label className="parent-form-label">旧密码</label>
              <input
                type="password"
                className="parent-form-input"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="请输入旧密码"
              />
            </div>
            <div className="parent-form-group">
              <label className="parent-form-label">新密码</label>
              <input
                type="password"
                className="parent-form-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="请输入新密码（至少4位）"
              />
            </div>
            <div className="parent-form-group">
              <label className="parent-form-label">确认新密码</label>
              <input
                type="password"
                className="parent-form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="请再次输入新密码"
              />
            </div>
            <div className="parent-form-buttons">
              <button
                className="parent-form-btn parent-form-btn-cancel"
                onClick={() => {
                  setShowPasswordChange(false);
                  setOldPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
              >
                取消
              </button>
              <button
                className="parent-form-btn parent-form-btn-confirm"
                onClick={handlePasswordChange}
              >
                确认修改
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="parent-section">
        <h3 className="parent-section-title">⚙️ 学习设置</h3>

        <div className="parent-setting-item">
          <div className="parent-setting-info">
            <div className="parent-setting-label">动画效果</div>
            <div className="parent-setting-desc">
              开启/关闭学习页面的动画效果
            </div>
          </div>
          <button
            className={`parent-toggle-btn ${animationsEnabled ? "active" : ""}`}
            onClick={() => onToggleAnimations(!animationsEnabled)}
          >
            {animationsEnabled ? "已开启" : "已关闭"}
          </button>
        </div>

        <div className="parent-setting-item">
          <div className="parent-setting-info">
            <div className="parent-setting-label">音效</div>
            <div className="parent-setting-desc">开启/关闭学习音效</div>
          </div>
          <button
            className={`parent-toggle-btn ${soundEnabled ? "active" : ""}`}
            onClick={() => onToggleSound(!soundEnabled)}
          >
            {soundEnabled ? "已开启" : "已关闭"}
          </button>
        </div>
      </section>

      <section className="parent-section">
        <h3 className="parent-section-title">🔄 数据管理</h3>

        <div className="parent-warning-card">
          <p className="parent-warning-text">
            ⚠️ 以下操作将清空孩子的学习进度，请谨慎操作！
          </p>
          <button
            className="parent-danger-btn"
            onClick={() => {
              if (window.confirm("确定要重置学习进度吗？此操作不可恢复！")) {
                onResetProgress();
              }
            }}
          >
            重置学习进度
          </button>
        </div>
      </section>
    </div>
  );

  return (
    <div className="parent-panel-overlay">
      <div className="parent-panel">
        <div className="parent-panel-header">
          <h2 className="parent-panel-title">👨‍👩‍👧 家长监控面板</h2>
          <button
            className="parent-panel-close"
            onClick={onClose}
            aria-label="关闭"
          >
            ✕
          </button>
        </div>

        <div className="parent-panel-tabs">
          <button
            className={`parent-tab ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            数据概览
          </button>
          <button
            className={`parent-tab ${activeTab === "guidance" ? "active" : ""}`}
            onClick={() => setActiveTab("guidance")}
          >
            辅导指导
          </button>
          <button
            className={`parent-tab ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => setActiveTab("settings")}
          >
            设置管理
          </button>
        </div>

        <div className="parent-panel-body">
          {activeTab === "overview" && renderOverview()}
          {activeTab === "guidance" && renderGuidance()}
          {activeTab === "settings" && renderSettings()}
        </div>
      </div>
    </div>
  );
};

export default ParentPanel;
