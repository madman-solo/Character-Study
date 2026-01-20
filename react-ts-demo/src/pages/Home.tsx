import { useState, useEffect } from "react";
import { useCharacter } from "../contexts/CharacterContext";
import { useAuth } from "../contexts/AuthContext";
import type { Message } from "../types";
import { injectDateContext } from "../utils/dateInjector";
import "../styles/Home.css";

interface HomeProps {
  englishMode?: string;
}

const Home = ({ englishMode }: HomeProps) => {
  const { currentCharacter } = useCharacter();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [historyMessages, setHistoryMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  // 获取用户ID（如果未登录，使用临时ID）
  const userId = user?.id || "guest";

  // 加载历史对话
  useEffect(() => {
    if (userId) {
      loadConversationHistory();
    }
  }, [userId]);

  const loadConversationHistory = async () => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/users/${userId}/conversations`,
      );
      if (response.ok) {
        const data = await response.json();
        const formattedMessages: Message[] = data
          .map((conv: any) => ({
            id: conv.id.toString(),
            content: conv.message,
            sender: conv.sender,
            timestamp: new Date(conv.timestamp),
          }))
          .reverse();
        setHistoryMessages(formattedMessages);
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error("加载历史对话失败:", error);
    }
  };

  const saveMessage = async (message: string, sender: string) => {
    try {
      await fetch(`http://localhost:3001/api/users/${userId}/conversations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          sender,
          characterId: currentCharacter?.id,
        }),
      });
    } catch (error) {
      console.error("保存消息失败:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInputValue("");
    setLoading(true);

    // 保存用户消息
    await saveMessage(inputValue, "user");

    try {
      // 构建 System Prompt
      let systemPrompt = "";

      if (englishMode) {
        // 英语对话模式的 System Prompt
        systemPrompt = `You are a friendly English conversation partner and teacher. Your role is to help users practice English through natural daily conversations.

Core Rules:
1. Always respond in English (you may provide Chinese explanations in parentheses for difficult words if needed)
2. Act as a supportive language partner - be encouraging and patient
3. Correct grammar mistakes gently by rephrasing the correct form naturally in your response
4. Use simple, clear language appropriate for language learners
5. Ask follow-up questions to keep the conversation flowing
6. Simulate real-life conversation scenarios (greetings, daily activities, hobbies, etc.)
7. If the user makes a significant error, acknowledge it kindly: "I understand you mean... A better way to say this would be..."

Your goal: Make English learning natural, fun, and confidence-building through authentic conversation practice.`;
      } else {
        // 普通模式的 System Prompt
        systemPrompt = currentCharacter
          ? `你是${currentCharacter.name}，${currentCharacter.description}`
          : "你是一个友好的AI助手";
      }

      // 调用千帆 API
      const response = await fetch("http://localhost:3001/api/qianfan/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "ernie-speed-8k",
          messages: [
            {
              role: "system",
              content: injectDateContext(systemPrompt),
            },
            {
              role: "user",
              content: inputValue,
            },
          ],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const aiReply =
          data.choices?.[0]?.message?.content || "抱歉，我现在无法回复。";

        const replyMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: aiReply,
          sender: "character",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, replyMessage]);
        await saveMessage(aiReply, "character");
      } else {
        throw new Error("API 请求失败");
      }
    } catch (error) {
      console.error("发送消息失败:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "抱歉，消息发送失败。请检查 API Key 配置。",
        sender: "character",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
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
        <div className="chat-header">
          <button
            className="history-button"
            onClick={() => setShowHistory(!showHistory)}
            title="查看历史对话"
          >
            📜
          </button>
        </div>

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
          {loading && (
            <div className="message character-message">
              <div className="message-content">正在思考中...</div>
            </div>
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
            disabled={loading}
          />
          <button
            onClick={handleSendMessage}
            className="send-button"
            disabled={loading}
          >
            {loading ? "发送中..." : "发送"}
          </button>
        </div>
      </div>

      {showHistory && (
        <div className="history-modal" onClick={() => setShowHistory(false)}>
          <div className="history-content" onClick={(e) => e.stopPropagation()}>
            <div className="history-header">
              <h3>历史对话</h3>
              <button
                className="close-button"
                onClick={() => setShowHistory(false)}
              >
                ✕
              </button>
            </div>
            <div className="history-messages">
              {historyMessages.length === 0 ? (
                <p className="empty-history">暂无历史对话</p>
              ) : (
                historyMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`history-message ${
                      msg.sender === "user" ? "user" : "character"
                    }`}
                  >
                    <div className="history-message-content">{msg.content}</div>
                    <div className="history-message-time">
                      {new Date(msg.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
