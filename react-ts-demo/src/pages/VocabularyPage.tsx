import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { VocabularyBookType } from '../types';
import { fetchWordsByBookType } from '../services/vocabularyService';
import { trackWordProgress } from '../services/spacedRepetitionService';
import '../styles/VocabularyPage.css';

// 单词数据接口
interface Word {
  id: string;
  word: string;
  phonetic: string;
  translation: string;
  example: string;
  definition?: string;
  pos?: string;
  collins?: number;
  oxford?: boolean;
  tag?: string;
}

const VocabularyPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { bookType: urlBookType } = useParams<{ bookType: string }>();

  // 解码 URL 参数并验证
  const bookType = (urlBookType ? decodeURIComponent(urlBookType) : '初一') as VocabularyBookType;

  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBlurred, setIsBlurred] = useState(false);

  // 加载单词数据
  useEffect(() => {
    const loadWords = async () => {
      setLoading(true);

      // 直接从本地数据库获取单词列表（获取所有单词，不限制数量）
      const wordList = await fetchWordsByBookType(bookType, 0);

      console.log(`Loaded ${wordList.length} words for ${bookType}`);
      setWords(wordList);
      setLoading(false);
    };

    loadWords();
  }, [bookType]);

  const currentWord = words[currentWordIndex];

  const handleNext = () => {
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
      setUserInput('');
      setShowAnswer(false);
      setIsBlurred(false);
    }
  };

  const handlePrevious = () => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex(currentWordIndex - 1);
      setUserInput('');
      setShowAnswer(false);
      setIsBlurred(false);
    }
  };

  const handleCheck = async () => {
    setShowAnswer(true);
    setIsBlurred(false);

    // 判断答案是否正确
    if (currentWord && user) {
      const isCorrect = userInput.toLowerCase() === currentWord.word.toLowerCase();

      try {
        // 调用后端API保存进度（这样单词会进入艾宾浩斯复习系统）
        await trackWordProgress(user.id, parseInt(currentWord.id), bookType, isCorrect);
        console.log(`${isCorrect ? '✅' : '❌'} 单词${isCorrect ? '答对' : '答错'}了，已加入复习系统:`, currentWord.word);
      } catch (error) {
        console.error("保存单词进度失败:", error);
      }
    }
  };

  const handleInputFocus = () => {
    setIsBlurred(true);
  };

  return (
    <div className="vocabulary-page">
      {/* 左侧导航栏 */}
      <div className={`sidebar ${isNavCollapsed ? 'collapsed' : ''} ${isBlurred ? 'blurred' : ''}`}>
        <div className="sidebar-header">
          <h2>{!isNavCollapsed && '单词本学习'}</h2>
          <button
            className="collapse-button"
            onClick={() => setIsNavCollapsed(!isNavCollapsed)}
          >
            {isNavCollapsed ? '→' : '←'}
          </button>
        </div>

        {!isNavCollapsed && (
          <>
            <div className="sidebar-content">
              <div className="book-info">
                <h3>{bookType}</h3>
                <p>共 {words.length} 个单词</p>
                <p>当前进度: {currentWordIndex + 1}/{words.length}</p>
              </div>

              {loading ? (
                <div className="loading-message">加载中...</div>
              ) : (
                <div className="word-list">
                  {words.map((word, index) => (
                    <div
                      key={word.id}
                      className={`word-item ${index === currentWordIndex ? 'active' : ''}`}
                      onClick={() => {
                        setCurrentWordIndex(index);
                        setUserInput('');
                        setShowAnswer(false);
                      }}
                    >
                      <span className="word-number">{index + 1}</span>
                      <span className="word-text">{word.word}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="sidebar-actions">
              <button className="review-button" onClick={() => navigate(`/vocabulary-review/${bookType}`)}>
                📝 开始复习
              </button>
              <button className="back-home-button" onClick={() => navigate('/')}>
                返回首页
              </button>
            </div>
          </>
        )}
      </div>

      {/* 右侧内容区 */}
      <div className="content-area">
        {loading ? (
          <div className="loading-container">
            <p>正在加载单词数据...</p>
          </div>
        ) : (
          <>
            {/* 左边：单词页 */}
            <div className={`word-display ${isBlurred ? 'blurred' : ''}`}>
              <div className="word-card">
                <h2 className="word-title">{currentWord?.word}</h2>
                <p className="word-phonetic">{currentWord?.phonetic}</p>
                <p className="word-translation">{currentWord?.translation}</p>
                <div className="word-example">
                  <h4>例句：</h4>
                  <p>{currentWord?.example}</p>
                </div>

                <div className="navigation-buttons">
                  <button
                    onClick={handlePrevious}
                    disabled={currentWordIndex === 0}
                    className="nav-button"
                  >
                    上一个
                  </button>
                  <span className="word-counter">
                    {currentWordIndex + 1} / {words.length}
                  </span>
                  <button
                    onClick={handleNext}
                    disabled={currentWordIndex === words.length - 1}
                    className="nav-button"
                  >
                    下一个
                  </button>
                </div>
              </div>
            </div>

            {/* 右边：默写页 */}
            <div className="dictation-area">
              <div className="dictation-card">
                <h3>单词默写</h3>
                <div className="dictation-prompt">
                  <p className="prompt-text">请根据中文意思写出单词：</p>
                  <p className="prompt-translation">{currentWord?.translation}</p>
                </div>

                <input
                  type="text"
                  className="dictation-input"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onFocus={handleInputFocus}
                  placeholder="在此输入单词..."
                />

                <button className="check-button" onClick={handleCheck}>
                  检查答案
                </button>

                {showAnswer && (
                  <div className={`answer-feedback ${userInput.toLowerCase() === currentWord?.word.toLowerCase() ? 'correct' : 'incorrect'}`}>
                    {userInput.toLowerCase() === currentWord?.word.toLowerCase() ? (
                      <div className="correct-answer">
                        <span className="feedback-icon">✓</span>
                        <span>回答正确！</span>
                      </div>
                    ) : (
                      <div className="incorrect-answer">
                        <span className="feedback-icon">✗</span>
                        <div>
                          <p>正确答案是: <strong>{currentWord?.word}</strong></p>
                          <p>你的答案: {userInput || '(未填写)'}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VocabularyPage;
