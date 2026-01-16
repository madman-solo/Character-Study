import { useNavigate } from "react-router-dom";
import { useCharacter } from "../contexts/CharacterContext";
import "../styles/MyFavorites.css";

const MyFavoritesPage = () => {
  const navigate = useNavigate();
  const { myFavorites, unfavoriteCharacter, addCharacter, isCharacterAdded } =
    useCharacter();

  const handleUnfavorite = async (characterId: string) => {
    if (window.confirm("确定要取消收藏吗？")) {
      try {
        await unfavoriteCharacter(characterId);
      } catch (error) {
        alert("取消收藏失败，请重试");
      }
    }
  };

  const handleAddCharacter = async (characterId: string) => {
    const character = myFavorites.find((c) => c.id === characterId);
    if (character) {
      try {
        await addCharacter(character);
        alert("已添加到我的角色");
      } catch (error) {
        alert("添加失败，请重试");
      }
    }
  };

  return (
    <div className="my-favorites-container">
      <button className="back-button" onClick={() => navigate("/")}>
        ← 返回
      </button>

      <div className="page-header">
        <h1 className="page-title">⭐ 我的收藏</h1>
        <p className="page-subtitle">你收藏的所有角色</p>
      </div>

      {myFavorites.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💫</div>
          <p className="empty-text">还没有收藏任何角色</p>
          <button
            className="browse-button"
            onClick={() => navigate("/characters")}
          >
            去浏览角色
          </button>
        </div>
      ) : (
        <div className="favorites-grid">
          {myFavorites.map((character) => (
            <div key={character.id} className="favorite-card">
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
              <div className="character-actions">
                {!isCharacterAdded(character.id) && (
                  <button
                    className="action-btn add"
                    onClick={() => handleAddCharacter(character.id)}
                  >
                    添加角色
                  </button>
                )}
                <button
                  className="action-btn unfavorite"
                  onClick={() => handleUnfavorite(character.id)}
                >
                  取消收藏
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyFavoritesPage;
