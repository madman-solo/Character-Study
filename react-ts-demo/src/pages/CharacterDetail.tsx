import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCharacterById } from "../api";
import { useCharacter } from "../contexts/CharacterContext";
import type { Message, Character } from "../types";
import "../styles/CharacterDetail.css";

const CharacterDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    isCharacterAdded,
    isCharacterFavorited,
    addCharacter,
    favoriteCharacter,
    unfavoriteCharacter,
  } = useCharacter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 从后端API获取角色数据
  useEffect(() => {
    const fetchCharacter = async () => {
      try {
        setLoading(true);
        const data = await getCharacterById(id!);
        setCharacter(data);
        setError(null);
      } catch (err) {
        console.error("获取角色数据失败:", err);
        setError("加载角色数据失败，请稍后重试");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCharacter();
    }
  }, [id]);

  const handleSendMessage = () => {
    if (!inputValue.trim() || !character) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setInputValue("");

    setTimeout(() => {
      const replyMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `你好！我是${character.name}，很高兴认识你！`,
        sender: "character",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, replyMessage]);
    }, 1000);
  };

  const handleAddCharacter = async () => {
    if (!character) return;
    try {
      await addCharacter(character, true);
      alert("角色已添加到首页！");
    } catch (error) {
      alert("添加失败，请重试");
    }
  };

  const handleToggleFavorite = async () => {
    if (!character) return;
    try {
      if (isCharacterFavorited(character.id)) {
        await unfavoriteCharacter(character.id);
        alert("已取消收藏");
      } else {
        await favoriteCharacter(character);
        alert("已添加到收藏");
      }
    } catch (error) {
      alert("操作失败，请重试");
    }
  };

  // 加载状态
  if (loading) {
    return (
      <div className="character-detail-container">
        <button className="back-button" onClick={() => navigate("/characters")}>
          ← 返回
        </button>
        <div className="loading-message">加载中...</div>
      </div>
    );
  }

  // 错误状态
  if (error || !character) {
    return (
      <div className="character-detail-container">
        <button className="back-button" onClick={() => navigate("/characters")}>
          ← 返回
        </button>
        <div className="error-message">{error || "角色未找到"}</div>
      </div>
    );
  }

  return (
    <div className="character-detail-container">
      <button className="back-button" onClick={() => navigate("/characters")}>
        ← 返回
      </button>

      <div className="character-info">
        <div className="character-avatar-large">{character.avatar}</div>
        <h1 className="character-name-large">{character.name}</h1>
        <p className="character-description">{character.description}</p>
        <div className="character-tags-detail">
          {character.tags.map((tag) => (
            <span key={tag} className="tag-detail">
              {tag}
            </span>
          ))}
        </div>
        <div className="character-actions">
          <button
            className={`action-button ${
              isCharacterAdded(character.id) ? "added" : ""
            }`}
            onClick={handleAddCharacter}
            disabled={isCharacterAdded(character.id)}
          >
            {isCharacterAdded(character.id) ? "✓ 已添加" : "➕ 添加该角色"}
          </button>
          <button
            className={`action-button favorite ${
              isCharacterFavorited(character.id) ? "favorited" : ""
            }`}
            onClick={handleToggleFavorite}
          >
            {isCharacterFavorited(character.id) ? "⭐ 已收藏" : "☆ 收藏"}
          </button>
        </div>
      </div>

      <div className="chat-section">
        <div className="messages-area-detail">
          {messages.length === 0 ? (
            <div className="empty-message">
              <p>开始与 {character.name} 对话吧！</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`message ${
                  msg.sender === "user" ? "user-message" : "character-message"
                }`}
              >
                <div className="message-content">{msg.content}</div>
              </div>
            ))
          )}
        </div>

        <div className="input-area">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="输入消息..."
            className="message-input"
          />
          <button onClick={handleSendMessage} className="send-button">
            发送
          </button>
        </div>
      </div>
    </div>
  );
};

export default CharacterDetail;
