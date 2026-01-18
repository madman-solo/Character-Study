import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getCharacters } from "../api";
import type { Character, CharacterCategory } from "../types";
import "../styles/Characters.css";

const Characters = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get(
    "category",
  ) as CharacterCategory | null;

  const [selectedCategory, setSelectedCategory] = useState<CharacterCategory>(
    categoryFromUrl || "动漫人物",
  );
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categories: CharacterCategory[] = [
    "动漫人物",
    "卡通人物",
    "插画",
    "动物",
    "原创",
  ];

  // 监听 URL 参数变化，更新选中的分类
  useEffect(() => {
    if (categoryFromUrl && categoryFromUrl !== selectedCategory) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [categoryFromUrl]);

  // 从API获取角色数据
  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("正在获取角色数据，分类:", selectedCategory);
        const data = await getCharacters(selectedCategory);
        console.log("获取到的角色数据:", data);
        setCharacters(data);
      } catch (err) {
        console.error("获取角色列表失败:", err);
        setError("加载角色数据失败，请稍后重试");
      } finally {
        setLoading(false);
      }
    };

    fetchCharacters();
  }, [selectedCategory]);

  const filteredCharacters = characters;

  const handleCategoryClick = (category: CharacterCategory) => {
    console.log("点击分类按钮:", category);
    console.log(11); //没点上

    setSelectedCategory(category);
    // 使用查询参数而不是路由路径
    navigate(`/characters?category=${encodeURIComponent(category)}`);
  };

  const handleCharacterClick = (characterId: string) => {
    console.log("点击角色卡片，ID:", characterId);
    navigate(`/character/${characterId}`);
  };

  return (
    <div className="characters-container">
      <div className="category-nav">
        {categories.map((category) => (
          <button
            key={category}
            className={`category-btn ${
              selectedCategory === category ? "active" : ""
            }`}
            onClick={() => handleCategoryClick(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-message">加载中...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : filteredCharacters.length === 0 ? (
        <div className="empty-message">该分类暂无角色</div>
      ) : (
        <div className="characters-grid">
          {filteredCharacters.map((character) => (
            <div
              key={character.id}
              className="character-card"
              onClick={() => handleCharacterClick(character.id)}
            >
              <div className="character-avatar">{character.avatar}</div>
              <h3 className="character-name">{character.name}</h3>
              <p className="character-desc">{character.description}</p>
              <div className="character-tags">
                {character.tags.map((tag) => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Characters;
