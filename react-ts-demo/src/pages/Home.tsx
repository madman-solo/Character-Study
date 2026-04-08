import { useState, useRef, useEffect } from "react";
import { useCharacter } from "../contexts/CharacterContext";
import { useAuth } from "../contexts/AuthContext";
import {
  chat,
  saveMessage,
  getConversationHistory,
  deleteConversationHistory,
} from "../services/chatService";
import { useTypewriter } from "../hooks/useTypewriter";
import Live2DModel from "../components/Live2DModel";
import "../styles/HomeNew.css";

interface HomeProps {
  englishMode?: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const Home = ({ englishMode }: HomeProps) => {
  const { currentCharacter } = useCharacter();
  const { user } = useAuth();
  const userId = user?.id || "guest";

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // 当前 AI 回复（用于打字机效果和气泡显示）
  const [currentAIReply, setCurrentAIReply] = useState("");
  const [showAIBubble, setShowAIBubble] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);

  // 打字机效果
  const { displayedText, isTyping, isComplete } = useTypewriter({
    text: currentAIReply,
    speed: 30,
    enabled: showAIBubble,
  });

  // 当打字完成后，3秒后隐藏气泡
  useEffect(() => {
    if (isComplete && showAIBubble) {
      const timer = setTimeout(() => {
        setShowAIBubble(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isComplete, showAIBubble]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 加载历史对话
  useEffect(() => {
    const loadHistory = async () => {
      const scene = englishMode ? "english" : "home";
      const history = await getConversationHistory(userId, 50, scene);
      if (history.length > 0) {
        const formattedMessages = history
          .map(
            (conv: {
              id: number;
              sender: string;
              message: string;
              timestamp: string;
            }) => ({
              id: conv.id.toString(),
              role: (conv.sender === "user" ? "user" : "assistant") as
                | "user"
                | "assistant",
              content: conv.message,
              timestamp: new Date(conv.timestamp),
            }),
          )
          .reverse();
        setMessages(formattedMessages);
      }
    };
    loadHistory();
  }, [userId, englishMode]);

  // 自动调整输入框高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [inputValue]);

  // 构建系统提示词
  const getSystemPrompt = () => {
    if (englishMode) {
      return `You are a friendly English conversation partner and teacher. Your role is to help users practice English through natural daily conversations.

Core Rules:
1. Always respond in English (you may provide Chinese explanations in parentheses for difficult words if needed)
2. Act as a supportive language partner - be encouraging and patient
3. Correct grammar mistakes gently by rephrasing the correct form naturally in your response
4. Use simple, clear language appropriate for language learners
5. Ask follow-up questions to keep the conversation flowing
6. Simulate real-life conversation scenarios (greetings, daily activities, hobbies, etc.)
7. If the user makes a significant error, acknowledge it kindly: "I understand you mean... A better way to say this would be..."

Your goal: Make English learning natural, fun, and confidence-building through authentic conversation practice.`;
    }
    return undefined;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userInput = inputValue.trim();
    setInputValue("");

    // 添加用户消息
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userInput,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // 保存用户消息
    const scene = englishMode ? "english" : "home";
    await saveMessage(userId, userInput, "user", scene);

    setIsLoading(true);

    try {
      // 构建上下文消息（最近10轮）
      const recentMessages = messages.slice(-20);
      const contextMessages = [
        ...recentMessages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        { role: "user" as const, content: userInput },
      ];

      // 调用 AI 服务
      const response = await chat({
        scene: englishMode ? "english" : "home",
        messages: contextMessages,
        systemPrompt: getSystemPrompt(),
        characterName: currentCharacter?.name,
        characterDescription: currentCharacter?.description,
      });

      if (response.error) {
        throw new Error(response.error);
      }

      // 添加 AI 回复到消息列表
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.content,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);

      // 显示 AI 气泡和打字机效果
      setCurrentAIReply(response.content);
      setShowAIBubble(true);

      // 保存 AI 回复
      const scene = englishMode ? "english" : "home";
      await saveMessage(userId, response.content, "character", scene);
    } catch (error) {
      console.error("发送消息失败:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "抱歉，消息发送失败。请稍后重试。",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm("确定要清空对话历史吗？")) {
      // 清空前端状态
      setMessages([]);
      // 删除数据库记录
      await deleteConversationHistory(userId);
    }
  };

  return (
    <div className="home-new-container">
      {/* Live2D 展示区 */}
      <div className="live2d-section">
        <div className="live2d-display">
          <div className="live2d-container">
            <Live2DModel
              modelPath={[
                "/tororo_hijiki/hijiki/runtime/hijiki.model3.json",
                "/tororo_hijiki/tororo/runtime/tororo.model3.json",
              ]}
              width={800}
              height={600}
              paddingBottom={130}
              paddingRight={10}
              onModelLoaded={() => setModelLoaded(true)}
            />
            {!modelLoaded && (
              <div className="loading-overlay">
                <p>加载 Live2D 模型中...</p>
              </div>
            )}
          </div>

          {/* AI 回复气泡 */}
          {showAIBubble && (
            <div className="ai-speech-bubble">
              <div className="bubble-content">
                {displayedText}
                {isTyping && <span className="bubble-cursor">▌</span>}
              </div>
              <div className="bubble-tail"></div>
            </div>
          )}
        </div>

        {/* 对话输入区 */}
        <div className="chat-input-section">
          <div className="input-header">
            <button
              className="history-btn"
              onClick={() => setShowHistory(!showHistory)}
            >
              📜 历史
            </button>
            <button className="clear-btn" onClick={handleClearHistory}>
              清空
            </button>
          </div>

          <div className="input-container">
            <textarea
              ref={textareaRef}
              className="message-input"
              placeholder={englishMode ? "Type your message..." : "输入消息..."}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              rows={1}
            />
            <button
              className="send-btn"
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
            >
              {isLoading ? "..." : "↑"}
            </button>
          </div>

          {englishMode && (
            <div className="mode-indicator">
              <span className="mode-icon">🌐</span>
              <span className="mode-text">{englishMode}</span>
            </div>
          )}
        </div>
      </div>

      {/* 历史记录侧边栏 */}
      {showHistory && (
        <div className="history-sidebar">
          <div className="history-header">
            <h3>对话历史</h3>
            <button
              className="close-history"
              onClick={() => setShowHistory(false)}
            >
              ✕
            </button>
          </div>
          <div className="history-list">
            {messages.length === 0 ? (
              <p className="empty-history">暂无历史对话</p>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`history-item ${msg.role}`}>
                  <div className="history-content">{msg.content}</div>
                  <div className="history-time">
                    {msg.timestamp.toLocaleString()}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
