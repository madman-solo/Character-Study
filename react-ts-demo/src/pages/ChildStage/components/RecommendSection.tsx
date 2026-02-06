import { useNavigate } from 'react-router-dom';
import ChildCard from './ChildCard';
import DailyTasks from './DailyTasks';
import type { LearningData } from '../../../hooks/useChildLearning';
import type { RewardData } from '../../../hooks/useChildRewards';
import '../../../styles/ChildStageCss/RecommendSection.css';

interface RecommendSectionProps {
  learningData?: LearningData | null;
  rewardData?: RewardData | null;
  animationsEnabled?: boolean;
  onTaskComplete?: (taskId: string, points: number, taskName: string) => void;
}

const RecommendSection: React.FC<RecommendSectionProps> = ({
  learningData,
  rewardData,
  animationsEnabled = true,
  onTaskComplete,
}) => {
  const navigate = useNavigate();

  const recommendItems = [
    { id: '1', icon: '🎨', title: '趣味涂色', description: '边涂色边学单词', path: '/child-coloring' },
    { id: '2', icon: '🎵', title: '英文儿歌', description: '唱歌学英语', path: '/child-songs' },
    { id: '3', icon: '📖', title: '绘本故事', description: '听故事学英语', path: '/child-stories' },
    { id: '4', icon: '🎮', title: '互动游戏', description: '玩游戏学英语', path: '/child-games' },
    { id: '5', icon: '🌟', title: '每日一词', description: '每天学习新单词', path: '/child-daily-word' },
    { id: '6', icon: '🎭', title: '角色扮演', description: '情景对话练习', path: '/child-role-play' },
  ];

  const handleCardClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="child-recommend-section">
      {/* 每日任务 */}
      {learningData && rewardData && (
        <DailyTasks
          learningData={learningData}
          rewardData={rewardData}
          animationsEnabled={animationsEnabled}
          onTaskComplete={onTaskComplete}
        />
      )}

      {/* 推荐内容 */}
      <div className="child-recommend-grid">
        {recommendItems.map((item) => (
          <ChildCard
            key={item.id}
            icon={item.icon}
            title={item.title}
            description={item.description}
            onClick={() => handleCardClick(item.path)}
          />
        ))}
      </div>
    </div>
  );
};

export default RecommendSection;
