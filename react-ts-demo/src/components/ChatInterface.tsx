import { useState, useRef, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  chat,
  saveMessage,
  getConversationHistory,
  deleteConversationHistory,
} from "../services/chatService";
import type { ChatScene, ChatMessage } from "../services/chatService";
import {
  saveConversation,
  getConversationHistory as getCharacterHistory,
  getCharacterMemories,
} from "../services/characterService";
import type { CharacterConversation } from "../services/characterService";
import { useChatHistory } from "../hooks/useChatHistory";
import type { Message } from "../hooks/useChatHistory";
import { useTypewriter } from "../hooks/useTypewriter";
import "../styles/ChatInterface.css";

export interface ChatInterfaceProps {
  scene: ChatScene;
  title?: string;
  systemPrompt?: string;
  characterName?: string;
  characterDescription?: string;
  placeholder?: string;
  enableTypewriter?: boolean;
  maxRounds?: number;
  characterId?: number; // 角色ID，用于角色专属对话
}

/**
 * 通用的聊天界面组件
 * 支持打字机效果、上下文记忆、流式响应等功能
 */
const ChatInterface = ({
  scene,
  title = "对话",
  systemPrompt,
  characterName,
  characterDescription,
  placeholder = "输入消息...",
  enableTypewriter = true,
  maxRounds = 10,
  characterId, // 角色ID，用于角色专属对话
}: ChatInterfaceProps) => {
  const { user } = useAuth();
  const userId = user?.id || "guest";

  // 对话历史管理
  const {
    messages,
    addMessage,
    clearMessages,
    getContextMessages,
    setMessageList,
  } = useChatHistory({
    maxRounds,
  });

  // 输入状态
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // 当前 AI 回复（用于打字机效果）
  const [currentAIReply, setCurrentAIReply] = useState("");
  const [showTypewriter, setShowTypewriter] = useState(false);

  // 打字机效果
  const { displayedText, isTyping, isComplete } = useTypewriter({
    text: currentAIReply,
    speed: 30,
    enabled: enableTypewriter && showTypewriter,
  });

  // 当打字完成后，隐藏打字机效果
  useEffect(() => {
    if (isComplete && showTypewriter) {
      setShowTypewriter(false);
    }
  }, [isComplete, showTypewriter]);

  // 自动滚动
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, displayedText]);

  // 自动调整输入框高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [inputValue]);

  // 加载历史对话
  useEffect(() => {
    const loadHistory = async () => {
      try {
        let formattedMessages: Message[] = [];

        // 如果提供了characterId，使用角色专属对话历史
        if (characterId) {
          const history = await getCharacterHistory(characterId, userId, 50);
          if (history.length > 0) {
            // CharacterConversation 结构：userMessage, characterReply
            formattedMessages = history.flatMap((conv: CharacterConversation) => [
              {
                id: `${conv.id}-user`,
                role: "user" as const,
                content: conv.userMessage,
                timestamp: new Date(conv.createdAt),
              },
              {
                id: `${conv.id}-assistant`,
                role: "assistant" as const,
                content: conv.characterReply,
                timestamp: new Date(conv.createdAt),
              },
            ]);
          }
        } else {
          // 否则使用通用对话历史，按场景过滤
          const history = await getConversationHistory(userId, 50, scene);
          if (history.length > 0) {
            formattedMessages = history
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
          }
        }

        if (formattedMessages.length > 0) {
          setMessageList(formattedMessages);
        }
      } catch (error) {
        console.error("加载对话历史失败:", error);
      }
    };
    loadHistory();
  }, [userId, characterId, scene, setMessageList]);

  /**
   * 发送消息
   */
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userInput = inputValue.trim();
    setInputValue("");

    // 添加用户消息
    addMessage("user", userInput);

    // 保存用户消息到数据库（仅在非角色模式下）
    if (!characterId) {
      await saveMessage(userId, userInput, "user", scene);
    }

    // 显示加载状态
    setIsLoading(true);

    try {
      // 构建上下文消息
      const contextMessages: ChatMessage[] = [
        ...getContextMessages().map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        })),
        { role: "user" as const, content: userInput },
      ];

      // 调用 AI 服务
      const response = await chat({
        scene,
        messages: contextMessages,
        systemPrompt,
        characterName,
        characterDescription,
      });

      if (response.error) {
        throw new Error(response.error);
      }

      // 添加 AI 回复
      addMessage("assistant", response.content);

      // 启用打字机效果
      if (enableTypewriter) {
        setCurrentAIReply(response.content);
        setShowTypewriter(true);
      }

      // 保存对话到数据库
      if (characterId) {
        // 角色模式：保存完整对话到角色对话表
        await saveConversation(characterId, userId, userInput, response.content);
      } else {
        // 通用模式：保存 AI 回复
        await saveMessage(userId, response.content, "character", scene);
      }
    } catch (error) {
      console.error("发送消息失败:", error);
      const errorMessage = "抱歉，消息发送失败。请稍后重试。";
      addMessage("assistant", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 处理键盘事件
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  /**
   * 清空对话历史
   */
  const handleClearHistory = async () => {
    if (window.confirm("确定要清空对话历史吗？")) {
      // 清空前端状态
      clearMessages();
      // 删除数据库记录（按场景删除）
      await deleteConversationHistory(userId, scene);
    }
  };

  return (
    <div className="chat-interface">
      {/* 头部 */}
      <div className="chat-interface-header">
        <div className="chat-interface-title">{title}</div>
        <div className="chat-interface-actions">
          <button
            className="chat-action-button"
            onClick={() => setShowHistory(!showHistory)}
          >
            📜 历史
          </button>
          <button className="chat-action-button" onClick={handleClearHistory}>
            清空对话
          </button>
        </div>
      </div>

      {/* 消息区域 */}
      <div className="chat-messages-area">
        {messages.length === 0 ? (
          <div className="chat-empty-state">
            <div className="chat-empty-icon">💬</div>
            <div className="chat-empty-title">开始对话</div>
            <div className="chat-empty-description">
              输入消息开始与 AI 对话，支持上下文记忆（最近{maxRounds}轮对话）
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const isLastAssistantMessage =
                message.role === "assistant" && index === messages.length - 1;
              const shouldShowTypewriter =
                isLastAssistantMessage && showTypewriter;

              return (
                <div
                  key={message.id}
                  className={`chat-message-wrapper ${
                    message.role === "user"
                      ? "user-message"
                      : "assistant-message"
                  }`}
                >
                  <div
                    className={`chat-message-avatar ${
                      message.role === "user"
                        ? "user-avatar"
                        : "assistant-avatar"
                    }`}
                  >
                    {message.role === "user" ? "👤" : "🤖"}
                  </div>
                  <div className="chat-message-content">
                    {shouldShowTypewriter ? (
                      <>
                        {displayedText}
                        {isTyping && <span className="typing-cursor"></span>}
                      </>
                    ) : (
                      message.content
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="chat-loading-indicator">
                <div className="chat-message-avatar assistant-avatar">🤖</div>
                <div className="chat-loading-dots">
                  <div className="chat-loading-dot"></div>
                  <div className="chat-loading-dot"></div>
                  <div className="chat-loading-dot"></div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* 输入区域 */}
      <div className="chat-input-area">
        <div className="chat-input-container">
          <textarea
            ref={textareaRef}
            className="chat-textarea"
            placeholder={placeholder}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            rows={1}
          />
          <button
            className="chat-send-button"
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
          >
            ↑
          </button>
        </div>
      </div>

      {/* 历史记录模态框 */}
      {showHistory && (
        <div
          className="chat-history-modal"
          onClick={() => setShowHistory(false)}
        >
          <div
            className="chat-history-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="chat-history-header">
              <h3>历史对话</h3>
              <button
                className="chat-history-close"
                onClick={() => setShowHistory(false)}
              >
                ✕
              </button>
            </div>
            <div className="chat-history-messages">
              {messages.length === 0 ? (
                <p className="chat-history-empty">暂无历史对话</p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`chat-history-message ${
                      msg.role === "user" ? "user" : "assistant"
                    }`}
                  >
                    <div className="chat-history-message-content">
                      {msg.content}
                    </div>
                    <div className="chat-history-message-time">
                      {msg.timestamp.toLocaleString()}
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

export default ChatInterface;
