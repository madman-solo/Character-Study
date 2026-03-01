import React, { useState, useEffect } from "react";
import {
  getUserCharacters,
  setDefaultCharacter,
  deleteCharacter,
} from "../services/characterService";
import type { CustomCharacter } from "../services/characterService";
import "../styles/CharacterSelector.css";

interface CharacterSelectorProps {
  userId: string;
  onSelectCharacter: (character: CustomCharacter) => void;
  onCreateNew: () => void;
  onEditCharacter: (character: CustomCharacter) => void;
  currentCharacterId?: number;
}

const CharacterSelector: React.FC<CharacterSelectorProps> = ({
  userId,
  onSelectCharacter,
  onCreateNew,
  onEditCharacter,
  currentCharacterId,
}) => {
  const [characters, setCharacters] = useState<CustomCharacter[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    loadCharacters();
  }, [userId]);

  const loadCharacters = async () => {
    try {
      setLoading(true);
      const data = await getUserCharacters(userId);
      setCharacters(data);

      // 如果没有选中角色，自动选择默认角色
      if (!currentCharacterId && data.length > 0) {
        const defaultChar = data.find((c) => c.isDefault) || data[0];
        onSelectCharacter(defaultChar);
      }
    } catch (error) {
      console.error("加载角色列表失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (characterId: number) => {
    try {
      await setDefaultCharacter(characterId, userId);
      await loadCharacters();
    } catch (error) {
      console.error("设置默认角色失败:", error);
      alert("设置默认角色失败");
    }
  };

  const handleDelete = async (characterId: number) => {
    if (!confirm("确定要删除这个角色吗？")) return;

    try {
      await deleteCharacter(characterId);
      await loadCharacters();
    } catch (error) {
      console.error("删除角色失败:", error);
      alert("删除角色失败");
    }
  };

  const currentCharacter = characters.find((c) => c.id === currentCharacterId);

  if (loading) {
    return <div className="character-selector loading">加载中...</div>;
  }

  return (
    <div className="character-selector">
      {/* 当前角色显示 */}
      <div className="current-character" onClick={() => setShowMenu(!showMenu)}>
        <div className="character-avatar">
          {currentCharacter?.avatar ? (
            <img src={currentCharacter.avatar} alt={currentCharacter.name} />
          ) : (
            <div className="avatar-placeholder">
              {currentCharacter?.name?.[0] || "?"}
            </div>
          )}
        </div>
        <div className="character-info">
          <div className="character-name">
            {currentCharacter?.name || "选择角色"}
          </div>
          <div className="character-personality">
            {currentCharacter?.personality || "点击选择或创建角色"}
          </div>
        </div>
        <div className="dropdown-icon">{showMenu ? "▲" : "▼"}</div>
      </div>

      {/* 角色列表菜单 */}
      {showMenu && (
        <div className="character-menu">
          <div className="character-list">
            {characters.map((character) => (
              <div
                key={character.id}
                className={`character-item ${character.id === currentCharacterId ? "active" : ""}`}
              >
                <div
                  className="character-item-main"
                  onClick={() => {
                    onSelectCharacter(character);
                    setShowMenu(false);
                  }}
                >
                  <div className="character-avatar-small">
                    {character.avatar ? (
                      <img src={character.avatar} alt={character.name} />
                    ) : (
                      <div className="avatar-placeholder-small">
                        {character.name[0]}
                      </div>
                    )}
                  </div>
                  <div className="character-item-info">
                    <div className="character-item-name">
                      {character.name}
                      {character.isDefault && (
                        <span className="default-badge">默认</span>
                      )}
                    </div>
                    <div className="character-item-personality">
                      {character.personality}
                    </div>
                  </div>
                </div>
                <div className="character-item-actions">
                  <button
                    className="action-btn edit-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditCharacter(character);
                      setShowMenu(false);
                    }}
                    title="编辑"
                  >
                    ✏️
                  </button>
                  {!character.isDefault && (
                    <button
                      className="action-btn default-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetDefault(character.id);
                      }}
                      title="设为默认"
                    >
                      ⭐
                    </button>
                  )}
                  <button
                    className="action-btn delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(character.id);
                    }}
                    title="删除"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button className="create-character-btn" onClick={onCreateNew}>
            + 创建新角色
          </button>
        </div>
      )}
    </div>
  );
};

export default CharacterSelector;
