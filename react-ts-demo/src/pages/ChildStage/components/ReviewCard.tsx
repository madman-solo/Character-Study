/**
 * ReviewCard Component
 * 复习卡片组件 - 左侧显示单词图片，右侧显示默写区域
 */

import { useState } from 'react';
import type { ReviewCardProps } from '../../../types/vocabulary';
import { getWordImageUrl } from '../../../services/childVocabularyService';
import { useChildSound } from '../../../hooks/useChildSound';
import DictationInput from './DictationInput';
import './ReviewCard.css';

const ReviewCard = ({
  word,
  onCorrect,
  onWrong,
  showImage = true,
  animationsEnabled = true
}: ReviewCardProps) => {
  const [showTranslation, setShowTranslation] = useState(false);
  const { speakWord } = useChildSound();
  const imageUrl = getWordImageUrl(word);

  const handleSubmit = (input: string) => {
    const isCorrect = input.toLowerCase() === word.word.toLowerCase();

    if (isCorrect) {
      onCorrect();
    } else {
      onWrong();
    }
  };

  const handlePlayAudio = () => {
    // 使用百度翻译API播放单词发音
    speakWord(word.word, 'en-US');
  };

  return (
    <div className={`child-review-card ${animationsEnabled ? 'child-animate-bounce-in' : ''}`}>
      {/* Left side - Word image and audio */}
      <div className="child-review-card-left">
        {showImage && (
          <div
            className="child-review-word-image"
            style={{ backgroundImage: `url(${imageUrl})` }}
          >
            <div className="child-review-image-overlay">
              <div className="child-review-word-emoji">
                {/* Extract emoji from data URL if present */}
                {imageUrl.includes('data:image/svg') &&
                  imageUrl.match(/>(.*?)<\/text>/)?.[1]}
              </div>
            </div>
          </div>
        )}

        <button
          className="child-review-audio-btn"
          onClick={handlePlayAudio}
        >
          <span className="audio-icon">🔊</span>
          <span className="audio-text">听发音</span>
        </button>

        <button
          className="child-review-translation-btn"
          onClick={() => setShowTranslation(!showTranslation)}
        >
          {showTranslation ? '隐藏翻译' : '显示翻译'}
        </button>

        {showTranslation && (
          <div className="child-review-translation child-animate-slide-up">
            <div className="translation-label">中文意思：</div>
            <div className="translation-text">{word.translation}</div>
          </div>
        )}
      </div>

      {/* Right side - Dictation area */}
      <div className="child-review-card-right">
        <div className="child-review-instructions">
          <h3>请拼写这个单词</h3>
          <p>听发音，看图片，然后输入正确的单词</p>
        </div>

        <DictationInput
          onSubmit={handleSubmit}
          placeholder="输入单词..."
          correctAnswer={word.word}
          showFeedback={true}
        />

        <div className="child-review-hint">
          <p>💡 提示：单词有 {word.word.length} 个字母</p>
          {word.phonetic && (
            <p className="phonetic-hint">音标：{word.phonetic}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;
