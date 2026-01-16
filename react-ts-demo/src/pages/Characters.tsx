import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Character, CharacterCategory } from "../types";
import "../styles/Characters.css";

const Characters = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] =
    useState<CharacterCategory>("动漫人物");

  const categories: CharacterCategory[] = [
    "动漫人物",
    "卡通人物",
    "插画",
    "动物",
    "原创",
  ];

  // 模拟角色数据
  const mockCharacters: Character[] = [
    {
      id: "1",
      name: "初音未来",
      avatar: "🎤",
      category: "动漫人物",
      description: "虚拟歌姬，充满活力",
      tags: ["音乐", "可爱"],
      popularity: 95,
    },
    {
      id: "2",
      name: "路飞",
      avatar: "🏴‍☠️",
      category: "动漫人物",
      description: "海贼王，热血冒险",
      tags: ["冒险", "热血"],
      popularity: 92,
    },
  ];

  const filteredCharacters = mockCharacters.filter(
    (char) => char.category === selectedCategory
  );

  return (
    <div className="characters-container">
      <div className="category-nav">
        {categories.map((category) => (
          <button
            key={category}
            className={`category-btn ${
              selectedCategory === category ? "active" : ""
            }`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="characters-grid">
        {filteredCharacters.map((character) => (
          <div
            key={character.id}
            className="character-card"
            onClick={() => navigate(`/character/${character.id}`)}
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
    </div>
  );
};

export default Characters;
