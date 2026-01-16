import { useNavigate } from "react-router-dom";
import { useCharacter } from "../contexts/CharacterContext";
import "../styles/MyCharacters.css";

const MyCharactersPage = () => {
  const navigate = useNavigate();
  const { myCharacters, removeCharacter, setAsCurrentCharacter, currentCharacter } =
    useCharacter();

  const handleSetDefault = async (characterId: string) => {
    const character = myCharacters.find((c) => c.id === characterId);
    if (character) {
      try {
        await setAsCurrentCharacter(character);
        alert("已设置为首页角色");
      } catch (error) {
        alert("设置失败，请重试");
      }
    }
  };

  const handleRemove = async (characterId: string) => {
    if (window.confirm("确定要移除这个角色吗？")) {
      try {
        await removeCharacter(characterId);
      } catch (error) {
        alert("移除失败，请重试");
      }
    }
  };

  return (
    <div className="my-characters-container">
      <button className="back-button" onClick={() => navigate("/")}>
        ← 返回
      </button>

      <div className="page-header">
        <h1 className="page-title">🎭 我的角色</h1>
        <p className="page-subtitle">管理你添加的所有角色</p>
      </div>

      {myCharacters.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <p className="empty-text">还没有添加任何角色</p>
          <button
            className="browse-button"
            onClick={() => navigate("/characters")}
          >
            去浏览角色
          </button>
        </div>
      ) : (
        <div className="characters-grid">
          {myCharacters.map((character) => (
            <div key={character.id} className="character-card">
              <div
                className="character-avatar"
                onClick={() => navigate(`/character/${character.id}`)}
              >
                {character.avatar}
              </div>
              <h3 className="character-name">{character.name}</h3>
              <p className="character-description">{character.description}</p>
              <div className="character-tags">
                {character.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
              {currentCharacter?.id === character.id && (
                <div className="default-badge">首页角色</div>
              )}
              <div className="character-actions">
                {currentCharacter?.id !== character.id && (
                  <button
                    className="action-btn set-default"
                    onClick={() => handleSetDefault(character.id)}
                  >
                    设为首页
                  </button>
                )}
                <button
                  className="action-btn remove"
                  onClick={() => handleRemove(character.id)}
                >
                  移除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCharactersPage;
