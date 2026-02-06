/**
 * DictationInput Component
 * 默写输入组件 - 键盘输入模式
 */

import { useState, useRef, useEffect } from 'react';
import type { DictationInputProps } from '../../../types/vocabulary';
import './DictationInput.css';

const DictationInput = ({
  onSubmit,
  placeholder = '请输入单词...',
  disabled = false,
  correctAnswer,
  showFeedback = false
}: DictationInputProps) => {
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-focus input on mount
    inputRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    if (!input.trim()) return;

    // Check answer if correctAnswer is provided
    if (correctAnswer && showFeedback) {
      const isCorrect = input.trim().toLowerCase() === correctAnswer.toLowerCase();
      setFeedback(isCorrect ? 'correct' : 'wrong');

      // Auto-clear feedback after animation
      setTimeout(() => {
        setFeedback(null);
        if (isCorrect) {
          setInput('');
        }
      }, 1500);
    }

    onSubmit(input.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handleClear = () => {
    setInput('');
    setFeedback(null);
    inputRef.current?.focus();
  };

  return (
    <div className="child-dictation-input-container">
      <div className={`child-dictation-input-wrapper ${feedback ? `feedback-${feedback}` : ''}`}>
        <input
          ref={inputRef}
          type="text"
          className="child-dictation-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
        />
        {input && (
          <button
            className="child-dictation-clear-btn"
            onClick={handleClear}
            disabled={disabled}
          >
            ✕
          </button>
        )}
      </div>

      <div className="child-dictation-actions">
        <button
          className="child-dictation-submit-btn"
          onClick={handleSubmit}
          disabled={disabled || !input.trim()}
        >
          提交
        </button>
      </div>

      {feedback && (
        <div className={`child-dictation-feedback ${feedback}`}>
          {feedback === 'correct' ? '✓ 正确！' : '✗ 再试一次'}
        </div>
      )}
    </div>
  );
};

export default DictationInput;
