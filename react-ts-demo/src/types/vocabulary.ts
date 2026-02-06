/**
 * Vocabulary Type Definitions
 * 单词本相关类型定义
 */

// Child Word Interface (少儿单词)
export interface ChildWord {
  id: number;
  word: string;
  phonetic: string;
  translation: string;
  pos?: string; // Part of speech (词性)
  grade: number; // 0=kindergarten, 1-6=primary school
  bnc?: number;
  frq?: number;
  audio?: string | null;
}

// Adult Word Interface (成人单词)
export interface Word {
  id: number;
  word: string;
  phonetic: string;
  translation: string;
  definition?: string;
  pos?: string;
  collins?: number;
  oxford?: boolean;
  tag?: string;
  example?: string;
}

// Word Progress Interface (单词学习进度)
export interface WordProgress {
  id?: number;
  userId: string;
  wordId: number;
  bookType?: string; // For adult words
  correctCount: number;
  wrongCount: number;
  lastStudied: Date | string;
  mastered: boolean;
  nextReview?: Date | string; // Calculated field
}

// Child Word Progress Interface (少儿单词学习进度)
export interface ChildWordProgress {
  id?: number;
  userId: string;
  wordId: number;
  correctCount: number;
  wrongCount: number;
  lastStudied: Date | string;
  mastered: boolean;
  nextReview?: Date | string; // Calculated field
}

// Word with Progress (单词+进度)
export interface WordWithProgress {
  word: Word | ChildWord;
  progress: WordProgress | ChildWordProgress;
}

// Review Statistics (复习统计)
export interface ReviewStatistics {
  total: number;
  mastered: number;
  learning: number;
  dueForReview: number;
  masteryRate: string | number;
}

// Review Session (复习会话)
export interface ReviewSession {
  userId: string;
  startTime: Date;
  endTime?: Date;
  wordsReviewed: number;
  correctAnswers: number;
  wrongAnswers: number;
  accuracy: number;
}

// Alphabet Letter (字母)
export interface AlphabetLetter {
  letter: string;
  index: number;
  settled: boolean;
}

// Word Filter Options (单词筛选选项)
export interface WordFilterOptions {
  letter?: string; // Starting letter (A-Z)
  grade?: number; // Grade level (0-6)
  length?: 'short' | 'medium' | 'long'; // Word length category
  mastered?: boolean; // Filter by mastery status
}

// Word Length Categories (单词长度分类)
export const WORD_LENGTH_CATEGORIES = {
  short: { min: 3, max: 5, label: '3-5个字母' },
  medium: { min: 6, max: 8, label: '6-8个字母' },
  long: { min: 9, max: 20, label: '9个字母以上' }
} as const;

// Grade Labels (年级标签)
export const GRADE_LABELS: Record<number, string> = {
  0: '幼儿园',
  1: '一年级',
  2: '二年级',
  3: '三年级',
  4: '四年级',
  5: '五年级',
  6: '六年级'
};

// Book Types (单词本类型)
export const BOOK_TYPES = [
  '初一', '初二', '初三',
  '高一', '高二', '高三',
  '四级', '六级',
  '雅思', '托福'
] as const;

export type BookType = typeof BOOK_TYPES[number];

// API Response Types (API响应类型)
export interface ChildWordsResponse {
  grade?: number;
  letter?: string;
  count: number;
  total?: number;
  words: ChildWord[];
}

export interface ReviewWordsResponse {
  userId: string;
  bookType?: string;
  grade?: number | string;
  count: number;
  totalDue: number;
  statistics: ReviewStatistics;
  words: WordWithProgress[];
}

export interface ProgressUpdateResponse {
  success: boolean;
  progress: WordProgress | ChildWordProgress;
}

// Component Props Types (组件属性类型)
export interface AlphabetAnimationProps {
  onLetterClick?: (letter: string) => void;
  animationsEnabled?: boolean;
  onAnimationComplete?: () => void;
}

export interface VocabularyWordCardProps {
  word: ChildWord;
  onWordClick?: () => void;
  showBlurredBackground?: boolean;
  animationsEnabled?: boolean;
}

export interface ChangeWordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWord: (word: ChildWord) => void;
  grade?: number;
}

export interface DictationInputProps {
  onSubmit: (input: string) => void;
  placeholder?: string;
  disabled?: boolean;
  correctAnswer?: string;
  showFeedback?: boolean;
}

export interface ReviewCardProps {
  word: ChildWord | Word;
  onCorrect: () => void;
  onWrong: () => void;
  showImage?: boolean;
  animationsEnabled?: boolean;
}

export interface SpacedRepetitionProgressProps {
  totalWords: number;
  reviewedWords: number;
  correctCount: number;
  wrongCount: number;
  accuracy?: number;
}

export interface WordLearningModalProps {
  isOpen: boolean;
  word: ChildWord | null;
  onClose: () => void;
  onCorrect: (word: ChildWord) => void;
  onWrong: (word: ChildWord) => void;
  animationsEnabled?: boolean;
}
