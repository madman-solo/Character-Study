/**
 * 音频服务 - 基于后端代理的单词发音
 * 通过后端API代理百度翻译音频，避免CORS问题
 */

const API_BASE_URL = 'http://localhost:3001';

export interface AudioOptions {
  lang?: 'en' | 'zh';
  speed?: number; // 1-15，默认5
  volume?: number; // 0-1，默认1
}

/**
 * 生成后端代理的音频URL
 * @param text 要朗读的文本
 * @param options 音频选项
 * @returns 音频URL
 */
export function generateAudioUrl(
  text: string,
  options: AudioOptions = {}
): string {
  const { lang = 'en', speed = 4 } = options;

  // 使用后端API代理
  const url = `${API_BASE_URL}/api/audio/speak?word=${encodeURIComponent(text)}&lang=${lang}&speed=${speed}`;

  return url;
}

/**
 * 播放单词发音
 * @param word 要播放的单词
 * @param options 音频选项
 * @returns Promise，播放完成时resolve
 */
export async function playWordAudio(
  word: string,
  options: AudioOptions = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const { volume = 1 } = options;

      // 生成音频URL
      const audioUrl = generateAudioUrl(word, options);

      console.log('音频URL:', audioUrl);

      // 创建音频对象
      const audio = new Audio(audioUrl);

      // 设置音量
      audio.volume = Math.max(0, Math.min(1, volume));

      // 监听播放完成
      audio.onended = () => {
        console.log('播放完成:', word);
        resolve();
      };

      // 监听播放错误
      audio.onerror = (error) => {
        console.error('播放错误:', error);
        reject(new Error('音频播放失败'));
      };

      // 开始播放
      audio.play().catch((error) => {
        console.error('播放启动失败:', error);
        reject(error);
      });
    } catch (error) {
      console.error('创建音频失败:', error);
      reject(error);
    }
  });
}

/**
 * 预加载音频（用于缓存）
 * @param word 要预加载的单词
 * @param options 音频选项
 */
export function preloadWordAudio(
  word: string,
  options: AudioOptions = {}
): void {
  const audioUrl = generateAudioUrl(word, options);
  const audio = new Audio(audioUrl);
  audio.preload = 'auto';
}

/**
 * 批量预加载音频
 * @param words 要预加载的单词列表
 * @param options 音频选项
 */
export function preloadMultipleAudios(
  words: string[],
  options: AudioOptions = {}
): void {
  words.forEach(word => {
    preloadWordAudio(word, options);
  });
}
