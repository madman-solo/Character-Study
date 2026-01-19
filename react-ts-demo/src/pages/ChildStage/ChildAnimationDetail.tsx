import { useParams, useNavigate } from 'react-router-dom';
import ChildCard from './components/ChildCard';
import '../../styles/ChildStageCss/ChildAnimationDetail.css';

const ChildAnimationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const characterData: Record<string, { icon: string; name: string; description: string }> = {
    '1': { icon: '🐻', name: '小熊贝贝', description: '可爱的小熊，喜欢帮助朋友，最爱吃蜂蜜' },
    '2': { icon: '🐰', name: '兔子莉莉', description: '活泼的兔子，跑得很快，喜欢吃胡萝卜' },
    '3': { icon: '🐱', name: '小猫咪咪', description: '聪明的小猫，爱干净，喜欢晒太阳' },
    '4': { icon: '🐶', name: '小狗旺旺', description: '忠诚的小狗，看家本领强，最爱玩飞盘' },
    '5': { icon: '🦁', name: '狮子王', description: '勇敢的狮子，森林之王，保护大家' },
    '6': { icon: '🐼', name: '熊猫胖胖', description: '憨厚的熊猫，爱吃竹子，喜欢睡觉' },
  };

  const character = characterData[id || '1'];

  const videos = [
    { id: '1', icon: '🎬', title: '第1集：认识新朋友', description: '学习打招呼' },
    { id: '2', icon: '🎬', title: '第2集：快乐的一天', description: '学习日常用语' },
    { id: '3', icon: '🎬', title: '第3集：美味的食物', description: '学习食物单词' },
    { id: '4', icon: '🎬', title: '第4集：有趣的游戏', description: '学习游戏词汇' },
  ];

  return (
    <div className="child-detail-container">
      <button className="child-back-button" onClick={() => navigate(-1)}>
        ← 返回
      </button>

      <div className="child-detail-header">
        <div className="child-detail-icon">{character.icon}</div>
        <h1 className="child-detail-name">{character.name}</h1>
        <p className="child-detail-description">{character.description}</p>
      </div>

      <div className="child-detail-content">
        <h2 className="child-detail-title">精彩视频</h2>
        <div className="child-detail-grid">
          {videos.map((video) => (
            <ChildCard
              key={video.id}
              icon={video.icon}
              title={video.title}
              description={video.description}
              onClick={() => console.log(`播放：${video.title}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChildAnimationDetail;
