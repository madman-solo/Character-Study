import ChildCarousel from './ChildCarousel';
import ChildCard from './ChildCard';
import '../../../styles/ChildStageCss/SVIPSection.css';

const SVIPSection = () => {
  const svipBanners = [
    { id: '1', image: 'https://via.placeholder.com/1200x300/FF6B6B/FFFFFF?text=SVIP+精品课程1', title: 'SVIP 精品课程' },
    { id: '2', image: 'https://via.placeholder.com/1200x300/4ECDC4/FFFFFF?text=SVIP+精品课程2', title: 'SVIP 专属内容' },
    { id: '3', image: 'https://via.placeholder.com/1200x300/FFE66D/333333?text=SVIP+精品课程3', title: 'SVIP 特色教学' },
  ];

  const svipCourses = [
    { id: '1', image: 'https://via.placeholder.com/400x200/95E1D3/FFFFFF?text=分级课程1', title: '初级课程' },
    { id: '2', image: 'https://via.placeholder.com/400x200/F38181/FFFFFF?text=分级课程2', title: '中级课程' },
    { id: '3', image: 'https://via.placeholder.com/400x200/AA96DA/FFFFFF?text=分级课程3', title: '高级课程' },
  ];

  const svipCategories = [
    { id: '1', icon: '👑', title: 'VIP专属', description: '会员专享内容' },
    { id: '2', icon: '🎯', title: '精品课程', description: '名师精讲' },
    { id: '3', icon: '🏆', title: '进阶训练', description: '能力提升' },
    { id: '4', icon: '💎', title: '特色教材', description: '独家资源' },
  ];

  return (
    <div className="child-svip-section">
      <div className="child-svip-banner">
        <ChildCarousel items={svipBanners} height="300px" autoPlayInterval={4000} />
      </div>

      <div className="child-svip-courses">
        <h2 className="child-svip-title">SVIP 分级课程</h2>
        <ChildCarousel items={svipCourses} height="200px" autoPlayInterval={3500} />
      </div>

      <div className="child-svip-categories">
        <h2 className="child-svip-title">课程分类</h2>
        <div className="child-svip-grid">
          {svipCategories.map((item) => (
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
    </div>
  );
};

export default SVIPSection;
