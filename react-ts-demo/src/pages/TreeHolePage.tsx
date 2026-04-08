import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { chat, saveMessage } from "../services/chatService";
import { analyzeEmotion, saveEmotionRecord } from "../services/emotionService";
import "../styles/TreeHolePage.css";
import Live2DModelComponent from "../components/Live2DModel";
// import { log } from  "console";

interface DialogueMessage {
  speaker: "user" | "tree-hole";
  text: string;
}

// 背景图片根据情绪变化
const backgrounds = {
  happy: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  sad: "linear-gradient(135deg, #4a5568 0%, #2d3748 100%)",
  neutral: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  excited: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  angry: "linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%)",
  anxious: "linear-gradient(135deg, #8e9eab 0%, #eef2f3 100%)",
  calm: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
  frustrated: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
  lonely: "linear-gradient(135deg, #4e54c8 0%, #8f94fb 100%)",
  confused: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
  hopeful: "linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)",
};

const TreeHolePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id || "guest";

  const [currentMessage, setCurrentMessage] = useState<DialogueMessage>({
    speaker: "tree-hole",
    text: "你好呀！很高兴见到你，有什么想和我分享的吗？",
  });
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentEmotion, setCurrentEmotion] =
    useState<keyof typeof backgrounds>("neutral");
  const [showClickHint, setShowClickHint] = useState(false); // 是否显示点击提示
  const [isWaitingForUser, setIsWaitingForUser] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [conversationHistory, setConversationHistory] = useState<
    Array<{ role: "user" | "assistant"; content: string }>
  >([]);

  // 消息历史回看功能
  const [messageHistory, setMessageHistory] = useState<DialogueMessage[]>([
    {
      speaker: "tree-hole",
      text: "你好呀！很高兴见到你，有什么想和我分享的吗？",
    },
  ]); // 消息历史记录
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0); // 当前消息索引
  const [isReviewMode, setIsReviewMode] = useState(false); // 是否处于回看模式

  const [isAIResponding, setIsAIResponding] = useState(false); // 标记AI是否正在回复
  const [isWaitingForAIResponse, setIsWaitingForAIResponse] = useState(false); // 标记是否在等待AI回复（显示光标闪烁）
  const [pendingAIResponse, setPendingAIResponse] = useState<{
    content: string;
    responseId: number;
  } | null>(null); // 存储待显示的AI回复及其响应ID
  const autoShowTimerRef = useRef<NodeJS.Timeout | null>(null); // 存储自动显示定时器
  const responseIdRef = useRef(0); // 响应ID，用于确保只显示最新的回复
  const currentResponseIdRef = useRef(0); // 当前正在处理的响应ID

  // 打字机效果
  useEffect(() => {
    if (currentMessage.text) {
      setIsTyping(true);
      setDisplayedText("");
      let index = 0;
      const text = currentMessage.text;

      const timer = setInterval(() => {
        if (index < text.length) {
          setDisplayedText(text.slice(0, index + 1));
          index++;
        } else {
          setIsTyping(false);
          setShowClickHint(true);
          clearInterval(timer);
        }
      }, 50);

      return () => clearInterval(timer);
    } else if (currentMessage.speaker === "tree-hole" && !currentMessage.text) {
      // 树洞回复框但没有文本，说明在等待AI回复
      setIsTyping(false);
      setDisplayedText("");
      setShowClickHint(false);
    }
  }, [currentMessage]);

  // 同步 currentMessage 到历史记录（仅在非回看模式下）
  useEffect(() => {
    if (!isReviewMode && currentMessage.text) {
      // 检查是否是最新消息（避免重复添加）
      const lastMessage = messageHistory[messageHistory.length - 1];
      if (
        !lastMessage ||
        lastMessage.text !== currentMessage.text ||
        lastMessage.speaker !== currentMessage.speaker
      ) {
        const newHistory = [...messageHistory, currentMessage];
        setMessageHistory(newHistory);
        setCurrentMessageIndex(newHistory.length - 1);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMessage, isReviewMode]);

  // 监听AI回复到达，自动更新显示
  useEffect(() => {
    if (
      isWaitingForAIResponse &&
      pendingAIResponse &&
      pendingAIResponse.responseId === currentResponseIdRef.current
    ) {
      console.log("AI回复已到达，自动更新显示");
      setCurrentMessage({
        speaker: "tree-hole",
        text: pendingAIResponse.content,
      });
      setIsWaitingForAIResponse(false);
      setIsAIResponding(false);
    }
  }, [pendingAIResponse, isWaitingForAIResponse]);

  // 处理上一条消息
  const handlePreviousMessage = () => {
    if (currentMessageIndex > 0) {
      setIsReviewMode(true);
      const newIndex = currentMessageIndex - 1;
      setCurrentMessageIndex(newIndex);
      setCurrentMessage(messageHistory[newIndex]);
      setShowClickHint(true);
    }
  };

  // 处理下一条消息
  const handleNextMessage = () => {
    if (currentMessageIndex < messageHistory.length - 1) {
      const newIndex = currentMessageIndex + 1;
      setCurrentMessageIndex(newIndex);
      setCurrentMessage(messageHistory[newIndex]);

      // 如果回到最新消息，退出回看模式
      if (newIndex === messageHistory.length - 1) {
        setIsReviewMode(false);
      }
      setShowClickHint(true);
    }
  };

  const handleDialogueClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // 获取点击位置
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const boxWidth = rect.width;
    const isLeftClick = clickX < boxWidth / 2;

    if (isTyping) {
      // 如果正在打字，立即显示完整文本
      setDisplayedText(currentMessage.text);
      setIsTyping(false);
      setShowClickHint(true);
    } else if (isReviewMode) {
      // 回看模式：左侧上一条，右侧下一条
      if (isLeftClick) {
        handlePreviousMessage();
        console.log("回看模式：点击了左侧，上一条消息");
      } else {
        handleNextMessage();
        console.log("回看模式：点击了右侧，下一条消息");
      }
    } else if (currentMessage.speaker === "tree-hole" && !isAIResponding) {
      // 正常模式：AI 说完了且不在回复中
      // 左侧：回到上一条消息（进入回看模式）
      // 右侧：轮到用户输入（原有功能）
      if (isLeftClick && currentMessageIndex > 0) {
        handlePreviousMessage();
        console.log("点击了左侧，回退到上一条消息");
      } else if (!isLeftClick) {
        setIsWaitingForUser(true);
        setShowClickHint(false);
        console.log("点击了右侧，进入用户输入状态");
      }
    } //意思是说只能在AI回复显示完成后，用户才能点击右侧跳转到树洞回复框，如果AI还在回复中，点击左侧不会回退到上一条消息。好像也不需要特意修正。
    // TODO: 可以考虑在AI回复过程中，点击左侧回退到上一条消息。
    else if (currentMessage.speaker === "user" && isAIResponding) {
      // if (isLeftClick && currentMessageIndex > 0) {
      //   handlePreviousMessage();
      //   console.log("点击了左侧，回退到上一条消息");
      //   return;
      // }//如果添加这个，则在返回上一条查看时，ai回复完成之后会自动跳转到树洞回复框，用户体验不好，并且之后点击“点击继续”后会卡住（因为isAIResponding为true？）
      console.log("用户手动跳转到树洞回复");

      // 清除自动显示定时器
      if (autoShowTimerRef.current) {
        clearTimeout(autoShowTimerRef.current);
        autoShowTimerRef.current = null;
      }

      // 立即跳转到树洞回复框
      if (
        pendingAIResponse &&
        pendingAIResponse.responseId === currentResponseIdRef.current
      ) {
        // AI回复已准备好，直接显示
        console.log(
          `手动显示 AI 回复 (响应ID=${pendingAIResponse.responseId})`,
        );
        setCurrentMessage({
          speaker: "tree-hole",
          text: pendingAIResponse.content,
        });
        setIsAIResponding(false);
        setIsWaitingForAIResponse(false);
        setShowClickHint(false);
      } else {
        // AI回复还没准备好，显示等待状态（光标闪烁）
        console.log("AI回复还未准备好，显示等待状态");
        setCurrentMessage({
          speaker: "tree-hole",
          text: "", // 空文本，显示光标闪烁
        });
        setIsWaitingForAIResponse(true); // 标记正在等待AI回复
        setShowClickHint(false);
      }
    }
  };

  const handleUserSubmit = async () => {
    if (!userInput.trim()) return;

    const userMessage = userInput.trim();
    setUserInput("");
    setIsWaitingForUser(false);
    setIsAIResponding(true); // 标记AI开始回复
    setIsReviewMode(false); // 退出回看模式

    // 清除之前的自动显示定时器（如果存在）
    if (autoShowTimerRef.current) {
      clearTimeout(autoShowTimerRef.current);
      autoShowTimerRef.current = null;
    }

    // 清空旧的待显示回复
    setPendingAIResponse(null);

    // 增加响应ID，使旧的回复失效
    responseIdRef.current += 1;
    const thisResponseId = responseIdRef.current;
    currentResponseIdRef.current = thisResponseId;
    console.log(`新的响应ID = ${thisResponseId}`);

    // 显示用户消息
    setCurrentMessage({
      speaker: "user",
      text: userMessage,
    });

    // 保存用户消息
    await saveMessage(userId, userMessage, "user", "treehole");

    // 更新对话历史
    const newHistory = [
      ...conversationHistory,
      { role: "user" as const, content: userMessage },
    ];
    setConversationHistory(newHistory);

    // 后台获取AI回复
    (async () => {
      try {
        console.log("\n=== 树洞页面：开始处理用户消息 ===");
        console.log("用户消息:", userMessage);

        // 并行执行情感分析和获取AI回复
        console.log("步骤1: 同时进行情感分析和获取AI回复...");

        const [emotionAnalysis, response] = await Promise.all([
          analyzeEmotion(userMessage),
          chat({
            scene: "treehole",
            messages: newHistory,
          }),
        ]);

        console.log("情感分析完成:", emotionAnalysis);
        console.log("AI 回复:", response.content);

        // 存储AI回复及其响应ID，等待用户点击或自动跳转
        setPendingAIResponse({
          content: response.content,
          responseId: thisResponseId,
        });

        // 根据情感更新背景
        console.log("步骤2: 更新背景颜色...");
        if (emotionAnalysis.emotion in backgrounds) {
          console.log("设置背景为:", emotionAnalysis.emotion);
          setCurrentEmotion(
            emotionAnalysis.emotion as keyof typeof backgrounds,
          );
        }

        // 保存情绪记录（异步，不阻塞显示）
        console.log("步骤3: 保存情绪记录...");
        saveEmotionRecord(userId, userMessage, emotionAnalysis).catch((err) => {
          console.error("保存情绪记录失败（不影响对话）:", err);
        });

        // 自动跳转：用户消息打字完成后自动显示树洞回复
        // 等待用户消息的打字效果完成（估算时间）
        const typingTime = userMessage.length * 50; // 每个字符50ms
        autoShowTimerRef.current = setTimeout(() => {
          // 检查响应ID是否仍然是当前的，且用户没有手动跳转
          if (
            thisResponseId === currentResponseIdRef.current &&
            !isWaitingForAIResponse
          ) {
            console.log(`步骤4: 自动显示 AI 回复 (响应ID=${thisResponseId})`);
            setCurrentMessage({
              speaker: "tree-hole",
              text: response.content,
            });
            setIsAIResponding(false); // AI回复显示后，允许用户输入
          } else {
            console.log(
              `步骤4: 跳过自动显示 (响应ID=${thisResponseId}, 当前ID=${currentResponseIdRef.current}, 等待状态=${isWaitingForAIResponse})`,
            );
          }
          autoShowTimerRef.current = null;
        }, typingTime);

        // 保存 AI 回复
        await saveMessage(userId, response.content, "character", "treehole");

        // 更新对话历史
        setConversationHistory([
          ...newHistory,
          { role: "assistant", content: response.content },
        ]);

        console.log("=== 处理完成 ===\n");
      } catch (error) {
        console.error("获取回复失败:", error);
        console.error(
          "错误堆栈:",
          error instanceof Error ? error.stack : "无堆栈信息",
        );
        const errorMsg = "抱歉，我现在有点累了，稍后再聊好吗？";
        setPendingAIResponse({
          content: errorMsg,
          responseId: thisResponseId,
        });
        setTimeout(() => {
          if (thisResponseId === currentResponseIdRef.current) {
            setCurrentMessage({
              speaker: "tree-hole",
              text: errorMsg,
            });
            setIsAIResponding(false);
          }
        }, 1000);
      }
    })();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleUserSubmit();
    }
  };

  return (
    <div
      className="tree-hole-page"
      style={{ background: backgrounds[currentEmotion] }}
    >
      {/* 背景装饰 */}
      <div className="background-decoration">
        <div className="decoration-circle circle-1"></div>
        <div className="decoration-circle circle-2"></div>
        <div className="decoration-circle circle-3"></div>
      </div>

      {/* 返回按钮 */}
      <button className="tree-hole-back-button" onClick={() => navigate("/")}>
        ← 返回
      </button>

      {/* 角色显示区 */}
      <div className="characters-container">
        {/* 用户角色（右下角） */}
        {currentMessage.speaker === "user" && (
          <Live2DModelComponent
            modelPath="/tororo_hijiki/tororo/runtime/tororo.model3.json"
            width={300}
            height={450}
            paddingRight={50}
            paddingBottom={154}
            right={200}
          />
        )}

        {/* 树洞角色（左下角） */}
        {currentMessage.speaker === "tree-hole" && (
          <Live2DModelComponent
            modelPath="/tororo_hijiki/hijiki/runtime/hijiki.model3.json"
            width={300}
            height={450}
            paddingRight={50}
            paddingBottom={154}
            right={900}
          />
        )}
      </div>

      {/* 对话框 */}
      {!isWaitingForUser ? (
        <div
          className={`dialogue-box ${currentMessage.speaker === "user" ? "user-dialogue" : "tree-hole-dialogue"}`}
          onClick={handleDialogueClick}
        >
          <div className="dialogue-speaker">
            {currentMessage.speaker === "user" ? "我" : "树洞"}
          </div>
          <div className="dialogue-text">
            {displayedText}
            {isTyping && <span className="typing-cursor">▌</span>}
            {isWaitingForAIResponse && !displayedText && (
              <span className="typing-cursor">▌</span>
            )}
          </div>

          {/* 回看模式提示 */}
          {isReviewMode && (
            <div className="review-mode-indicator">
              <span className="review-icon">📖</span>
              <span className="review-text">
                回看模式 ({currentMessageIndex + 1}/{messageHistory.length})
              </span>
            </div>
          )}

          {showClickHint && !isTyping && (
            <div className="click-hint">
              {isReviewMode ? (
                <>
                  {currentMessageIndex > 0 && (
                    <span className="hint-left">← 上一条</span>
                  )}
                  {currentMessageIndex < messageHistory.length - 1 && (
                    <span className="hint-right">下一条 →</span>
                  )}
                </>
              ) : (
                <>
                  {currentMessageIndex > 0 && (
                    <span className="hint-left">← 回看</span>
                  )}
                  <span className="hint-center">点击继续 ▼</span>
                </>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="dialogue-box user-input-box">
          <div className="dialogue-speaker">我</div>
          <textarea
            className="dialogue-input"
            placeholder="输入你想说的话..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={handleKeyPress}
            autoFocus
          />
          <button
            className="dialogue-submit-button"
            onClick={handleUserSubmit}
            disabled={!userInput.trim()}
          >
            发送
          </button>
        </div>
      )}
    </div>
  );
};

export default TreeHolePage;
