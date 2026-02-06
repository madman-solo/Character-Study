/**
 * AlphabetAnimation Component
 * 26个字母弹跳动画组件
 */

import { useState, useEffect } from 'react';
import type { AlphabetAnimationProps } from '../../../types/vocabulary';
import './AlphabetAnimation.css';

const AlphabetAnimation = ({
  onLetterClick,
  animationsEnabled = true,
  onAnimationComplete
}: AlphabetAnimationProps) => {
  const [settled, setSettled] = useState(false);

  // Generate alphabet array
  const alphabet = Array.from({ length: 26 }, (_, i) =>
    String.fromCharCode(65 + i) // A-Z
  );

  useEffect(() => {
    if (animationsEnabled) {
      // Wait for all letters to bounce in (26 letters * 0.1s delay + 0.8s animation)
      const timer = setTimeout(() => {
        setSettled(true);
        onAnimationComplete?.();
      }, 3400); // 26 * 100ms + 800ms animation + 400ms buffer

      return () => clearTimeout(timer);
    } else {
      setSettled(true);
      onAnimationComplete?.();
    }
  }, [animationsEnabled, onAnimationComplete]);

  const handleLetterClick = (letter: string) => {
    onLetterClick?.(letter);
  };

  return (
    <div className="child-alphabet-container">
      {alphabet.map((letter, index) => (
        <div
          key={letter}
          className={`child-alphabet-letter ${settled ? 'settled' : ''} ${!animationsEnabled ? 'no-animation' : ''}`}
          style={{
            animationDelay: animationsEnabled ? `${index * 0.1}s` : '0s'
          }}
          onClick={() => handleLetterClick(letter)}
        >
          {letter}
        </div>
      ))}
    </div>
  );
};

export default AlphabetAnimation;
