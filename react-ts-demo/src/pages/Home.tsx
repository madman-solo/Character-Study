import { useState } from "react";
import { useCharacter } from "../contexts/CharacterContext";
import type { Message } from "../types";
import "../styles/Home.css";

interface HomeProps {
  englishMode?: string;
}

const Home = ({ englishMode }: HomeProps) => {
  const { currentCharacter } = useCharacter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setInputValue("");

    // 模拟角色回复
    setTimeout(() => {
      const characterName = currentCharacter?.name || "AI角色伙伴";
      const replyMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: englishMode
          ? `Hello! I'm ${characterName}, nice to chat with you.`
          : `你好！我是${characterName}，很高兴与你交流。`,
        sender: "character",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, replyMessage]);
    }, 1000);
  };

  return (
    <div className="home-container">
      <div className="character-display">
        <div className="live2d-placeholder">
          {currentCharacter ? (
            <>
              <div className="current-character-avatar">
                {currentCharacter.avatar}
              </div>
              <p className="current-character-name">{currentCharacter.name}</p>
              <p className="placeholder-hint">（后期集成Live2D模型）</p>
            </>
          ) : (
            <>
              <p>Live2D 角色模型展示区</p>
              <p className="placeholder-hint">（后期集成Live2D模型）</p>
            </>
          )}
        </div>
      </div>

      <div className="chat-container">
        <div className="messages-area">
          {messages.length === 0 ? (
            <div className="empty-message">
              <p>开始与角色对话吧！</p>
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
          {englishMode && (
            <div className="english-mode-indicator">
              <span className="mode-icon">🌐</span>
              <span className="mode-text">{englishMode}</span>
            </div>
          )}
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder={englishMode ? "Type your message..." : "输入消息..."}
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

export default Home;
