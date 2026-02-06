/**
 * Learning Charts Component
 * 学习曲线图表组件 - 使用Recharts展示学习数据
 */

import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { analyzeMasteryDistribution, type WordProgress } from '../../../utils/masteryAnalysis';
import type { LearningData } from '../../../hooks/useChildLearning';

interface LearningChartsProps {
  learningData: LearningData;
  wordProgressList?: WordProgress[];
  timeRange?: '7days' | '30days' | '90days';
  onTimeRangeChange?: (range: '7days' | '30days' | '90days') => void;
}

const COLORS = {
  mastered: '#4ECDC4',
  proficient: '#95E1D3',
  learning: '#FFE66D',
  struggling: '#FFA07A',
  new: '#FF6B6B'
};

export const LearningCharts: React.FC<LearningChartsProps> = ({
  learningData,
  wordProgressList = [],
  timeRange = '7days',
  onTimeRangeChange
}) => {
  // 准备每日学习时长数据
  const studyTimeData = useMemo(() => {
    const days = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : 90;
    const data = [];
    const today = new Date();
    const dailyStudyTime = learningData.dailyStudyTime || {};

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const studyTime = dailyStudyTime[dateStr] || 0;

      data.push({
        date: `${date.getMonth() + 1}/${date.getDate()}`,
        studyTime,
        target: 15 // 目标学习时长15分钟
      });
    }

    return data;
  }, [learningData.dailyStudyTime, timeRange]);

  // 计算平均学习时长
  const averageStudyTime = useMemo(() => {
    const times = studyTimeData.map(d => d.studyTime);
    const sum = times.reduce((a, b) => a + b, 0);
    return times.length > 0 ? Math.round(sum / times.length) : 0;
  }, [studyTimeData]);

  // 准备单词掌握进度数据
  const masteryProgressData = useMemo(() => {
    const days = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : 90;
    const data = [];
    const today = new Date();
    const dailyMasteredWords = learningData.dailyMasteredWords || {};
    let cumulative = 0;

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dailyMastered = dailyMasteredWords[dateStr] || 0;
      cumulative += dailyMastered;

      data.push({
        date: `${date.getMonth() + 1}/${date.getDate()}`,
        mastered: cumulative
      });
    }

    return data;
  }, [learningData.dailyMasteredWords, timeRange]);

  // 准备答题准确率数据
  const accuracyData = useMemo(() => {
    const days = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : 90;
    const data = [];
    const today = new Date();
    const dailyAccuracy = learningData.dailyAccuracy || {};

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const accuracy = dailyAccuracy[dateStr] || 0;

      data.push({
        date: `${date.getMonth() + 1}/${date.getDate()}`,
        accuracy: Math.round(accuracy)
      });
    }

    return data;
  }, [learningData.dailyAccuracy, timeRange]);

  // 准备掌握度分布数据
  const masteryDistributionData = useMemo(() => {
    if (wordProgressList.length === 0) return [];

    const distribution = analyzeMasteryDistribution(wordProgressList);

    return [
      { name: '已掌握', value: distribution.mastered, color: COLORS.mastered },
      { name: '熟练', value: distribution.proficient, color: COLORS.proficient },
      { name: '学习中', value: distribution.learning, color: COLORS.learning },
      { name: '需加强', value: distribution.struggling, color: COLORS.struggling },
      { name: '新单词', value: distribution.new, color: COLORS.new }
    ].filter(item => item.value > 0);
  }, [wordProgressList]);

  return (
    <div className="learning-charts">
      {/* 时间范围选择器 */}
      <div className="time-range-selector">
        <button
          className={timeRange === '7days' ? 'active' : ''}
          onClick={() => onTimeRangeChange?.('7days')}
        >
          最近7天
        </button>
        <button
          className={timeRange === '30days' ? 'active' : ''}
          onClick={() => onTimeRangeChange?.('30days')}
        >
          最近30天
        </button>
        <button
          className={timeRange === '90days' ? 'active' : ''}
          onClick={() => onTimeRangeChange?.('90days')}
        >
          最近90天
        </button>
      </div>

      {/* 图表1：每日学习时长趋势 */}
      <div className="chart-container">
        <h3>每日学习时长</h3>
        <p className="chart-subtitle">平均: {averageStudyTime}分钟 | 目标: 15分钟</p>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={studyTimeData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="studyTime" stroke="#4ECDC4" name="实际学习" strokeWidth={2} />
            <Line type="monotone" dataKey="target" stroke="#FFE66D" strokeDasharray="5 5" name="目标" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 图表2：单词掌握进度 */}
      <div className="chart-container">
        <h3>单词掌握进度</h3>
        <p className="chart-subtitle">累计掌握: {learningData.masteredWords.length}个单词</p>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={masteryProgressData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="mastered" stroke="#4ECDC4" fill="#4ECDC4" fillOpacity={0.6} name="掌握单词数" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 图表3：答题准确率趋势 */}
      <div className="chart-container">
        <h3>答题准确率</h3>
        <p className="chart-subtitle">总体准确率: {Math.round(learningData.answerHistory.accuracy)}%</p>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={accuracyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Line type="monotone" dataKey="accuracy" stroke="#95E1D3" strokeWidth={2} name="准确率(%)" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 图表4：单词掌握度分布 */}
      {masteryDistributionData.length > 0 && (
        <div className="chart-container">
          <h3>单词掌握度分布</h3>
          <p className="chart-subtitle">共{wordProgressList.length}个单词</p>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={masteryDistributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {masteryDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default LearningCharts;
