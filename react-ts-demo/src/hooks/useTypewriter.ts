import { useState, useEffect, useRef } from 'react';

export interface TypewriterOptions {
  text: string;
  speed?: number; // 打字速度（毫秒/字符）
  onComplete?: () => void;
  enabled?: boolean; // 是否启用打字机效果
}

/**
 * 打字机效果 Hook
 * 用于实现逐字显示文本的效果
 */
export function useTypewriter(options: TypewriterOptions) {
  const { text, speed = 50, onComplete, enabled = true } = options;
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const timerRef = useRef<number | null>(null);
  const prevTextRef = useRef<string>('');

  useEffect(() => {
    // 如果文本没有变化，不重新执行
    if (text === prevTextRef.current) {
      return;
    }

    prevTextRef.current = text;

    // 如果不启用打字机效果，直接显示完整文本
    if (!enabled || !text) {
      setDisplayedText(text);
      setIsTyping(false);
      setIsComplete(true);
      return;
    }

    // 重置状态
    setDisplayedText('');
    setIsTyping(true);
    setIsComplete(false);

    let index = 0;

    // 清除之前的定时器
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // 开始打字机效果
    timerRef.current = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        setIsComplete(true);
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        onComplete?.();
      }
    }, speed);

    // 清理函数
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [text, speed, enabled, onComplete]);

  /**
   * 跳过打字机效果，立即显示完整文本
   */
  const skip = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setDisplayedText(text);
    setIsTyping(false);
    setIsComplete(true);
    onComplete?.();
  };

  return {
    displayedText,
    isTyping,
    isComplete,
    skip,
  };
}
