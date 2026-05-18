import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/WritingPage.css";

const WritingPage = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState("");
  const [, setIsRealTimeCorrection] = useState(false); // reserved for future use
  void setIsRealTimeCorrection;
  const [, setSelectedText] = useState("");
  const [showAIMenu, setShowAIMenu] = useState(false); //是否显示AI菜单
  const [, setIsCorrecting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [report, setReport] = useState<{
    score: number;
    summary: string;
    suggestions: string[];
    optimized: string;
  } | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<
    {
      id: number;
      title: string;
      score: number;
      createdAt: string;
      content: string;
      feedback: string;
    }[]
  >([]);
  const [title, setTitle] = useState("");
  const userId = localStorage.getItem("userId") || "guest";

  //AI纠正
  const handleCorrect = async () => {
    if (!content.trim()) return;
    setIsCorrecting(true);
    const res = await fetch("http://localhost:3001/api/writing/correct", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: content }),
    });
    const data = await res.json();
    setContent(data.corrected);
    setIsCorrecting(false);
    setShowAIMenu(false);
  };
  //提交函数
  const handleSubmit = async () => {
    if (!content.trim()) return;
    setIsSubmitting(true);
    const res = await fetch("http://localhost:3001/api/writing/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, title: title || "无标题", content }),
    });
    const data = await res.json();
    setReport(data.feedback);
    setShowReport(true);
    setIsSubmitting(false);
  };
  //加载历史函数
  const loadHistory = async () => {
    const res = await fetch(
      `http://localhost:3001/api/writing/history/${userId}`,
    );
    const data = await res.json();
    setHistory(Array.isArray(data) ? data : []);
    setShowHistory(true);
  };

  //AI续写
  const handleContinue = async () => {
    if (!content.trim()) return;
    const res = await fetch("http://localhost:3001/api/writing/continue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: content }),
    });
    const data = await res.json();
    setContent(data.continued);
    setShowAIMenu(false);
  };

  const handleTextSelect = () => {
    const selection = window.getSelection();
    const text = selection?.toString();
    if (text && text.length > 0) {
      setSelectedText(text);
      setShowAIMenu(true);
    } else {
      setShowAIMenu(false);
    }
  };

  return (
    <div className="writing-page">
      <div className="writing-container">
        {/* 头部 */}
        <div className="writing-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            ← 返回
          </button>
          <h1 className="writing-title">AI写作助手</h1>
          <input
            className="writing-title-input"
            placeholder="作文标题..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div className="header-controls">
            <button className="tool-btn" onClick={loadHistory}>
              历史作文
            </button>
          </div>
        </div>

        {/* 写作区域 */}
        <div className="writing-content">
          <div className="writing-editor">
            <textarea
              className="writing-textarea"
              placeholder="开始你的写作之旅..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onMouseUp={handleTextSelect}
            />

            {showAIMenu && (
              <div className="ai-menu">
                <button className="ai-menu-btn" onClick={handleCorrect}>
                  实施纠正
                </button>
                <button className="ai-menu-btn" onClick={handleContinue}>
                  AI续写
                </button>
                <button
                  className="ai-menu-btn"
                  onClick={() => setShowAIMenu(false)}
                >
                  ✕ 关闭
                </button>
              </div>
            )}
          </div>

          {/* 工具栏 */}
          <div className="writing-toolbar">
            <div className="toolbar-left">
              <span className="word-count">{content.length} 字符</span>
              <span className="word-count">
                {content.split(/\s+/).filter((w) => w).length} 词
              </span>
            </div>
            <div className="toolbar-right">
              <button className="tool-btn" onClick={() => setContent("")}>
                清空
              </button>
              <button
                className="tool-btn"
                onClick={handleSubmit}
                disabled={isSubmitting}
                aria-disabled={isSubmitting}
              >
                {isSubmitting ? "提交中..." : "提交作文"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showReport && report && (
        <div
          className="report-modal-overlay"
          role="button" tabIndex={0} aria-label="关闭"
          onClick={() => setShowReport(false)}
          onKeyDown={(e) => e.key === 'Enter' && setShowReport(false)}
        >
          <div className="report-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="report-writing-title">作文评分报告</h2>
            <div className="report-score">得分：{report.score} 分</div>
            <p className="report-summary-writing">{report.summary}</p>
            <h3 className="suggestions-title-writing">改进建议</h3>
            <ul className="suggestions-list-writing">
              {report.suggestions.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
            <h3 className="optimized-writing">优化版本</h3>
            <pre className="report-optimized">{report.optimized}</pre>
            <button
              className="close-btn-writing"
              onClick={() => setShowReport(false)}
            >
              关闭
            </button>
          </div>
        </div>
      )}
      {showHistory && (
        <div
          className="report-modal-overlay"
          role="button" tabIndex={0} aria-label="关闭"
          onClick={() => setShowHistory(false)}
          onKeyDown={(e) => e.key === 'Enter' && setShowHistory(false)}
        >
          <div className="report-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="report-history-title">历史作文</h2>
            {history.length === 0 && (
              <p className="no-history-essay">暂无历史作文</p>
            )}
            {history.map((e) => (
              <div
                key={e.id}
                className="history-item"
                onClick={() => {
                  setContent(e.content);
                  setTitle(e.title);
                  setShowHistory(false);
                }}
              >
                <span>{e.title}</span>
                <span>{e.score != null ? `${e.score}分` : "未评分"}</span>
                <span>{new Date(e.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
            <button
              className="close-btn-history-writing"
              onClick={() => setShowHistory(false)}
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WritingPage;
