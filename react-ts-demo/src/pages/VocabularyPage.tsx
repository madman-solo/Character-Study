import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { VocabularyBookType } from '../types';
import '../styles/VocabularyPage.css';

// 模拟单词数据
interface Word {
  id: string;
  word: string;
  phonetic: string;
  translation: string;
  example: string;
}

const mockWords: Record<VocabularyBookType, Word[]> = {
  '初一': [
    { id: '1', word: 'hello', phonetic: '/həˈləʊ/', translation: '你好', example: 'Hello, how are you?' },
    { id: '2', word: 'world', phonetic: '/wɜːld/', translation: '世界', example: 'Welcome to the world.' },
    { id: '3', word: 'book', phonetic: '/bʊk/', translation: '书', example: 'I have a book.' },
  ],
  '初二': [
    { id: '1', word: 'study', phonetic: '/ˈstʌdi/', translation: '学习', example: 'I study English every day.' },
    { id: '2', word: 'friend', phonetic: '/frend/', translation: '朋友', example: 'She is my best friend.' },
  ],
  '初三': [
    { id: '1', word: 'important', phonetic: '/ɪmˈpɔːtnt/', translation: '重要的', example: 'This is very important.' },
  ],
  '高一': [
    { id: '1', word: 'knowledge', phonetic: '/ˈnɒlɪdʒ/', translation: '知识', example: 'Knowledge is power.' },
  ],
  '高二': [
    { id: '1', word: 'environment', phonetic: '/ɪnˈvaɪrənmənt/', translation: '环境', example: 'Protect the environment.' },
  ],
  '高三': [
    { id: '1', word: 'achievement', phonetic: '/əˈtʃiːvmənt/', translation: '成就', example: 'This is a great achievement.' },
  ],
  '四级必考': [
    { id: '1', word: 'abandon', phonetic: '/əˈbændən/', translation: '放弃', example: 'Never abandon your dreams.' },
  ],
  '六级必考': [
    { id: '1', word: 'abstract', phonetic: '/ˈæbstrækt/', translation: '抽象的', example: 'This is an abstract concept.' },
  ],
  '雅思': [
    { id: '1', word: 'accommodate', phonetic: '/əˈkɒmədeɪt/', translation: '容纳；适应', example: 'The hotel can accommodate 500 guests.' },
  ],
  '托福': [
    { id: '1', word: 'accumulate', phonetic: '/əˈkjuːmjəleɪt/', translation: '积累', example: 'Accumulate knowledge over time.' },
  ],
};

interface VocabularyPageProps {
  bookType: VocabularyBookType;
}

const VocabularyPage = ({ bookType }: VocabularyPageProps) => {
  const navigate = useNavigate();
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);

  const words = mockWords[bookType] || [];
  const currentWord = words[currentWordIndex];

  const handleNext = () => {
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
      setUserInput('');
      setShowAnswer(false);
    }
  };

  const handlePrevious = () => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex(currentWordIndex - 1);
      setUserInput('');
      setShowAnswer(false);
    }
  };

  const handleCheck = () => {
    setShowAnswer(true);
  };

  return (
    <div className="vocabulary-page">
      {/* 左侧导航栏 */}
      <div className={`sidebar ${isNavCollapsed ? 'collapsed' : ''}`}>
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
            </div>

            <button className="back-home-button" onClick={() => navigate('/')}>
              返回首页
            </button>
          </>
        )}
      </div>

      {/* 右侧内容区 */}
      <div className="content-area">
        {/* 左边：单词页 */}
        <div className="word-display">
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
      </div>
    </div>
  );
};

export default VocabularyPage;
