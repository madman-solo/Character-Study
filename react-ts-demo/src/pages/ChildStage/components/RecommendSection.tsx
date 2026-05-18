import { useNavigate } from "react-router-dom";
import ChildCard from "./ChildCard";
import DailyTasks from "./DailyTasks";
import type { LearningData } from "../../../hooks/useChildLearning";
import type { RewardData } from "../../../hooks/useChildRewards";
import "../../../styles/ChildStageCss/RecommendSection.css";

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
    {
      id: "1",
      icon: "/src/assets/iconfont/child/冰淇淋.svg",
      title: "趣味涂色",
      description: "边涂色边学单词",
      path: "/child-coloring",
    },
    {
      id: "2",
      icon: "/src/assets/iconfont/child/听音乐.svg",
      title: "英文儿歌",
      description: "唱歌学英语",
      path: "/child-songs",
    },
    {
      id: "3",
      icon: "/src/assets/iconfont/child/044_绘本.svg",
      title: "绘本故事",
      description: "听故事学英语",
      path: "/child-stories",
    },
    {
      id: "5",
      icon: "/src/assets/iconfont/child/太阳.svg",
      title: "每日一词",
      description: "每天学习新单词",
      path: "/child-daily-word",
    },
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
