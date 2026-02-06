/**
 * 单词学习卡片组件
 * 展示单词、音标、翻译，支持发音和记忆标记
 */

import React, { useState } from 'react';
import type { Word } from '../../../hooks/useChildLearning';
import './WordLearningCard.css';

interface WordLearningCardProps {
  word: Word;
  onMastered: (word: Word) => void;
  onWeak: (word: Word) => void;
  onSpeak: (word: string) => void;
  animationsEnabled?: boolean;
}

const WordLearningCard: React.FC<WordLearningCardProps> = ({
  word,
  onMastered,
  onWeak,
  onSpeak,
  animationsEnabled = true,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showExample, setShowExample] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSpeak(word.word);
  };

  const handleMastered = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMastered(word);
  };

  const handleWeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    onWeak(word);
  };

  return (
    <div
      className={`word-learning-card ${isFlipped ? 'flipped' : ''} ${
        word.mastered ? 'mastered' : ''
      } ${animationsEnabled ? 'child-animate-bounce-in' : ''}`}
      onClick={handleFlip}
    >
      <div className="word-card-inner">
        {/* 正面 */}
        <div className="word-card-front">
          <div className="word-header">
            <button
              className="word-speak-btn"
              onClick={handleSpeak}
              aria-label="发音"
            >
              🔊
            </button>
            {word.mastered && (
              <div className="word-mastered-badge child-animate-badge-unlock">
                ✓
              </div>
            )}
          </div>

          <div className="word-content">
            <h3 className="word-text">
              {word.word.split('').map((letter, index) => (
                <span
                  key={index}
                  className={`word-letter ${
                    animationsEnabled ? 'child-animate-letter-bounce' : ''
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {letter}
                </span>
              ))}
            </h3>

            {word.phonetic && (
              <p
                className={`word-phonetic ${
                  animationsEnabled ? 'child-animate-phonetic-blink' : ''
                }`}
              >
                {word.phonetic}
              </p>
            )}

            <div className="word-hint">点击翻转查看释义</div>
          </div>

          <div className="word-actions">
            <button
              className="word-action-btn weak-btn"
              onClick={handleWeak}
              disabled={word.mastered}
            >
              😕 薄弱
            </button>
            <button
              className="word-action-btn master-btn"
              onClick={handleMastered}
              disabled={word.mastered}
            >
              ✨ 掌握
            </button>
          </div>
        </div>

        {/* 背面 */}
        <div className="word-card-back">
          <div className="word-header">
            <button
              className="word-speak-btn"
              onClick={handleSpeak}
              aria-label="发音"
            >
              🔊
            </button>
          </div>

          <div className="word-content">
            <h3 className="word-text">{word.word}</h3>
            <p className="word-translation">{word.translation}</p>

            {word.example && (
              <>
                <button
                  className="word-example-toggle"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowExample(!showExample);
                  }}
                >
                  {showExample ? '隐藏例句' : '查看例句'}
                </button>

                {showExample && (
                  <p
                    className={`word-example ${
                      animationsEnabled ? 'child-animate-bubble' : ''
                    }`}
                  >
                    {word.example}
                  </p>
                )}
              </>
            )}

            <div className="word-hint">点击翻转返回</div>
          </div>

          <div className="word-actions">
            <button
              className="word-action-btn weak-btn"
              onClick={handleWeak}
              disabled={word.mastered}
            >
              😕 薄弱
            </button>
            <button
              className="word-action-btn master-btn"
              onClick={handleMastered}
              disabled={word.mastered}
            >
              ✨ 掌握
            </button>
          </div>
        </div>
      </div>

      {word.reviewCount > 0 && (
        <div className="word-review-count">
          复习次数: {word.reviewCount}
        </div>
      )}
    </div>
  );
};

export default WordLearningCard;
