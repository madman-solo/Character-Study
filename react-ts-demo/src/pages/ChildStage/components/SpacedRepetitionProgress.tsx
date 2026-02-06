/**
 * SpacedRepetitionProgress Component
 * 间隔重复进度组件 - 显示复习统计和进度
 */

import type { SpacedRepetitionProgressProps } from '../../../types/vocabulary';
import './SpacedRepetitionProgress.css';

const SpacedRepetitionProgress = ({
  totalWords,
  reviewedWords,
  correctCount,
  wrongCount,
  accuracy
}: SpacedRepetitionProgressProps) => {
  const progress = totalWords > 0 ? (reviewedWords / totalWords) * 100 : 0;
  const calculatedAccuracy = accuracy !== undefined ? accuracy :
    (correctCount + wrongCount > 0 ? Math.round((correctCount / (correctCount + wrongCount)) * 100) : 0);

  const getMotivationalMessage = () => {
    if (reviewedWords === 0) return '开始复习吧！';
    if (calculatedAccuracy >= 90) return '太棒了！继续保持！';
    if (calculatedAccuracy >= 70) return '做得很好！';
    if (calculatedAccuracy >= 50) return '继续努力！';
    return '加油！多练习就会进步！';
  };

  return (
    <div className="child-spaced-repetition-progress">
      <div className="progress-header">
        <h3>复习进度</h3>
        <div className="progress-message">{getMotivationalMessage()}</div>
      </div>

      <div className="progress-bar-container">
        <div className="progress-bar">
          <div
            className="progress-bar-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="progress-text">
          {reviewedWords} / {totalWords} 个单词
        </div>
      </div>

      <div className="progress-stats">
        <div className="stat-item correct">
          <div className="stat-icon">✓</div>
          <div className="stat-label">正确</div>
          <div className="stat-value">{correctCount}</div>
        </div>

        <div className="stat-item wrong">
          <div className="stat-icon">✗</div>
          <div className="stat-label">错误</div>
          <div className="stat-value">{wrongCount}</div>
        </div>

        <div className="stat-item accuracy">
          <div className="stat-icon">📊</div>
          <div className="stat-label">准确率</div>
          <div className="stat-value">{calculatedAccuracy}%</div>
        </div>
      </div>
    </div>
  );
};

export default SpacedRepetitionProgress;
