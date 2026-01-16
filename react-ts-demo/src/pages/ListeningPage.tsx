import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ListeningPage.css";

type ListeningTab = "extensive" | "intensive" | "speaking";

// 模拟素材数据
interface Material {
  id: string;
  title: string;
  duration?: string;
  level: string;
  thumbnail?: string;
}

const mockExtensiveMaterials: Material[] = [
  {
    id: "1",
    title: "Daily English Conversation",
    duration: "5:30",
    level: "初级",
  },
  {
    id: "2",
    title: "Business English Basics",
    duration: "8:15",
    level: "中级",
  },
  { id: "3", title: "Travel English", duration: "6:45", level: "初级" },
  { id: "4", title: "Academic English", duration: "10:20", level: "高级" },
];

const mockIntensiveMaterials: Material[] = [
  { id: "1", title: "Pronunciation Practice", duration: "4:20", level: "初级" },
  { id: "2", title: "Grammar in Context", duration: "7:30", level: "中级" },
  { id: "3", title: "Idioms and Phrases", duration: "5:50", level: "中级" },
];

const ListeningPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ListeningTab>("extensive");
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [intensiveMode, setIntensiveMode] = useState<"audio" | "textbook">(
    "audio"
  );

  const handleSpeakingClick = () => {
    navigate("/speaking");
  };

  const filteredExtensiveMaterials = mockExtensiveMaterials.filter((material) =>
    material.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredIntensiveMaterials = mockIntensiveMaterials.filter((material) =>
    material.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="listening-page">
      {/* 左侧导航栏 */}
      <div className={`listening-sidebar ${isNavCollapsed ? "collapsed" : ""}`}>
        <div className="sidebar-header">
          <h2>{!isNavCollapsed && "听力口语"}</h2>
          <button
            className="collapse-button"
            onClick={() => setIsNavCollapsed(!isNavCollapsed)}
          >
            {isNavCollapsed ? "→" : "←"}
          </button>
        </div>

        {!isNavCollapsed && (
          <>
            <div className="sidebar-tabs">
              <button
                className={`tab-button ${
                  activeTab === "extensive" ? "active" : ""
                }`}
                onClick={() => setActiveTab("extensive")}
              >
                <span className="tab-icon">🎵</span>
                <span>泛听</span>
              </button>
              <button
                className={`tab-button ${
                  activeTab === "intensive" ? "active" : ""
                }`}
                onClick={() => setActiveTab("intensive")}
              >
                <span className="tab-icon">🎯</span>
                <span>精听</span>
              </button>
              <button
                className={`tab-button ${
                  activeTab === "speaking" ? "active" : ""
                }`}
                onClick={handleSpeakingClick}
              >
                <span className="tab-icon">🎤</span>
                <span>口语</span>
              </button>
            </div>

            <button className="back-home-button" onClick={() => navigate("/")}>
              返回首页
            </button>
          </>
        )}
      </div>

      {/* 右侧内容区 */}
      <div className="listening-content">
        {activeTab === "extensive" && (
          <div className="extensive-section">
            <div className="search-bar">
              <input
                type="text"
                placeholder="搜索泛听素材..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button className="search-button">🔍</button>
            </div>

            <div className="materials-list">
              {filteredExtensiveMaterials.map((material) => (
                <div key={material.id} className="material-card">
                  <div className="material-thumbnail">
                    <div className="play-icon">▶</div>
                  </div>
                  <div className="material-info">
                    <h3 className="material-title">{material.title}</h3>
                    <div className="material-meta">
                      <span className="material-duration">
                        ⏱ {material.duration}
                      </span>
                      <span className="material-level">{material.level}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "intensive" && (
          <div className="intensive-section">
            <div className="intensive-header">
              <div className="header-image">
                <img
                  src="../../public/drawing-7821641_1280.jpg"
                  alt="Intensive Listening"
                />
              </div>

              <div className="mode-selector">
                <button
                  className={`mode-button ${
                    intensiveMode === "audio" ? "active" : ""
                  }`}
                  onClick={() => setIntensiveMode("audio")}
                >
                  精听原声
                </button>
                <button
                  className={`mode-button ${
                    intensiveMode === "textbook" ? "active" : ""
                  }`}
                  onClick={() => setIntensiveMode("textbook")}
                >
                  精听课本
                </button>
              </div>
            </div>

            <div className="materials-list">
              {filteredIntensiveMaterials.map((material) => (
                <div key={material.id} className="material-card intensive">
                  <div className="material-thumbnail">
                    <div className="play-icon">▶</div>
                  </div>
                  <div className="material-info">
                    <h3 className="material-title">{material.title}</h3>
                    <div className="material-meta">
                      <span className="material-duration">
                        ⏱ {material.duration}
                      </span>
                      <span className="material-level">{material.level}</span>
                    </div>
                  </div>
                  <div className="material-mode-badge">
                    {intensiveMode === "audio" ? "原声" : "课本"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListeningPage;
