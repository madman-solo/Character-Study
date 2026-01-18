import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/RealTimeTranslationPage.css';

const RealTimeTranslationPage = () => {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [inputLang, setInputLang] = useState('auto');
  const [outputLang, setOutputLang] = useState('zh-CN');

  const languages = [
    { code: 'auto', name: '自动检测' },
    { code: 'zh-CN', name: '中文' },
    { code: 'en', name: '英语' },
    { code: 'ja', name: '日语' },
    { code: 'ko', name: '韩语' },
    { code: 'fr', name: '法语' },
    { code: 'de', name: '德语' },
    { code: 'es', name: '西班牙语' },
    { code: 'ru', name: '俄语' },
    { code: 'ar', name: '阿拉伯语' },
  ];

  const handleTranslate = () => {
    // 模拟翻译功能
    if (inputText.trim()) {
      setOutputText(`[翻译结果] ${inputText}`);
    }
  };

  const handleClear = () => {
    setInputText('');
    setOutputText('');
  };

  const handleCopy = () => {
    if (outputText) {
      navigator.clipboard.writeText(outputText);
      alert('翻译结果已复制到剪贴板');
    }
  };

  return (
    <div className="translation-page">
      <div className="translation-container">
        {/* 头部 */}
        <div className="translation-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            ← 返回
          </button>
          <h1 className="translation-title">实时翻译</h1>
          <div className="header-spacer"></div>
        </div>

        {/* 翻译区域 */}
        <div className="translation-content">
          {/* 输入区域 */}
          <div className="translation-panel input-panel">
            <div className="panel-header">
              <select
                className="language-select"
                value={inputLang}
                onChange={(e) => setInputLang(e.target.value)}
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
              <button className="clear-button" onClick={handleClear}>
                清空
              </button>
            </div>
            <textarea
              className="translation-textarea"
              placeholder="请输入要翻译的内容..."
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                handleTranslate();
              }}
            />
            <div className="panel-footer">
              <span className="char-count">{inputText.length} 字符</span>
            </div>
          </div>

          {/* 输出区域 */}
          <div className="translation-panel output-panel">
            <div className="panel-header">
              <select
                className="language-select"
                value={outputLang}
                onChange={(e) => setOutputLang(e.target.value)}
              >
                {languages.filter((lang) => lang.code !== 'auto').map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
              <button className="copy-button" onClick={handleCopy}>
                📋 复制
              </button>
            </div>
            <div className="translation-output">
              {outputText || '翻译结果将显示在这里...'}
            </div>
            <div className="panel-footer">
              <span className="char-count">{outputText.length} 字符</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeTranslationPage;
