import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/SpeakingPage.css";
import Live2DModelComponent from "../components/Live2DModel";
import { chat, buildContextMessages } from "../services/chatService";
// import { log } from "console";
interface ConversationMessage {
  id: string;
  speaker: "user" | "character";
  text: string;
  words?: string[];
  timestamp: Date;
  score?: number;
}

const SpeakingPage = () => {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [showTranscript, setShowTranscript] = useState(true);
  const [conversations, setConversations] = useState<ConversationMessage[]>([
    {
      id: "1",
      speaker: "character",
      text: "Hello! How are you today?",
      words: ["Hello", "How", "are", "you", "today"],
      timestamp: new Date(),
    },
  ]);
  const [interimText, setInterimText] = useState(""); // 识别中的实时文字
  // 新方案：用 ScriptProcessorNode 直接采集原始 PCM，彻底告别 ffmpeg 转换
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const pcmChunksRef = useRef<Float32Array[]>([]); // 收集原始 float32 PCM

  const isRecordingRef = useRef(false);

  const handleUserSpeechRef = useRef<(text: string, score: number) => void>(
    () => {},
  );

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const animationRef = useRef<number>(0);

  const audioCtxRef = useRef<AudioContext | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [aiSubtitle, setAiSubtitle] = useState("");
  const conversationsRef = useRef<ConversationMessage[]>([]); // 同步 ref 用于闭包

  const [report, setReport] = useState("");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const playTTS = async (text: string) => {
    setIsAiSpeaking(true);
    const audio = new Audio(
      `http://localhost:3001/api/speaking-tts/speak?text=${encodeURIComponent(text)}`,
    );
    await new Promise<void>((resolve) => {
      audio.onended = () => resolve();
      audio.onerror = () => resolve();
      audio.play();
    });
    setIsAiSpeaking(false);
  };

  //用户说完话之后调用AI获取回复，再用TTS播放：
  const handleUserSpeech = useCallback(async (text: string, score: number) => {
    console.log("[AI] 用户输入：", text);

    // 1. 添加用户消息
    const userMsg: ConversationMessage = {
      id: crypto.randomUUID(),
      speaker: "user",
      text,
      timestamp: new Date(),
      score,
    };
    setConversations((prev) => [...prev, userMsg]);
    setShowTranscript(true);

    // 2. 调用 AI
    setIsAiThinking(true);
    const history = buildContextMessages(
      conversationsRef.current.map((m) => ({
        sender: m.speaker,
        content: m.text,
      })),
    );

    const response = await chat({
      scene: "english",
      messages: [...history, { role: "user", content: text }],
    });
    console.log("[AI] 回复：", response.content);
    setIsAiThinking(false);

    // 3. 添加 AI 消息（带字幕）
    const aiMsg: ConversationMessage = {
      id: crypto.randomUUID(),
      speaker: "character",
      text: response.content,
      timestamp: new Date(),
    };
    setConversations((prev) => [...prev, aiMsg]);
    setAiSubtitle(response.content);

    // 4. TTS 播放
    await playTTS(response.content);
    setAiSubtitle("");
    setInterimText("");
  }, []);

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  useEffect(() => {
    handleUserSpeechRef.current = handleUserSpeech;
  }, [handleUserSpeech]);

  // 可视化：接收已有 AudioContext 和 stream，不重复创建
  const startAudioVisualization = (
    audioCtx: AudioContext,
    stream: MediaStream,
  ) => {
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 128;
    audioCtx.createMediaStreamSource(stream).connect(analyser);
    const data = new Uint8Array(analyser.frequencyBinCount);
    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d")!;
      analyser.getByteFrequencyData(data);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = canvas.width / data.length - 1;
      data.forEach((value, i) => {
        const barHeight = (value / 255) * canvas.height;
        ctx.fillStyle = `rgba(255, 72, 87, ${0.5 + value / 510})`;
        ctx.fillRect(
          i * (barWidth + 1),
          canvas.height - barHeight,
          barWidth,
          barHeight,
        );
      });
    };
    draw();
  };

  // 降采样到 16000Hz（线性插值）
  const resampleTo16k = (
    chunks: Float32Array[],
    sourceSampleRate: number,
  ): Float32Array => {
    const totalInput = chunks.reduce((s, c) => s + c.length, 0);
    const outputLength = Math.ceil((totalInput * 16000) / sourceSampleRate);
    const output = new Float32Array(outputLength);
    const ratio = sourceSampleRate / 16000;
    const getSample = (idx: number) => {
      let remaining = idx;
      for (const chunk of chunks) {
        if (remaining < chunk.length) return chunk[remaining];
        remaining -= chunk.length;
      }
      return 0;
    };
    for (let i = 0; i < outputLength; i++) {
      const srcIdx = i * ratio;
      const lo = Math.floor(srcIdx);
      const hi = Math.min(lo + 1, totalInput - 1);
      const frac = srcIdx - lo;
      output[i] = getSample(lo) * (1 - frac) + getSample(hi) * frac;
    }
    return output;
  };

  // Float32 → Int16 PCM
  const float32ToPcm16 = (samples: Float32Array): ArrayBuffer => {
    const buffer = new ArrayBuffer(samples.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < samples.length; i++) {
      const s = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    return buffer;
  };

  const sendAudioToASR = async (pcmBuffer: ArrayBuffer) => {
    console.log(
      "[前端] sendAudioToASR，PCM大小：",
      pcmBuffer.byteLength,
      "bytes",
    );
    console.log(
      "[前端] 对应时长（16kHz）：",
      (pcmBuffer.byteLength / 2 / 16000).toFixed(2),
      "秒",
    );
    if (pcmBuffer.byteLength < 16000 * 2 * 0.5) {
      setInterimText("录音太短，请重试");
      return;
    }
    try {
      setInterimText("识别中...");
      const response = await fetch("http://localhost:3001/api/asr/recognize", {
        method: "POST",
        headers: { "Content-Type": "audio/pcm" },
        body: pcmBuffer,
      });
      const data = await response.json();
      if (data.text) {
        setInterimText(data.text);
        await handleUserSpeech(data.text, 0);
      } else {
        setInterimText("未能识别，请重试");
      }
    } catch (err) {
      console.error("ASR 请求失败:", err);
      setInterimText("识别失败，请重试");
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      streamRef.current = stream;

      // 单个 AudioContext，设备原生采样率
      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;
      console.log("[前端] 开始录音，实际采样率：", audioCtx.sampleRate);

      startAudioVisualization(audioCtx, stream);

      const source = audioCtx.createMediaStreamSource(stream);
      const processor = audioCtx.createScriptProcessor(4096, 1, 1);
      pcmChunksRef.current = [];

      processor.onaudioprocess = (e) => {
        if (!isRecordingRef.current) return;
        pcmChunksRef.current.push(
          new Float32Array(e.inputBuffer.getChannelData(0)),
        );
      };

      source.connect(processor);
      processor.connect(audioCtx.destination);
      scriptProcessorRef.current = processor;
    } catch {
      alert("请允许麦克风权限！");
      isRecordingRef.current = false;
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    isRecordingRef.current = false;
    setIsRecording(false);

    scriptProcessorRef.current?.disconnect();
    scriptProcessorRef.current = null;

    streamRef.current?.getTracks().forEach((t) => t.stop());
    cancelAnimationFrame(animationRef.current);
    if (audioCtxRef.current?.state !== "closed") audioCtxRef.current?.close();
    const canvas = canvasRef.current?.getContext("2d");
    if (canvas && canvasRef.current) {
      canvas.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }

    const chunks = pcmChunksRef.current;
    pcmChunksRef.current = [];
    console.log("[前端] 录音停止，共", chunks.length, "个chunk");

    if (chunks.length === 0) {
      setInterimText("未录到声音，请重试");
      return;
    }

    // 用实际采样率降采样到 16000Hz
    const actualSampleRate = audioCtxRef.current?.sampleRate ?? 48000;
    const resampled = resampleTo16k(chunks, actualSampleRate);
    const pcmBuffer = float32ToPcm16(resampled);
    await sendAudioToASR(pcmBuffer);
  };

  const handleRecordClick = () => {
    if (isRecordingRef.current) {
      stopRecording();
    } else {
      isRecordingRef.current = true;
      setIsRecording(true);
      setInterimText("");
      startRecording();
    }
  };

  // //停止可视化：
  // const stopVisualization = () => {
  //   cancelAnimationFrame(animationRef.current);
  //   streamRef.current?.getTracks().forEach((t) => t.stop()); //关闭麦克风
  //   if (audioCtxRef.current?.state !== "closed") audioCtxRef.current?.close();
  //   //清空canvas：
  //   const ctx = canvasRef.current?.getContext("2d");
  //   if (ctx && canvasRef.current) {
  //     ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  //   }
  // };

  // const handleRecordClick = () => {
  //   if (isRecordingRef.current) {
  //     stopRecording();
  //   } else {
  //     isRecordingRef.current = true;
  //     setIsRecording(true);
  //     setInterimText("");
  //     startRecording();
  //   }
  // };

  //生成报告：
  const generateReport = async () => {
    if (conversations.length < 2) return;

    setIsGeneratingReport(true);

    // 构建对话摘要
    const dialogSummary = conversations
      .map(
        (m) =>
          `${m.speaker === "user" ? "学生" : "AI"}：${m.text}${m.score ? `（发音评分：${m.score}）` : ""}`,
      )
      .join("\n");

    const prompt = `以下是一段英语口语练习对话记录：\n\n${dialogSummary}\n\n
请生成一份口语测评报告，包含：
1. 整体评价（流利度、准确度、词汇量）
2. 发音纠正建议（列出具体错误和正确发音）
3. 语法问题（如有）
4. 改进建议
请用中文回答，格式清晰。`;

    const response = await chat({
      scene: "english",
      messages: [{ role: "user", content: prompt }],
      systemPrompt:
        "你是一位专业的英语口语教师，请给出详细、专业的口语测评报告。",
    });

    setReport(response.content);
    setShowReport(true);
    setIsGeneratingReport(false);
  };
  return (
    // TODO:在用户消息气泡中显示分数
    <div className="speaking-page">
      {/* 左侧：角色显示区 */}
      <div className="character-display">
        <div className="character-container">
          {/*  集成Live2D角色 */}

          <Live2DModelComponent
            modelPath="/tororo_hijiki/hijiki/runtime/hijiki.model3.json"
            width={900}
            height={1000}
            paddingBottom={140}
          />
          {aiSubtitle && (
            <div className="ai-subtitle">
              <span className="subtitle-text">{aiSubtitle}</span>
            </div>
          )}
          {isAiThinking && <div className="ai-thinking">AI 正在思考...</div>}
          {isAiSpeaking && <div className="ai-thinking">AI 正在说话...</div>}
        </div>

        <div className="speaking-controls">
          <canvas
            ref={canvasRef}
            width={280}
            height={50}
            className={`waveform-canvas ${isRecording ? "active" : ""}`}
          />

          {interimText && <div className="interim-text">{interimText}</div>}

          <button
            className={`record-button ${isRecording ? "recording" : ""}`}
            onClick={handleRecordClick}
            disabled={isAiThinking || isAiSpeaking}
            aria-disabled={isAiThinking || isAiSpeaking}
            aria-label={isRecording ? "停止录音" : "开始录音"}
          >
            <span className="record-icon">
              {isRecording ? (
                "⏹"
              ) : (
                <img
                  src="/src/assets/iconfont/麦克风.svg"
                  alt="麦克风"
                  width={48}
                  height={48}
                />
              )}
            </span>
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

          <button
            className="end-session-button"
            onClick={generateReport}
            disabled={isGeneratingReport || conversations.length < 2}
            aria-disabled={isGeneratingReport || conversations.length < 2}
          >
            {isGeneratingReport ? "生成中..." : "结束对话 & 生成报告"}
          </button>
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
                {message.score !== undefined && (
                  <div
                    className={`score-badge ${message.score >= 80 ? "score-good" : message.score >= 60 ? "score-ok" : "score-poor"}`}
                  >
                    发音评分：{message.score}分
                  </div>
                )}
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
        {showReport && (
          <div
            className="report-modal-overlay"
            onClick={() => setShowReport(false)}
          >
            <div
              className="report-modal-speaking"
              onClick={(e) => e.stopPropagation()}
            >
              <h2>口语测评报告</h2>
              <div className="report-content">{report}</div>
              <button onClick={() => setShowReport(false)}>关闭</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpeakingPage;
