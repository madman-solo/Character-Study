/**
 * LearningReport Component
 * 学习报告组件 - 展示每日、每周、每月学习报告
 */

import { useState, useEffect } from 'react';
import './LearningReport.css';

// 报告类型
export type ReportType = 'daily' | 'weekly' | 'monthly';

// 成就接口
interface Achievement {
  type: string;
  title: string;
  description: string;
  icon: string;
}

// 建议接口
interface Suggestion {
  type: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  icon: string;
}

// 每日报告接口
interface DailyReport {
  date: string;
  studyTime: number;
  newWords: number;
  accuracy: number;
  consecutiveDays: number;
  summary: string;
}

// 每周报告接口
interface WeeklyReport {
  weekStart: string;
  weekEnd: string;
  totalStudyTime: number;
  activeDays: number;
  totalNewWords: number;
  masteredWordsCount: number;
  weakWordsCount: number;
  avgAccuracy: number;
  consecutiveDays: number;
  achievements: Achievement[];
  suggestions: Suggestion[];
  summary: string;
}

// 每月报告接口
interface MonthlyReport {
  month: string;
  monthStart: string;
  monthEnd: string;
  totalStudyTime: number;
  activeDays: number;
  totalNewWords: number;
  masteredWordsCount: number;
  weakWordsCount: number;
  avgAccuracy: number;
  avgDailyTime: number;
  longestStreak: number;
  achievements: Achievement[];
  suggestions: Suggestion[];
  summary: string;
}

// 组件属性接口
interface LearningReportProps {
  userId: string;
  reportType: ReportType;
  date?: string; // For daily report (YYYY-MM-DD)
  weekStart?: string; // For weekly report (YYYY-MM-DD)
  month?: string; // For monthly report (YYYY-MM)
  onClose?: () => void;
  onExport?: () => void;
}

