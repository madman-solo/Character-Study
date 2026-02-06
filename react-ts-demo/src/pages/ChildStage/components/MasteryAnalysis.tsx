/**
 * MasteryAnalysis Component
 * 单词掌握度分析组件 - 展示单词掌握度分布和详细分析
 */

import { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import {
  analyzeMasteryDistribution,
  getMasteryPercentage,
  identifyWeakWords,
  calculateAverageMasteryScore,
  getMasteryLevel,
  type MasteryLevel
} from '../../../utils/masteryAnalysis';
import type { WordProgress } from '../../../types/vocabulary';
import './MasteryAnalysis.css';

interface MasteryAnalysisProps {
  wordProgressList: WordProgress[];
  onWordClick?: (word: WordProgress) => void;
}

// 掌握度级别颜色映射
const MASTERY_COLORS: Record<MasteryLevel, string> = {
  mastered: '#4ECDC4',
  proficient: '#95E1D3',
  learning: '#FFE66D',
  needsWork: '#FFA07A',
  new: '#FF6B6B'
};

// 掌握度级别标签映射
const MASTERY_LABELS: Record<MasteryLevel, string> = {
  mastered: '已掌握',
  proficient: '熟练',
  learning: '学习中',
  needsWork: '需加强',
  new: '新单词'
};

const MasteryAnalysis: React.FC<MasteryAnalysisProps> = ({
  wordProgressList,
  onWordClick
}) => {
  const [expandedLevel, setExpandedLevel] = useState<MasteryLevel | null>(null);

  // 分析掌握度分布
  const distribution = useMemo(
    () => analyzeMasteryDistribution(wordProgressList),
    [wordProgressList]
  );

  // 计算百分比
  const percentages = useMemo(
    () => getMasteryPercentage(distribution),
    [distribution]
  );

  // 识别薄弱单词
  const weakWords = useMemo(
    () => identifyWeakWords(wordProgressList, 50),
    [wordProgressList]
  );

  // 计算平均掌握度
  const avgScore = useMemo(
    () => calculateAverageMasteryScore(wordProgressList),
    [wordProgressList]
  );

  // 准备饼图数据
  const pieData = useMemo(() => {
    return Object.entries(distribution).map(([level, words]) => ({
      name: MASTERY_LABELS[level as MasteryLevel],
      value: words.length,
      level: level as MasteryLevel
    })).filter(item => item.value > 0);
  }, [distribution]);

  // 切换展开/收起
  const toggleLevel = (level: MasteryLevel) => {
    setExpandedLevel(expandedLevel === level ? null : level);
  };

  // 自定义饼图标签
  const renderCustomLabel = (entry: any) => {
    const percent = ((entry.value / wordProgressList.length) * 100).toFixed(1);
    return `${entry.name} ${percent}%`;
  };

  if (wordProgressList.length === 0) {
    return (
      <div className="mastery-analysis">
        <div className="mastery-empty">
          <p>暂无单词数据</p>
          <p className="empty-hint">开始学习单词后，这里将显示掌握度分析</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mastery-analysis">
      {/* 总体概览 */}
      <div className="mastery-overview">
        <div className="overview-card">
          <div className="overview-icon">📊</div>
          <div className="overview-info">
            <div className="overview-label">总单词数</div>
            <div className="overview-value">{wordProgressList.length}</div>
          </div>
        </div>

        <div className="overview-card">
          <div className="overview-icon">🎯</div>
          <div className="overview-info">
            <div className="overview-label">平均掌握度</div>
            <div className="overview-value">{avgScore}分</div>
          </div>
        </div>

        <div className="overview-card">
          <div className="overview-icon">✅</div>
          <div className="overview-info">
            <div className="overview-label">已掌握</div>
            <div className="overview-value">
              {distribution.mastered.length}个 ({percentages.mastered}%)
            </div>
          </div>
        </div>

        <div className="overview-card">
          <div className="overview-icon">⚠️</div>
          <div className="overview-info">
            <div className="overview-label">薄弱单词</div>
            <div className="overview-value">{weakWords.length}个</div>
          </div>
        </div>
      </div>

      {/* 掌握度分布饼图 */}
      <div className="mastery-chart-section">
        <h3 className="section-title">掌握度分布</h3>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={MASTERY_COLORS[entry.level]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 各级别详细列表 */}
      <div className="mastery-levels-section">
        <h3 className="section-title">各级别单词详情</h3>
        <div className="levels-list">
          {(Object.entries(distribution) as [MasteryLevel, WordProgress[]][])
            .filter(([_, words]) => words.length > 0)
            .map(([level, words]) => (
              <div key={level} className="level-card">
                <div
                  className="level-header"
                  onClick={() => toggleLevel(level)}
                  style={{ borderLeftColor: MASTERY_COLORS[level] }}
                >
                  <div className="level-info">
                    <span className="level-name">{MASTERY_LABELS[level]}</span>
                    <span className="level-count">
                      {words.length}个 ({percentages[level]}%)
                    </span>
                  </div>
                  <div className="level-toggle">
                    {expandedLevel === level ? '▼' : '▶'}
                  </div>
                </div>

                {expandedLevel === level && (
                  <div className="level-words">
                    {words.slice(0, 20).map((wordProgress) => (
                      <div
                        key={wordProgress.wordId}
                        className="word-item"
                        onClick={() => onWordClick?.(wordProgress)}
                      >
                        <div className="word-main">
                          <span className="word-text">{wordProgress.word}</span>
                          <span className="word-score">
                            {wordProgress.masteryScore}分
                          </span>
                        </div>
                        <div className="word-stats">
                          <span className="stat-correct">
                            ✓ {wordProgress.correctCount}
                          </span>
                          <span className="stat-wrong">
                            ✗ {wordProgress.wrongCount}
                          </span>
                        </div>
                      </div>
                    ))}
                    {words.length > 20 && (
                      <div className="word-more">
                        还有 {words.length - 20} 个单词...
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>

      {/* 薄弱单词重点提示 */}
      {weakWords.length > 0 && (
        <div className="weak-words-section">
          <h3 className="section-title">⚠️ 薄弱单词（需重点复习）</h3>
          <div className="weak-words-list">
            {weakWords.slice(0, 10).map((wordProgress) => (
              <div
                key={wordProgress.wordId}
                className="weak-word-card"
                onClick={() => onWordClick?.(wordProgress)}
              >
                <div className="weak-word-main">
                  <span className="weak-word-text">{wordProgress.word}</span>
                  <span className="weak-word-score">
                    {wordProgress.masteryScore}分
                  </span>
                </div>
                <div className="weak-word-stats">
                  <span className="stat-correct">
                    ✓ {wordProgress.correctCount}
                  </span>
                  <span className="stat-wrong">
                    ✗ {wordProgress.wrongCount}
                  </span>
                  <span className="stat-level">
                    {MASTERY_LABELS[getMasteryLevel(wordProgress.masteryScore)]}
                  </span>
                </div>
              </div>
            ))}
          </div>
          {weakWords.length > 10 && (
            <p className="weak-words-hint">
              还有 {weakWords.length - 10} 个薄弱单词需要加强复习
            </p>
          )}
        </div>
      )}

      {/* 学习建议 */}
      <div className="suggestions-section">
        <h3 className="section-title">💡 学习建议</h3>
        <div className="suggestions-list">
          {avgScore < 60 && (
            <div className="suggestion-item priority-high">
              <span className="suggestion-icon">🎯</span>
              <div className="suggestion-content">
                <div className="suggestion-title">整体掌握度偏低</div>
                <div className="suggestion-desc">
                  建议放慢学习节奏，重点复习已学单词，巩固基础
                </div>
              </div>
            </div>
          )}

          {weakWords.length > 20 && (
            <div className="suggestion-item priority-high">
              <span className="suggestion-icon">⚠️</span>
              <div className="suggestion-content">
                <div className="suggestion-title">薄弱单词较多</div>
                <div className="suggestion-desc">
                  有 {weakWords.length} 个薄弱单词，建议每天重点复习5-10个
                </div>
              </div>
            </div>
          )}

          {distribution.mastered.length > 50 && (
            <div className="suggestion-item priority-low">
              <span className="suggestion-icon">🎉</span>
              <div className="suggestion-content">
                <div className="suggestion-title">学习效果很好</div>
                <div className="suggestion-desc">
                  已掌握 {distribution.mastered.length} 个单词，继续保持！
                </div>
              </div>
            </div>
          )}

          {percentages.learning > 40 && (
            <div className="suggestion-item priority-medium">
              <span className="suggestion-icon">📚</span>
              <div className="suggestion-content">
                <div className="suggestion-title">学习中的单词较多</div>
                <div className="suggestion-desc">
                  建议增加复习频率，帮助这些单词尽快达到掌握水平
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MasteryAnalysis;
