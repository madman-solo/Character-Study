/**
 * VocabularyWordCard Component
 * 单词卡片组件 - 带虚化背景和悬停效果
 */

import { useState } from 'react';
import type { VocabularyWordCardProps } from '../../../types/vocabulary';
import { getWordImageUrl } from '../../../services/childVocabularyService';
import './VocabularyWordCard.css';

const VocabularyWordCard = ({
  word,
  onWordClick,
  showBlurredBackground = true,
  animationsEnabled = true
}: VocabularyWordCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const imageUrl = getWordImageUrl(word);

  const handleClick = () => {
    onWordClick?.();
  };

  return (
    <div
      className={`child-vocab-word-card ${animationsEnabled ? 'child-animate-bounce-in' : ''} ${isHovered ? 'hovered' : ''}`}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {showBlurredBackground && (
        <div
          className="child-vocab-card-background"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
      )}

      <div className="child-vocab-card-content">
        <div className="child-vocab-word-text">
          {word.word}
        </div>
        <div className="child-vocab-word-phonetic">
          {word.phonetic}
        </div>
        <div className="child-vocab-word-translation">
          {word.translation}
        </div>
        <div className="child-vocab-card-hint">
          点击查看详情 👆
        </div>
      </div>
    </div>
  );
};

export default VocabularyWordCard;
