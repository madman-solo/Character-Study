import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  getUserCharacters,
  deleteCharacter,
  setDefaultCharacter,
} from "../services/characterService";
import type { CustomCharacter } from "../services/characterService";
import "../styles/CharacterSelectionPage.css";

const CharacterSelectionPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id || "guest";

  const [characters, setCharacters] = useState<CustomCharacter[]>([]);
  const [loading, setLoading] = useState(true);

  // 加载角色列表
  const loadCharacters = async () => {
    try {
      setLoading(true);
      const data = await getUserCharacters(userId);
      setCharacters(data);
    } catch (error) {
      console.error("加载角色列表失败:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCharacters();
  }, [userId]);

  // 选择角色进入对话
  const handleSelectCharacter = (character: CustomCharacter) => {
    navigate("/custom-companion-chat", {
      state: {
        character,
        // 保留原有的setup结构以兼容
        userIdentity: "用户",
        userName: user?.username || "未设置",
        userStory: "",
        companionIdentity: character.name,
        companionName: character.name,
        companionStory: character.background || "",
        backgroundStory: "",
        background: "default",
      },
    });
  };

  // 创建新角色
  const handleCreateNew = () => {
    navigate("/character-creation");
  };

  // 编辑角色 - 跳转到创建页面并传递角色数据
  const handleEditCharacter = (character: CustomCharacter) => {
    navigate("/character-creation", { state: { character } });
  };

  // 删除角色
  const handleDeleteCharacter = async (character: CustomCharacter) => {
    if (window.confirm(`确定要删除角色"${character.name}"吗？`)) {
      try {
        await deleteCharacter(character.id);
        await loadCharacters();
      } catch (error) {
        console.error("删除角色失败:", error);
        alert("删除角色失败，请重试");
      }
    }
  };

  // 设置默认角色
  const handleSetDefault = async (character: CustomCharacter) => {
    try {
      await setDefaultCharacter(character.id, userId);
      await loadCharacters();
    } catch (error) {
      console.error("设置默认角色失败:", error);
      alert("设置默认角色失败，请重试");
    }
  };

  if (loading) {
    return (
      <div className="character-selection-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="character-selection-page">
      <div className="selection-container">
        <div className="selection-header">
          <button className="back-btn" onClick={() => navigate("/")}>
            ← 返回
          </button>
          <h1>选择角色</h1>
          <p className="subtitle">选择一个角色开始对话，或创建新角色</p>
        </div>

        <div className="characters-grid">
          {/* 创建新角色卡片 */}
          <div className="character-card create-card" onClick={handleCreateNew}>
            <div className="create-icon">+</div>
            <h3>创建新角色</h3>
            <p>自定义你的专属AI伙伴</p>
          </div>

          {/* 角色列表 */}
          {characters.map((character) => (
            <div key={character.id} className="character-card">
              <div className="card-header">
                {character.isDefault && (
                  <span className="default-badge">默认</span>
                )}
                <div className="card-actions">
                  <button
                    className="icon-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditCharacter(character);
                    }}
                    title="编辑"
                  >
                    ✏️
                  </button>
                  {!character.isDefault && (
                    <button
                      className="icon-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetDefault(character);
                      }}
                      title="设为默认"
                    >
                      ⭐
                    </button>
                  )}
                  <button
                    className="icon-btn delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCharacter(character);
                    }}
                    title="删除"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div
                className="card-body"
                onClick={() => handleSelectCharacter(character)}
              >
                <div className="character-avatar-large">
                  {character.avatar ? (
                    <img src={character.avatar} alt={character.name} />
                  ) : (
                    <div className="avatar-placeholder-large">
                      {character.name[0]}
                    </div>
                  )}
                </div>

                <h3 className="character-name">{character.name}</h3>

                <div className="character-meta">
                  <span className="meta-item">
                    {character.gender === "male"
                      ? "♂"
                      : character.gender === "female"
                        ? "♀"
                        : "⚧"}
                  </span>
                  {character.age && (
                    <span className="meta-item">{character.age}</span>
                  )}
                </div>

                <p className="character-personality">{character.personality}</p>

                {character.traits.length > 0 && (
                  <div className="character-traits">
                    {character.traits.slice(0, 3).map((trait, index) => (
                      <span key={index} className="trait-tag">
                        {trait}
                      </span>
                    ))}
                    {character.traits.length > 3 && (
                      <span className="trait-tag">
                        +{character.traits.length - 3}
                      </span>
                    )}
                  </div>
                )}

                <button className="select-btn">开始对话 →</button>
              </div>
            </div>
          ))}
        </div>

        {characters.length === 0 && (
          <div className="empty-state">
            <p>还没有角色，创建第一个吧！</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CharacterSelectionPage;
