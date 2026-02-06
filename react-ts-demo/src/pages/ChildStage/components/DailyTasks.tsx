/**
 * 每日任务组件
 * 展示每日学习任务和完成进度
 */

import React, { useEffect, useRef } from 'react';
import type { LearningData } from '../../../hooks/useChildLearning';
import type { RewardData } from '../../../hooks/useChildRewards';
import './DailyTasks.css';

interface Task {
  id: string;
  title: string;
  description: string;
  icon: string;
  target: number;
  current: number;
  points: number;
  completed: boolean;
}

interface DailyTasksProps {
  learningData: LearningData | null;
  rewardData: RewardData | null;
  animationsEnabled?: boolean;
  onTaskComplete?: (taskId: string, points: number, taskName: string) => void;
}

const DailyTasks: React.FC<DailyTasksProps> = ({
  learningData,
  rewardData,
  animationsEnabled = true,
  onTaskComplete,
}) => {
  // 使用 ref 跟踪上一次的任务完成状态
  const prevTasksRef = useRef<{ [key: string]: boolean }>({});

  const today = new Date().toISOString().split('T')[0];
  const todayStudyTime = learningData?.dailyStudyTime[today] || 0;
  const todayMasteredWords = learningData?.dailyMasteredWords?.[today] || 0;
  const todayInteractions = learningData?.dailyInteractions?.[today] || 0;
  const todayAnswers = learningData?.dailyAnswers?.[today] || 0;

  // 定义每日任务
  const tasks: Task[] = [
    {
      id: 'daily_login',
      title: '每日登录',
      description: '今天已登录学习',
      icon: '🎯',
      target: 1,
      current: 1,
      points: 10,
      completed: rewardData?.lastDailyLoginReward === today,
    },
    {
      id: 'study_10min',
      title: '学习10分钟',
      description: '累计学习时长达到10分钟',
      icon: '⏰',
      target: 10,
      current: Math.min(todayStudyTime, 10),
      points: 20,
      completed: todayStudyTime >= 10,
    },
    {
      id: 'master_3words',
      title: '掌握3个单词',
      description: '今天掌握3个新单词',
      icon: '📚',
      target: 3,
      current: Math.min(todayMasteredWords, 3),
      points: 30,
      completed: todayMasteredWords >= 3,
    },
    {
      id: 'interact_2times',
      title: '互动2次',
      description: '完成2次角色互动',
      icon: '💬',
      target: 2,
      current: Math.min(todayInteractions, 2),
      points: 15,
      completed: todayInteractions >= 2,
    },
    {
      id: 'answer_5questions',
      title: '答题5次',
      description: '完成5次答题练习',
      icon: '✍️',
      target: 5,
      current: Math.min(todayAnswers, 5),
      points: 25,
      completed: todayAnswers >= 5,
    },
  ];

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalPoints = tasks.reduce((sum, t) => sum + (t.completed ? t.points : 0), 0);
  const progress = (completedCount / tasks.length) * 100;

  // 自动检测任务完成并奖励积分
  useEffect(() => {
    if (!onTaskComplete || !learningData || !rewardData) return;

    tasks.forEach((task) => {
      const wasCompleted = prevTasksRef.current[task.id] || false;
      const isCompleted = task.completed;

      // 如果任务从未完成变为完成，奖励积分
      if (!wasCompleted && isCompleted) {
        console.log(`🎯 检测到任务完成: ${task.title}`);
        onTaskComplete(task.id, task.points, task.title);
      }

      // 更新跟踪状态
      prevTasksRef.current[task.id] = isCompleted;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todayStudyTime, todayMasteredWords, todayInteractions, todayAnswers, rewardData?.lastDailyLoginReward, onTaskComplete]);

  if (!learningData || !rewardData) {
    return null;
  }

  return (
    <div
      className={`daily-tasks ${
        animationsEnabled ? 'child-animate-slide-up' : ''
      }`}
    >
      <div className="daily-tasks-header">
        <h3 className="daily-tasks-title">📅 每日任务</h3>
        <div className="daily-tasks-summary">
          <span className="tasks-completed">
            {completedCount}/{tasks.length}
          </span>
          <span className="tasks-points">+{totalPoints} 积分</span>
        </div>
      </div>

      <div className="daily-tasks-progress">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="progress-text">{progress.toFixed(0)}%</span>
      </div>

      <div className="daily-tasks-list">
        {tasks.map((task, index) => (
          <div
            key={task.id}
            className={`task-item ${task.completed ? 'completed' : ''} ${
              animationsEnabled ? 'child-animate-slide-left' : ''
            }`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="task-icon">{task.icon}</div>

            <div className="task-info">
              <h4 className="task-title">{task.title}</h4>
              <p className="task-description">{task.description}</p>

              <div className="task-progress">
                <div className="task-progress-bar">
                  <div
                    className="task-progress-fill"
                    style={{
                      width: `${(task.current / task.target) * 100}%`,
                    }}
                  />
                </div>
                <span className="task-progress-text">
                  {task.current}/{task.target}
                </span>
              </div>
            </div>

            <div className="task-reward">
              {task.completed ? (
                <div className="task-completed-badge child-animate-badge-unlock">
                  ✓
                </div>
              ) : (
                <div className="task-points">+{task.points}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {completedCount === tasks.length && (
        <div
          className={`daily-tasks-complete ${
            animationsEnabled ? 'child-animate-confetti' : ''
          }`}
        >
          <div className="complete-message">
            🎉 恭喜完成所有每日任务！
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyTasks;
