import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/SpeakingPage.css";
import Live2DModelComponent from "../components/Live2DModel";

interface ConversationMessage {
  id: string;
  speaker: "user" | "character";
  text: string;
  words?: string[];
  timestamp: Date;
}

const SpeakingPage = () => {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [conversations, setConversations] = useState<ConversationMessage[]>([
    {
      id: "1",
      speaker: "character",
      text: "Hello! How are you today?",
      words: ["Hello", "How", "are", "you", "today"],
      timestamp: new Date(),
    },
  ]);

  const handleRecordClick = () => {
    setIsRecording(!isRecording);
    // TODO: 集成阿里云语音识别API
    if (!isRecording) {
      // 模拟录音后的响应
      setTimeout(() => {
        const newMessage: ConversationMessage = {
          id: Date.now().toString(),
          speaker: "user",
          text: "I'm fine, thank you!",
          words: ["I'm", "fine", "thank", "you"],
          timestamp: new Date(),
        };
        setConversations([...conversations, newMessage]);
        setIsRecording(false);

        // 角色回复
        setTimeout(() => {
          const characterReply: ConversationMessage = {
            id: (Date.now() + 1).toString(),
            speaker: "character",
            text: "That's great! What would you like to talk about?",
            words: [
              "That's",
              "great",
              "What",
              "would",
              "you",
              "like",
              "to",
              "talk",
              "about",
            ],
            timestamp: new Date(),
          };
          setConversations((prev) => [...prev, characterReply]);
        }, 1000);
      }, 2000);
    }
  };

  return (
    <div className="speaking-page">
      {/* 左侧：角色显示区 */}
      <div className="character-display">
        <div className="character-container">
          {/* TODO: 集成Live2D角色 */}
          {/* <div className="character-placeholder">
            <div className="character-avatar">👤</div>
            <p className="character-name">AI助手</p>
          </div> */}
          <Live2DModelComponent
            modelPath="/tororo_hijiki/hijiki/runtime/hijiki.model3.json"
            width={900}
            height={1000}
            paddingBottom={140}
          />
        </div>

        <div className="speaking-controls">
          <button
            className={`record-button ${isRecording ? "recording" : ""}`}
            onClick={handleRecordClick}
          >
            <span className="record-icon">{isRecording ? "⏹" : "🎤"}</span>
            <span className="record-text">
              {isRecording ? "停止说话" : "点击说话"}
            </span>
          </button>

          {isRecording && (
            <div className="recording-indicator">
              <span className="pulse"></span>
              <span>正在录音...</span>
            </div>
          )}
        </div>

        <button className="back-button" onClick={() => navigate("/listening")}>
          ← 返回听力页面
        </button>
      </div>

      {/* 右侧：对话记录区 */}
      <div className="transcript-panel">
        <div className="transcript-header">
          <h2>对话记录</h2>
          <button
            className="toggle-transcript-button"
            onClick={() => setShowTranscript(!showTranscript)}
          >
            {showTranscript ? "隐藏" : "显示"}
          </button>
        </div>

        {showTranscript && (
          <div className="transcript-content">
            {conversations.map((message) => (
              <div
                key={message.id}
                className={`message ${message.speaker === "user" ? "user-message" : "character-message"}`}
              >
                <div className="message-header">
                  <span className="speaker-name">
                    {message.speaker === "user" ? "你" : "AI助手"}
                  </span>
                  <span className="message-time">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <div className="message-text">{message.text}</div>
                {message.words && message.words.length > 0 && (
                  <div className="message-words">
                    <span className="words-label">单词：</span>
                    {message.words.map((word, index) => (
                      <span key={index} className="word-tag">
                        {word}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!showTranscript && (
          <div className="transcript-placeholder">
            <p>点击"显示"按钮查看对话记录</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpeakingPage;
