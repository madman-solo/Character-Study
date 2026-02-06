/**
 * 互动游戏页面
 * 玩游戏学英语
 */

import { useNavigate } from "react-router-dom";
import "../../../styles/ChildStageCss/GamesPage.css";

interface Game {
  id: string;
  title: string;
  description: string;
  icon: string;
  players: string;
  duration: string;
}

const GamesPage = () => {
  const navigate = useNavigate();

  const games: Game[] = [
    {
      id: "1",
      title: "单词配对",
      description: "将英文单词与对应的图片配对",
      icon: "🎯",
      players: "1人",
      duration: "5分钟",
    },
    {
      id: "2",
      title: "字母拼图",
      description: "拼出正确的英文单词",
      icon: "🧩",
      players: "1人",
      duration: "10分钟",
    },
    {
      id: "3",
      title: "记忆翻牌",
      description: "翻开卡片找到相同的单词",
      icon: "🃏",
      players: "1-2人",
      duration: "8分钟",
    },
    {
      id: "4",
      title: "单词接龙",
      description: "根据首字母接单词",
      icon: "🔗",
      players: "1-4人",
      duration: "15分钟",
    },
    {
      id: "5",
      title: "听音辨词",
      description: "听发音选择正确的单词",
      icon: "👂",
      players: "1人",
      duration: "10分钟",
    },
    {
      id: "6",
      title: "拼写挑战",
      description: "在限时内拼写更多单词",
      icon: "⚡",
      players: "1人",
      duration: "5分钟",
    },
    {
      id: "7",
      title: "句子排序",
      description: "将打乱的单词排成正确的句子",
      icon: "📝",
      players: "1人",
      duration: "12分钟",
    },
    {
      id: "8",
      title: "英语大富翁",
      description: "边玩大富翁边学英语",
      icon: "🎲",
      players: "2-4人",
      duration: "20分钟",
    },
  ];

  const handleBack = () => {
    navigate("/child-english-home");
  };

  const handleGameClick = (game: Game) => {
    alert(`即将开始游戏: ${game.title}\n功能开发中...`);
  };

  return (
    <div className="games-page">
      {/* 顶部导航 */}
      <div className="games-header">
        <button className="back-btn" onClick={handleBack}>
          ← 返回
        </button>
        <h1 className="page-title">🎮 互动游戏</h1>
        <div className="header-spacer"></div>
      </div>

      {/* 说明 */}
      <div className="games-intro">
        <p>通过有趣的游戏，轻松掌握英语知识！</p>
      </div>

      {/* 游戏网格 */}
      <div className="games-grid">
        {games.map((game) => (
          <div
            key={game.id}
            className="game-card"
            onClick={() => handleGameClick(game)}
          >
            <div className="game-icon">{game.icon}</div>
            <div className="game-info">
              <h3 className="game-title">{game.title}</h3>
              <p className="game-description">{game.description}</p>
              <div className="game-meta">
                <span>👥 {game.players}</span>
                <span>⏱️ {game.duration}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GamesPage;