const LearningReport: React.FC<LearningReportProps> = ({
  userId,
  reportType,
  date,
  weekStart,
  month,
  onClose,
  onExport,
}) => {
  const [report, setReport] = useState<DailyReport | WeeklyReport | MonthlyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReport();
  }, [userId, reportType, date, weekStart, month]);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);

    try {
      let url = `http://localhost:3001/api/reports/${reportType}/${userId}`;
      const params = new URLSearchParams();

      if (reportType === 'daily' && date) {
        params.append('date', date);
      } else if (reportType === 'weekly' && weekStart) {
        params.append('weekStart', weekStart);
      } else if (reportType === 'monthly' && month) {
        params.append('month', month);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setReport(data.report);
      } else {
        setError(data.error || '获取报告失败');
      }
    } catch (err) {
      console.error('Error fetching report:', err);
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const renderDailyReport = (report: DailyReport) => (
    <div className="report-content">
      <div className="report-header">
        <h3 className="report-title">📅 每日学习报告</h3>
        <p className="report-date">{report.date}</p>
      </div>

      <div className="report-summary">
        <p className="summary-text">{report.summary}</p>
      </div>

      <div className="report-stats">
        <div className="stat-card">
          <div className="stat-icon">⏰</div>
          <div className="stat-info">
            <div className="stat-label">学习时长</div>
            <div className="stat-value">{report.studyTime}分钟</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-info">
            <div className="stat-label">新学单词</div>
            <div className="stat-value">{report.newWords}个</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-info">
            <div className="stat-label">答题准确率</div>
            <div className="stat-value">{report.accuracy}%</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-info">
            <div className="stat-label">连续打卡</div>
            <div className="stat-value">{report.consecutiveDays}天</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderWeeklyReport = (report: WeeklyReport) => (
    <div className="report-content">
      <div className="report-header">
        <h3 className="report-title">📊 每周学习报告</h3>
        <p className="report-date">
          {report.weekStart} 至 {report.weekEnd}
        </p>
      </div>

      <div className="report-summary">
        <p className="summary-text">{report.summary}</p>
      </div>

      <div className="report-stats">
        <div className="stat-card">
          <div className="stat-icon">⏰</div>
          <div className="stat-info">
            <div className="stat-label">总学习时长</div>
            <div className="stat-value">{report.totalStudyTime}分钟</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-info">
            <div className="stat-label">活跃天数</div>
            <div className="stat-value">{report.activeDays}天</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-info">
            <div className="stat-label">新学单词</div>
            <div className="stat-value">{report.totalNewWords}个</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-info">
            <div className="stat-label">平均准确率</div>
            <div className="stat-value">{report.avgAccuracy}%</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <div className="stat-label">掌握单词</div>
            <div className="stat-value">{report.masteredWordsCount}个</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⚠️</div>
          <div className="stat-info">
            <div className="stat-label">薄弱单词</div>
            <div className="stat-value">{report.weakWordsCount}个</div>
          </div>
        </div>
      </div>

      {/* 成就展示 */}
      {report.achievements && report.achievements.length > 0 && (
        <div className="report-section">
          <h4 className="section-title">🏆 本周成就</h4>
          <div className="achievements-list">
            {report.achievements.map((achievement, index) => (
              <div key={index} className="achievement-card">
                <div className="achievement-icon">{achievement.icon}</div>
                <div className="achievement-info">
                  <div className="achievement-title">{achievement.title}</div>
                  <div className="achievement-desc">{achievement.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 改进建议 */}
      {report.suggestions && report.suggestions.length > 0 && (
        <div className="report-section">
          <h4 className="section-title">💡 改进建议</h4>
          <div className="suggestions-list">
            {report.suggestions.map((suggestion, index) => (
              <div
                key={index}
                className={`suggestion-card priority-${suggestion.priority}`}
              >
                <div className="suggestion-icon">{suggestion.icon}</div>
                <div className="suggestion-info">
                  <div className="suggestion-title">{suggestion.title}</div>
                  <div className="suggestion-desc">{suggestion.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderMonthlyReport = (report: MonthlyReport) => (
    <div className="report-content">
      <div className="report-header">
        <h3 className="report-title">📈 每月学习报告</h3>
        <p className="report-date">{report.month}</p>
      </div>

      <div className="report-summary">
        <p className="summary-text">{report.summary}</p>
      </div>

      <div className="report-stats">
        <div className="stat-card">
          <div className="stat-icon">⏰</div>
          <div className="stat-info">
            <div className="stat-label">总学习时长</div>
            <div className="stat-value">{report.totalStudyTime}分钟</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-info">
            <div className="stat-label">活跃天数</div>
            <div className="stat-value">{report.activeDays}天</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-info">
            <div className="stat-label">平均每日</div>
            <div className="stat-value">{report.avgDailyTime}分钟</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-info">
            <div className="stat-label">新学单词</div>
            <div className="stat-value">{report.totalNewWords}个</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <div className="stat-label">掌握单词</div>
            <div className="stat-value">{report.masteredWordsCount}个</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-info">
            <div className="stat-label">平均准确率</div>
            <div className="stat-value">{report.avgAccuracy}%</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-info">
            <div className="stat-label">最长连续</div>
            <div className="stat-value">{report.longestStreak}天</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⚠️</div>
          <div className="stat-info">
            <div className="stat-label">薄弱单词</div>
            <div className="stat-value">{report.weakWordsCount}个</div>
          </div>
        </div>
      </div>

      {/* 成就展示 */}
      {report.achievements && report.achievements.length > 0 && (
        <div className="report-section">
          <h4 className="section-title">🏆 本月成就</h4>
          <div className="achievements-list">
            {report.achievements.map((achievement, index) => (
              <div key={index} className="achievement-card">
                <div className="achievement-icon">{achievement.icon}</div>
                <div className="achievement-info">
                  <div className="achievement-title">{achievement.title}</div>
                  <div className="achievement-desc">{achievement.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 改进建议 */}
      {report.suggestions && report.suggestions.length > 0 && (
        <div className="report-section">
          <h4 className="section-title">💡 改进建议</h4>
          <div className="suggestions-list">
            {report.suggestions.map((suggestion, index) => (
              <div
                key={index}
                className={`suggestion-card priority-${suggestion.priority}`}
              >
                <div className="suggestion-icon">{suggestion.icon}</div>
                <div className="suggestion-info">
                  <div className="suggestion-title">{suggestion.title}</div>
                  <div className="suggestion-desc">{suggestion.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="learning-report">
        <div className="report-loading">
          <div className="loading-spinner"></div>
          <p>正在生成报告...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="learning-report">
        <div className="report-error">
          <p className="error-icon">⚠️</p>
          <p className="error-message">{error}</p>
          <button className="retry-btn" onClick={fetchReport}>
            重试
          </button>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="learning-report">
        <div className="report-empty">
          <p>暂无报告数据</p>
        </div>
      </div>
    );
  }

  return (
    <div className="learning-report">
      {reportType === 'daily' && renderDailyReport(report as DailyReport)}
      {reportType === 'weekly' && renderWeeklyReport(report as WeeklyReport)}
      {reportType === 'monthly' && renderMonthlyReport(report as MonthlyReport)}

      {/* 操作按钮 */}
      <div className="report-actions">
        {onExport && (
          <button className="action-btn export-btn" onClick={onExport}>
            📤 导出报告
          </button>
        )}
        {onClose && (
          <button className="action-btn close-btn" onClick={onClose}>
            关闭
          </button>
        )}
      </div>
    </div>
  );
};

export default LearningReport;
