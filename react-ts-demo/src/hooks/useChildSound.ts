/**
 * 少儿英语音效管理 Hook
 * 管理学习过程中的各类音效播放
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { playWordAudio } from '../services/audioService';

// 音效类型
export type SoundType =
  | 'word-pronunciation' // 单词发音
  | 'correct-answer' // 答对音效
  | 'wrong-answer' // 答错音效
  | 'milestone' // 里程碑音效
  | 'interaction' // 互动音效
  | 'badge-unlock' // 勋章解锁音效
  | 'point-gain'; // 获得积分音效

// 音效配置
export interface SoundConfig {
  enabled: boolean;
  volume: number; // 0-100
}

const STORAGE_KEY = 'child_sound_config';

// 默认音效配置
const DEFAULT_CONFIG: SoundConfig = {
  enabled: true,
  volume: 50,
};

// 音效URL映射（使用Web Audio API生成简单音效，避免依赖外部文件）
const SOUND_FREQUENCIES: Record<SoundType, { frequency: number; duration: number; type?: OscillatorType }> = {
  'correct-answer': { frequency: 523.25, duration: 0.3, type: 'sine' }, // C5 音符
  'wrong-answer': { frequency: 220, duration: 0.2, type: 'sawtooth' }, // A3 音符
  'milestone': { frequency: 659.25, duration: 0.5, type: 'sine' }, // E5 音符
  'interaction': { frequency: 440, duration: 0.15, type: 'sine' }, // A4 音符
  'badge-unlock': { frequency: 783.99, duration: 0.6, type: 'sine' }, // G5 音符
  'point-gain': { frequency: 587.33, duration: 0.2, type: 'sine' }, // D5 音符
  'word-pronunciation': { frequency: 0, duration: 0 }, // 单词发音使用 Web Speech API
};

export const useChildSound = () => {
  const [config, setConfig] = useState<SoundConfig>(DEFAULT_CONFIG);
  const audioContextRef = useRef<AudioContext | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);

  // 初始化音频上下文
  useEffect(() => {
    // 加载配置
    const savedConfig = localStorage.getItem(STORAGE_KEY);
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig));
      } catch (error) {
        console.error('Failed to parse sound config:', error);
      }
    }

    // 初始化 Web Audio API
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      audioContextRef.current = new AudioContext();
    }

    // 初始化 Speech Synthesis API
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      speechSynthesisRef.current = window.speechSynthesis;
    }

    return () => {
      // 清理音频上下文
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // 保存配置
  const saveConfig = useCallback((newConfig: SoundConfig) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
    setConfig(newConfig);
  }, []);

  // 播放音效
  const playSound = useCallback((type: SoundType) => {
    if (!config.enabled || !audioContextRef.current) return;

    const soundConfig = SOUND_FREQUENCIES[type];
    if (!soundConfig || soundConfig.frequency === 0) return;

    try {
      const audioContext = audioContextRef.current;
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = soundConfig.type || 'sine';
      oscillator.frequency.setValueAtTime(soundConfig.frequency, audioContext.currentTime);

      // 设置音量（0-1）
      const volume = config.volume / 100;
      gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + soundConfig.duration);

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + soundConfig.duration);
    } catch (error) {
      console.error('Failed to play sound:', error);
    }
  }, [config]);

  // 播放欢快的正确答案音效（多音符）
  const playCorrectSound = useCallback(() => {
    if (!config.enabled || !audioContextRef.current) return;

    try {
      const audioContext = audioContextRef.current;
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 和弦
      const volume = config.volume / 100;

      notes.forEach((frequency, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

        gainNode.gain.setValueAtTime(volume * 0.3, audioContext.currentTime + index * 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3 + index * 0.1);

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.start(audioContext.currentTime + index * 0.1);
        oscillator.stop(audioContext.currentTime + 0.3 + index * 0.1);
      });
    } catch (error) {
      console.error('Failed to play correct sound:', error);
    }
  }, [config]);

  // 播放温和的错误提示音效
  const playWrongSound = useCallback(() => {
    if (!config.enabled || !audioContextRef.current) return;

    try {
      const audioContext = audioContextRef.current;
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(220, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(180, audioContext.currentTime + 0.2);

      const volume = config.volume / 100;
      gainNode.gain.setValueAtTime(volume * 0.5, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      console.error('Failed to play wrong sound:', error);
    }
  }, [config]);

  // 播放里程碑音效（通关音效）
  const playMilestoneSound = useCallback(() => {
    if (!config.enabled || !audioContextRef.current) return;

    try {
      const notes = [523.25, 587.33, 659.25, 783.99, 880]; // C5, D5, E5, G5, A5
      const volume = config.volume / 100;

      notes.forEach((frequency, index) => {
        const oscillator = audioContextRef.current!.createOscillator();
        const gainNode = audioContextRef.current!.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, audioContextRef.current!.currentTime);

        gainNode.gain.setValueAtTime(volume * 0.4, audioContextRef.current!.currentTime + index * 0.15);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current!.currentTime + 0.3 + index * 0.15);

        oscillator.connect(gainNode);
        gainNode.connect(audioContextRef.current!.destination);

        oscillator.start(audioContextRef.current!.currentTime + index * 0.15);
        oscillator.stop(audioContextRef.current!.currentTime + 0.3 + index * 0.15);
      });
    } catch (error) {
      console.error('Failed to play milestone sound:', error);
    }
  }, [config]);

  // 播放单词发音（使用百度翻译音频API）
  const speakWord = useCallback(async (word: string, lang: string = 'en-US') => {
    if (!config.enabled) return;

    try {
      // 转换语言代码
      const baiduLang = lang.startsWith('zh') ? 'zh' : 'en';

      // 语速设置：百度API的语速范围是1-15，5为正常
      // 为了适合儿童学习，设置为4（稍慢）
      const speed = 4;

      // 音量设置：从config中获取，转换为0-1范围
      const volume = config.volume / 100;

      console.log('开始播放:', word, '语言:', baiduLang, '音量:', volume);

      // 使用百度翻译音频服务播放
      await playWordAudio(word, {
        lang: baiduLang as 'en' | 'zh',
        speed,
        volume
      });

      console.log('播放完成:', word);
    } catch (error) {
      console.error('播放失败，尝试使用备用方案:', error);

      // 备用方案：使用Web Speech API
      try {
        if (speechSynthesisRef.current) {
          speechSynthesisRef.current.cancel();
          await new Promise(resolve => setTimeout(resolve, 50));

          const utterance = new SpeechSynthesisUtterance(word);
          utterance.lang = lang;
          utterance.rate = 0.8;
          utterance.pitch = 1.1;
          utterance.volume = config.volume / 100;

          speechSynthesisRef.current.speak(utterance);

          return new Promise<void>((resolve, reject) => {
            utterance.onend = () => resolve();
            utterance.onerror = (event) => reject(event.error);
          });
        }
      } catch (fallbackError) {
        console.error('备用发音方案也失败:', fallbackError);
      }
    }
  }, [config]);

  // 切换音效开关
  const toggleSound = useCallback(() => {
    const newConfig = { ...config, enabled: !config.enabled };
    saveConfig(newConfig);
  }, [config, saveConfig]);

  // 设置音量
  const setVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(100, volume));
    const newConfig = { ...config, volume: clampedVolume };
    saveConfig(newConfig);
  }, [config, saveConfig]);

  // 播放答题反馈音效
  const playAnswerFeedback = useCallback((isCorrect: boolean) => {
    if (isCorrect) {
      playCorrectSound();
    } else {
      playWrongSound();
    }
  }, [playCorrectSound, playWrongSound]);

  return {
    config,
    playSound,
    playCorrectSound,
    playWrongSound,
    playMilestoneSound,
    playAnswerFeedback,
    speakWord,
    toggleSound,
    setVolume,
  };
};
