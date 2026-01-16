// 角色类型定义
export interface Character {
  id: string;
  name: string;
  avatar: string;
  category: CharacterCategory;
  description: string;
  tags: string[];
  popularity: number;
}

// 角色分类
export type CharacterCategory =
  | "动漫人物"
  | "卡通人物"
  | "插画"
  | "动物"
  | "原创";

// 情景模式
export interface ScenarioMode {
  id: string;
  name: string;
  description: string;
  icon: string;
}

// 对话消息
export interface Message {
  id: string;
  content: string;
  sender: "user" | "character";
  timestamp: Date;
}

// 对话会话
export interface Conversation {
  id: string;
  characterId: string;
  messages: Message[];
  scenarioMode?: string;
}

// 英语学习难度级别
export type EnglishLevel = '0-12' | '13-18' | '18+';

// 单词本类型
export type VocabularyBookType =
  | '初一'
  | '初二'
  | '初三'
  | '高一'
  | '高二'
  | '高三'
  | '四级必考'
  | '六级必考'
  | '雅思'
  | '托福';

// 学习模式
export type LearningMode = 'vocabulary-book' | 'interactive-memory';
