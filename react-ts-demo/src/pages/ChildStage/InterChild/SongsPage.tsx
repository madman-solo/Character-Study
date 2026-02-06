/**
 * 英文儿歌页面
 * 唱歌学英语
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../../styles/ChildStageCss/SongsPage.css";

interface Song {
  id: string;
  title: string;
  artist: string;
  duration: string;
  thumbnail: string;
  difficulty: "easy" | "medium" | "hard";
  lyrics: string;
}

const SongsPage = () => {
  const navigate = useNavigate();
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const songs: Song[] = [
    {
      id: "1",
      title: "ABC Song",
      artist: "Kids Songs",
      duration: "2:30",
      thumbnail: "https://via.placeholder.com/200x200/FF6B6B/FFFFFF?text=ABC",
      difficulty: "easy",
      lyrics:
        "A B C D E F G\nH I J K L M N O P\nQ R S T U V\nW X Y and Z\nNow I know my ABCs\nNext time won't you sing with me?",
    },
    {
      id: "2",
      title: "Twinkle Twinkle Little Star",
      artist: "Nursery Rhymes",
      duration: "3:15",
      thumbnail: "https://via.placeholder.com/200x200/4ECDC4/FFFFFF?text=Star",
      difficulty: "easy",
      lyrics:
        "Twinkle, twinkle, little star\nHow I wonder what you are\nUp above the world so high\nLike a diamond in the sky",
    },
    {
      id: "3",
      title: "Old MacDonald Had a Farm",
      artist: "Farm Songs",
      duration: "3:45",
      thumbnail: "https://via.placeholder.com/200x200/FFE66D/333333?text=Farm",
      difficulty: "medium",
      lyrics:
        "Old MacDonald had a farm, E-I-E-I-O\nAnd on that farm he had a cow, E-I-E-I-O\nWith a moo moo here and a moo moo there",
    },
    {
      id: "4",
      title: "If You're Happy",
      artist: "Action Songs",
      duration: "2:50",
      thumbnail: "https://via.placeholder.com/200x200/C77DFF/FFFFFF?text=Happy",
      difficulty: "medium",
      lyrics:
        "If you're happy and you know it, clap your hands\nIf you're happy and you know it, clap your hands",
    },
    {
      id: "5",
      title: "The Wheels on the Bus",
      artist: "Travel Songs",
      duration: "4:20",
      thumbnail: "https://via.placeholder.com/200x200/4CAF50/FFFFFF?text=Bus",
      difficulty: "hard",
      lyrics:
        "The wheels on the bus go round and round\nRound and round, round and round\nThe wheels on the bus go round and round\nAll through the town",
    },
    {
      id: "6",
      title: "Head Shoulders Knees and Toes",
      artist: "Body Parts Songs",
      duration: "2:40",
      thumbnail: "https://via.placeholder.com/200x200/FF9800/FFFFFF?text=Body",
      difficulty: "hard",
      lyrics:
        "Head, shoulders, knees and toes, knees and toes\nHead, shoulders, knees and toes, knees and toes\nAnd eyes and ears and mouth and nose",
    },
  ];

  const handleBack = () => {
    navigate("/child-english-home");
  };

  const handleSongSelect = (song: Song) => {
    setSelectedSong(song);
    setIsPlaying(false);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "#4CAF50";
      case "medium":
        return "#FF9800";
      case "hard":
        return "#F44336";
      default:
        return "#999";
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "简单";
      case "medium":
        return "中等";
      case "hard":
        return "困难";
      default:
        return "";
    }
  };

  return (
    <div className="songs-page">
      {/* 顶部导航 */}
      <div className="songs-header">
        <button className="back-btn" onClick={handleBack}>
          ← 返回
        </button>
        <h1 className="page-title">🎵 英文儿歌</h1>
        <div className="header-spacer"></div>
      </div>

      {/* 说明 */}
      <div className="songs-intro">
        <p>跟着儿歌一起唱，轻松学英语！</p>
      </div>

      {/* 歌曲列表 */}
      <div className="songs-grid">
        {songs.map((song) => (
          <div
            key={song.id}
            className="song-card"
            onClick={() => handleSongSelect(song)}
          >
            <div className="song-thumbnail">
              <img src={song.thumbnail} alt={song.title} />
              <div className="play-overlay">
                <div className="play-icon">▶</div>
              </div>
              <div
                className="difficulty-badge"
                style={{ background: getDifficultyColor(song.difficulty) }}
              >
                {getDifficultyText(song.difficulty)}
              </div>
            </div>
            <div className="song-info">
              <h3 className="song-title">{song.title}</h3>
              <p className="song-artist">{song.artist}</p>
              <p className="song-duration">⏱️ {song.duration}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 播放模态框 */}
      {selectedSong && (
        <div className="song-modal" onClick={() => setSelectedSong(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setSelectedSong(null)}
            >
              ✕
            </button>
            <div className="modal-thumbnail">
              <img src={selectedSong.thumbnail} alt={selectedSong.title} />
            </div>
            <h2 className="modal-title">{selectedSong.title}</h2>
            <p className="modal-artist">{selectedSong.artist}</p>

            {/* 播放控制 */}
            <div className="player-controls">
              <button className="control-btn">⏮️</button>
              <button className="play-btn" onClick={togglePlay}>
                {isPlaying ? "⏸️" : "▶️"}
              </button>
              <button className="control-btn">⏭️</button>
            </div>

            {/* 歌词 */}
            <div className="lyrics-section">
              <h3 className="lyrics-title">📝 歌词</h3>
              <div className="lyrics-content">{selectedSong.lyrics}</div>
            </div>

            <p className="modal-hint">🎵 音频播放功能开发中</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SongsPage;
