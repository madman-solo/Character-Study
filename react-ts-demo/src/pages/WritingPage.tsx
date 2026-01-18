import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/WritingPage.css';

const WritingPage = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [isRealTimeCorrection, setIsRealTimeCorrection] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [showAIMenu, setShowAIMenu] = useState(false);

  const handleAIImprove = () => {
    if (selectedText) {
      const improved = `[AI优化] ${selectedText}`;
      const newContent = content.replace(selectedText, improved);
      setContent(newContent);
      setShowAIMenu(false);
    }
  };

  const handleAIGenerate = () => {
    const generated = '\n\n[AI生成的句子示例]';
    setContent(content + generated);
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
          <div className="header-controls">
            <label className="correction-toggle">
              <input
                type="checkbox"
                checked={isRealTimeCorrection}
                onChange={(e) => setIsRealTimeCorrection(e.target.checked)}
              />
              <span>实时纠正</span>
            </label>
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
                <button className="ai-menu-btn" onClick={handleAIImprove}>
                  ✨ 优化句子
                </button>
                <button className="ai-menu-btn" onClick={handleAIGenerate}>
                  🤖 AI续写
                </button>
                <button className="ai-menu-btn" onClick={() => setShowAIMenu(false)}>
                  ✕ 关闭
                </button>
              </div>
            )}
          </div>

          {/* 工具栏 */}
          <div className="writing-toolbar">
            <div className="toolbar-left">
              <span className="word-count">{content.length} 字符</span>
              <span className="word-count">{content.split(/\s+/).filter(w => w).length} 词</span>
            </div>
            <div className="toolbar-right">
              <button className="tool-btn" onClick={() => setContent('')}>
                🗑️ 清空
              </button>
              <button className="tool-btn" onClick={handleAIGenerate}>
                🤖 AI辅助
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WritingPage;
