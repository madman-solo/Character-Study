import ChildCard from './ChildCard';
import '../../../styles/ChildStageCss/RecommendSection.css';

const RecommendSection = () => {
  const recommendItems = [
    { id: '1', icon: '🎨', title: '趣味涂色', description: '边涂色边学单词' },
    { id: '2', icon: '🎵', title: '英文儿歌', description: '唱歌学英语' },
    { id: '3', icon: '📖', title: '绘本故事', description: '听故事学英语' },
    { id: '4', icon: '🎮', title: '互动游戏', description: '玩游戏学英语' },
    { id: '5', icon: '🌟', title: '每日一词', description: '每天学习新单词' },
    { id: '6', icon: '🎭', title: '角色扮演', description: '情景对话练习' },
  ];

  return (
    <div className="child-recommend-section">
      <div className="child-recommend-grid">
        {recommendItems.map((item) => (
          <ChildCard
            key={item.id}
            icon={item.icon}
            title={item.title}
            description={item.description}
            onClick={() => console.log(`点击了：${item.title}`)}
          />
        ))}
      </div>
    </div>
  );
};

export default RecommendSection;
