import { useNavigate } from 'react-router-dom';
import ChildCard from './ChildCard';
import '../../../styles/ChildStageCss/AnimationSection.css';

const AnimationSection = () => {
  const navigate = useNavigate();

  const animationStars = [
    { id: '1', icon: '🐻', title: '小熊贝贝', description: '可爱的小熊' },
    { id: '2', icon: '🐰', title: '兔子莉莉', description: '活泼的兔子' },
    { id: '3', icon: '🐱', title: '小猫咪咪', description: '聪明的小猫' },
    { id: '4', icon: '🐶', title: '小狗旺旺', description: '忠诚的小狗' },
    { id: '5', icon: '🦁', title: '狮子王', description: '勇敢的狮子' },
    { id: '6', icon: '🐼', title: '熊猫胖胖', description: '憨厚的熊猫' },
  ];

  const animationCategories = [
    { id: '1', icon: '🌈', title: '日常生活', description: '生活场景对话' },
    { id: '2', icon: '🎒', title: '校园故事', description: '学校趣事' },
    { id: '3', icon: '🏡', title: '家庭时光', description: '温馨家庭' },
    { id: '4', icon: '🌳', title: '大自然', description: '探索自然' },
  ];

  const handleStarClick = (id: string) => {
    navigate(`/child-animation-detail/${id}`);
  };

  return (
    <div className="child-animation-section">
      <div className="child-animation-stars">
        <h2 className="child-animation-title">动画明星</h2>
        <div className="child-animation-grid">
          {animationStars.map((star) => (
            <ChildCard
              key={star.id}
              icon={star.icon}
              title={star.title}
              description={star.description}
              onClick={() => handleStarClick(star.id)}
            />
          ))}
        </div>
      </div>

      <div className="child-animation-categories">
        <h2 className="child-animation-title">动画分类</h2>
        <div className="child-animation-grid">
          {animationCategories.map((category) => (
            <ChildCard
              key={category.id}
              icon={category.icon}
              title={category.title}
              description={category.description}
              onClick={() => console.log(`点击了：${category.title}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnimationSection;
