import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/IntensiveDetailPage.css";

interface Sentence {
  start: number;
  end: number;
  text: string;
}

interface Question {
  id: number;
  questionText: string;
  options: string;
  answer: number;
  explanation: string;
}

interface Material {
  id: number;
  title: string;
  audioUrl: string;
  duration: string;
  level: string;
  transcript: string;
  sentences: string | null;
  questions: Question[];
}

type Phase = "preview" | "locked" | "quiz" | "free";

const API = "http://localhost:3001";

export default function IntensiveDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement>(null);

  const [material, setMaterial] = useState<Material | null>(null);
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [phase, setPhase] = useState<Phase>("preview");
  const [showTranscript, setShowTranscript] = useState(false);
  const [showQuiz, setShowQuiz] = useState(true);

  // 播放状态
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [loop, setLoop] = useState(false);
  const [activeSentence, setActiveSentence] = useState(-1);

  // 锁定阶段：循环播放两遍计数
  const playCountRef = useRef(0);

  // 答题状态
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  //左右切换，拉取同类型句子id
  const [allIds, setAllIds] = useState<number[]>([]);

  //列表请求
  useEffect(() => {
    fetch(`${API}/api/listening/materials?type=intensive`)
      .then((r) => r.json())
      .then((list: { id: number }[]) => setAllIds(list.map((m) => m.id)));
  }, []);

  // 加载素材
  useEffect(() => {
    fetch(`${API}/api/listening/material/${id}`)
      .then((r) => r.json())
      .then((data: Material) => {
        setMaterial(data);
        if (data.sentences) {
          try {
            setSentences(JSON.parse(data.sentences));
          } catch {}
        }
      });
  }, [id]);

  // 同步倍速
  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = speed;
  }, [speed]);

  // 时间更新 → 高亮句子
  const handleTimeUpdate = useCallback(() => {
    const t = audioRef.current?.currentTime ?? 0;
    setCurrentTime(t);
    const idx = sentences.findIndex((s) => t >= s.start && t < s.end);
    setActiveSentence(idx);
  }, [sentences]);

  // 锁定阶段：播放结束处理
  const handleEnded = useCallback(() => {
    if (phase === "locked") {
      playCountRef.current += 1;
      if (playCountRef.current < 2) {
        audioRef.current?.play();
      } else {
        setPlaying(false);
        setPhase("quiz");
        setShowQuiz(true);
      }
    } else if (loop) {
      audioRef.current?.play();
    } else {
      setPlaying(false);
    }
  }, [phase, loop]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (phase === "locked") return;
    const t = Number(e.target.value);
    if (audioRef.current) audioRef.current.currentTime = t;
    setCurrentTime(t);
  };

  const handleSentenceClick = (s: Sentence) => {
    if (phase === "locked") return;
    if (audioRef.current) {
      audioRef.current.currentTime = s.start;
      audioRef.current.play();
      setPlaying(true);
    }
  };

  const formatTime = (t: number) => {
    const m = Math.floor(t / 60)
      .toString()
      .padStart(2, "0");
    const s = Math.floor(t % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  };

  // 开始精听（关闭预览题目后）
  const startListening = () => {
    setShowQuiz(false);
    setPhase("locked");
    playCountRef.current = 0;
    audioRef.current?.play();
    setPlaying(true);
  };

  // 进入自由阶段（答完题后）
  const enterFree = () => {
    setSubmitted(true);
    setPhase("free");
    setShowTranscript(true);
  };

  //左右切换：根据当前id索引，获取前一个和后一个id
  const currentIndex = allIds.indexOf(material?.id ?? -1);
  const prevId = currentIndex > 0 ? allIds[currentIndex - 1] : null;
  const nextId =
    currentIndex >= 0 && currentIndex < allIds.length - 1
      ? allIds[currentIndex + 1]
      : null;

  if (!material) return <div className="idp-loading" role="status" aria-live="polite">加载中...</div>;

  return (
    <div className="idp-root">
      {/* 音频元素 */}
      <audio
        ref={audioRef}
        src={`${API}${material.audioUrl}`}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
        onEnded={handleEnded}
      />

      {/* 顶部标题栏 */}
      <header className="idp-header">
        <button className="idp-back" onClick={() => navigate("/listening")}>
          ←
        </button>
        <div className="idp-title-wrap">
          <h1 className="idp-title">{material.title}</h1>
          <span className="idp-level">{material.level}</span>
        </div>
        {phase === "free" && (
          <button
            className="idp-toggle-transcript"
            onClick={() => setShowTranscript((v) => !v)}
          >
            {showTranscript ? "隐藏原文" : "显示原文"}
          </button>
        )}
      </header>

      {/* 主内容区 */}
      <main className="idp-main">
        {phase === "preview" && !showQuiz && (
          <div className="idp-locked-hint">
            <div className="idp-locked-icon">📋</div>
            <p>先预览题目，再开始精听</p>
            <button
              className="idp-modal-close"
              style={{ marginTop: 16 }}
              onClick={() => setShowQuiz(true)}
            >
              查看题目 & 开始
            </button>
          </div>
        )}
        {phase === "locked" && (
          <div className="idp-locked-hint">
            <div className="idp-locked-icon">🎧</div>
            <p>请专注聆听，共循环播放 2 遍</p>
            <p className="idp-locked-sub">播放结束后将进入答题环节</p>
          </div>
        )}

        {(phase === "free" || phase === "quiz") &&
          showTranscript &&
          sentences.length > 0 && (
            <div className="idp-transcript">
              {sentences.map((s, i) => (
                <span
                  key={i}
                  className={`idp-sentence ${activeSentence === i ? "active" : ""}`}
                  onClick={() => handleSentenceClick(s)}
                >
                  {s.text}{" "}
                </span>
              ))}
            </div>
          )}

        {(phase === "free" || phase === "quiz") &&
          showTranscript &&
          sentences.length === 0 && (
            <div className="idp-transcript">
              <p>{material.transcript}</p>
            </div>
          )}
      </main>

      {/* 底部播放控制栏 */}
      <footer className="idp-footer">
        <div className="idp-progress-row">
          <span className="idp-time">{formatTime(currentTime)}</span>
          <input
            type="range"
            className="idp-progress"
            min={0}
            max={duration || 1}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            disabled={phase === "locked"}
          />
          <span className="idp-time">{formatTime(duration)}</span>
        </div>

        <div className="idp-controls-row">
          <button
            className="idp-ctrl-btn"
            onClick={() =>
              prevId && prevId > 0 && navigate(`/listening/intensive/${prevId}`)
            }
            disabled={!prevId}
            aria-disabled={!prevId}
            aria-label="上一篇"
          >
            <span aria-hidden="true">◀</span>
          </button>

          <button className="idp-play-btn" onClick={togglePlay} aria-label={playing ? "暂停" : "播放"}>
            <span aria-hidden="true">{playing ? "⏸" : "▶"}</span>
          </button>

          <button
            className="idp-ctrl-btn"
            onClick={() => nextId && navigate(`/listening/intensive/${nextId}`)}
            aria-label="下一篇"
            disabled={!nextId}
            aria-disabled={!nextId}
          >
            <span aria-hidden="true">▶▶</span>
          </button>

          <button
            className={`idp-loop-btn ${loop ? "active" : ""}`}
            onClick={() => setLoop((v) => !v)}
            title={loop ? "循环播放" : "顺序播放"}
          >
            {loop ? "🔁" : "➡️"}
          </button>

          <select
            className="idp-speed"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          >
            {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
              <option key={s} value={s}>
                {s}x
              </option>
            ))}
          </select>

          {phase === "free" && (
            <button className="idp-quiz-btn" onClick={() => setShowQuiz(true)}>
              查看题目
            </button>
          )}
        </div>
      </footer>

      {/* 题目模态框 */}
      {showQuiz && (
        <div className="idp-modal-overlay">
          <div className="idp-modal">
            <div className="idp-modal-header">
              <h2>题目</h2>
              {phase === "preview" ? (
                <button className="idp-modal-close" onClick={startListening}>
                  关闭并开始精听
                </button>
              ) : (
                <button
                  className="idp-modal-close"
                  onClick={() => setShowQuiz(false)}
                >
                  ✕
                </button>
              )}
            </div>

            <div className="idp-modal-body">
              {material.questions.map((q, qi) => {
                const opts: string[] = JSON.parse(q.options);
                return (
                  <div key={q.id} className="idp-question">
                    <p className="idp-q-text">
                      {qi + 1}. {q.questionText}
                    </p>
                    <div className="idp-options">
                      {opts.map((opt, oi) => {
                        const selected = answers[q.id] === oi;
                        const correct = submitted && oi === q.answer;
                        const wrong = submitted && selected && oi !== q.answer;
                        return (
                          <button
                            key={oi}
                            className={`idp-option ${selected ? "selected" : ""} ${correct ? "correct" : ""} ${wrong ? "wrong" : ""}`}
                            onClick={() =>
                              !submitted &&
                              setAnswers((a) => ({ ...a, [q.id]: oi }))
                            }
                          >
                            {["A", "B", "C", "D"][oi]}. {opt}
                          </button>
                        );
                      })}
                    </div>
                    {submitted && (
                      <p className="idp-explanation">💡 {q.explanation}</p>
                    )}
                  </div>
                );
              })}
            </div>

            {phase === "quiz" && !submitted && (
              <div className="idp-modal-footer">
                <button className="idp-submit-btn" onClick={enterFree}>
                  提交答案
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
