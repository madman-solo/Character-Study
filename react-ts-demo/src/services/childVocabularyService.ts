/**
 * Child Vocabulary Service
 * 少儿单词服务 - 处理少儿单词相关的API请求
 */

import type { ChildWord, ChildWordsResponse } from '../types/vocabulary';

const API_BASE_URL = 'http://localhost:3001/api';

/**
 * Fetch child words by grade level
 * 根据年级获取少儿单词
 */
export async function fetchChildWordsByGrade(
  grade: number,
  limit: number = 100
): Promise<ChildWord[]> {
  try {
    const url = `${API_BASE_URL}/child-words/by-grade/${grade}${limit > 0 ? `?limit=${limit}` : ''}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch words: ${response.statusText}`);
    }

    const data: ChildWordsResponse = await response.json();
    return data.words;
  } catch (error) {
    console.error('Error fetching child words by grade:', error);
    throw error;
  }
}

/**
 * Fetch child words by starting letter
 * 根据首字母获取少儿单词
 */
export async function fetchChildWordsByLetter(
  letter: string,
  grade?: number,
  limit: number = 50
): Promise<ChildWord[]> {
  try {
    const params = new URLSearchParams();
    if (grade !== undefined) params.append('grade', grade.toString());
    if (limit > 0) params.append('limit', limit.toString());

    const url = `${API_BASE_URL}/child-words/by-letter/${letter}?${params.toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch words: ${response.statusText}`);
    }

    const data: ChildWordsResponse = await response.json();
    return data.words;
  } catch (error) {
    console.error('Error fetching child words by letter:', error);
    throw error;
  }
}

/**
 * Fetch random child word
 * 获取随机少儿单词
 */
export async function fetchRandomChildWord(grade?: number): Promise<ChildWord> {
  try {
    const url = grade !== undefined
      ? `${API_BASE_URL}/child-words/random?grade=${grade}`
      : `${API_BASE_URL}/child-words/random`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch random word: ${response.statusText}`);
    }

    const data: ChildWord = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching random child word:', error);
    throw error;
  }
}

/**
 * Fetch specific child word by word text
 * 根据单词文本获取特定单词
 */
export async function fetchChildWord(word: string): Promise<ChildWord> {
  try {
    const url = `${API_BASE_URL}/child-words/${word.toLowerCase()}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch word: ${response.statusText}`);
    }

    const data: ChildWord = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching child word:', error);
    throw error;
  }
}

/**
 * Fetch all child words with pagination
 * 获取所有少儿单词（分页）
 */
export async function fetchAllChildWords(
  grade?: number,
  limit: number = 100,
  offset: number = 0
): Promise<{ words: ChildWord[]; total: number }> {
  try {
    const params = new URLSearchParams();
    if (grade !== undefined) params.append('grade', grade.toString());
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());

    const url = `${API_BASE_URL}/child-words?${params.toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch words: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      words: data.words,
      total: data.total
    };
  } catch (error) {
    console.error('Error fetching all child words:', error);
    throw error;
  }
}

/**
 * Filter words by length category
 * 根据长度分类筛选单词
 */
export function filterWordsByLength(
  words: ChildWord[],
  category: 'short' | 'medium' | 'long'
): ChildWord[] {
  const ranges = {
    short: { min: 3, max: 5 },
    medium: { min: 6, max: 8 },
    long: { min: 9, max: 20 }
  };

  const range = ranges[category];
  return words.filter(w =>
    w.word.length >= range.min && w.word.length <= range.max
  );
}

/**
 * Group words by starting letter
 * 按首字母分组单词
 */
export function groupWordsByLetter(words: ChildWord[]): Record<string, ChildWord[]> {
  const grouped: Record<string, ChildWord[]> = {};

  words.forEach(word => {
    const firstLetter = word.word[0].toUpperCase();
    if (!grouped[firstLetter]) {
      grouped[firstLetter] = [];
    }
    grouped[firstLetter].push(word);
  });

  return grouped;
}

/**
 * Get word image URL from Flaticon or use emoji fallback
 * 获取单词图片URL（使用Flaticon或emoji备用）
 */
export function getWordImageUrl(word: ChildWord): string {
  // Map common words to emojis as fallback
  const emojiMap: Record<string, string> = {
    'apple': '🍎',
    'cat': '🐱',
    'dog': '🐶',
    'sun': '☀️',
    'moon': '🌙',
    'star': '⭐',
    'tree': '🌳',
    'flower': '🌸',
    'car': '🚗',
    'book': '📚',
    'ball': '⚽',
    'house': '🏠',
    'bird': '🐦',
    'fish': '🐟',
    'banana': '🍌',
    'orange': '🍊',
    'milk': '🥛',
    'water': '💧',
    'fire': '🔥',
    'ice': '🧊'
  };

  // Return emoji if available
  const emoji = emojiMap[word.word.toLowerCase()];
  if (emoji) {
    return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><text x="50%" y="50%" font-size="120" text-anchor="middle" dominant-baseline="middle">${emoji}</text></svg>`;
  }

  // Otherwise, use Flaticon API (placeholder - replace with actual API key)
  // For now, return a placeholder
  return `https://via.placeholder.com/200x200/FFE66D/333333?text=${word.word}`;
}

export default {
  fetchChildWordsByGrade,
  fetchChildWordsByLetter,
  fetchRandomChildWord,
  fetchChildWord,
  fetchAllChildWords,
  filterWordsByLength,
  groupWordsByLetter,
  getWordImageUrl
};
