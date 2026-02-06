import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { translateText } from '../services/translationService';
import '../styles/RealTimeTranslationPage.css';

const RealTimeTranslationPage = () => {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [inputLang, setInputLang] = useState('auto');
  const [outputLang, setOutputLang] = useState('zh');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const languages = [
    { code: 'auto', name: '自动检测' },
    { code: 'zh', name: '中文' },
    { code: 'en', name: '英语' },
    { code: 'jp', name: '日语' },
    { code: 'kor', name: '韩语' },
    { code: 'fra', name: '法语' },
    { code: 'de', name: '德语' },
    { code: 'spa', name: '西班牙语' },
    { code: 'ru', name: '俄语' },
    { code: 'ara', name: '阿拉伯语' },
  ];

  /**
   * 输入有效性校验函数
   * 判断输入是否为有效的翻译内容
   * @param text 输入文本
   * @returns 是否有效
   */
  const isValidInput = (text: string): boolean => {
    // 1. 空字符串或仅空格
    if (!text || !text.trim()) {
      return false;
    }

    const trimmedText = text.trim();

    // 2. 仅标点符号（中英文标点）
    const punctuationRegex = /^[.,;!?。，、；！？：""''（）《》【】\s]+$/;
    if (punctuationRegex.test(trimmedText)) {
      return false;
    }

    // 3. 半个单词判断（少于2个字符，且不是完整的中文字符）
    // 对于英文，至少需要2个字符才算完整单词
    // 对于中文，1个字符也可以是完整的
    if (trimmedText.length === 1) {
      // 如果是单个字符，检查是否为中文、日文、韩文等完整字符
      const isCJK = /[\u4e00-\u9fa5\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/.test(trimmedText);
      if (!isCJK) {
        // 单个非CJK字符（如单个英文字母）视为无效
        return false;
      }
    }

    // 4. 仅数字（可选：根据需求决定是否翻译纯数字）
    // const onlyNumbersRegex = /^\d+$/;
    // if (onlyNumbersRegex.test(trimmedText)) {
    //   return false;
    // }

    return true;
  };

  const handleTranslate = async (text: string) => {
    // 输入无效时，直接清空翻译结果，不调用API
    if (!isValidInput(text)) {
      setOutputText('');
      setError('');
      setIsLoading(false);
      return;
    }

    if (text.length > 2000) {
      setError('建议单次翻译长度控制在2000字符以内');
    }

    if (outputLang === 'auto') {
      setError('目标语言不能设置为自动检测');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await translateText(text, inputLang, outputLang);

      if (result.trans_result && result.trans_result.length > 0) {
        const translated = result.trans_result.map(item => item.dst).join('\n');
        setOutputText(translated);
      } else {
        setError('翻译失败，请重试');
      }
    } catch (err: any) {
      console.error('Translation error:', err);
      setError(err.message || '翻译失败，请检查网络连接');
    } finally {
      setIsLoading(false);
    }
  };

  // 实时翻译：当输入文本变化时，延迟500ms后自动翻译
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      handleTranslate(inputText);
    }, 500);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [inputText, inputLang, outputLang]);

  const handleClear = () => {
    setInputText('');
    setOutputText('');
    setError('');
  };

  const handleCopy = async () => {
    if (outputText) {
      try {
        await navigator.clipboard.writeText(outputText);
        alert('翻译结果已复制到剪贴板');
      } catch (err) {
        console.error('Failed to copy:', err);
      }
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
              placeholder="请输入要翻译的内容（建议2000字符以内）..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              maxLength={6000}
            />
            <div className="panel-footer">
              <span className="char-count">{inputText.length} 字符</span>
              {isLoading && <span className="loading-indicator">翻译中...</span>}
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

        {/* 错误提示 */}
        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        {/* 使用提示 */}
        <div className="translation-tips">
          <p>💡 使用提示：</p>
          <ul>
            <li>支持多种语言互译，实时翻译</li>
            <li>建议单次翻译长度控制在2000字符以内</li>
            <li>源语言可设置为"自动检测"</li>
            <li>输入文本后会自动翻译，无需点击按钮</li>
            <li>输入有效性：至少2个字符（中文/日文/韩文1个字符即可），不能仅为空格或标点</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RealTimeTranslationPage;
