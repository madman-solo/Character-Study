import { useState, useCallback } from 'react';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface UseChatHistoryOptions {
  maxRounds?: number; // 最大保留轮数（默认10轮）
}

/**
 * 对话历史管理 Hook
 * 用于管理对话消息列表和上下文记忆
 */
export function useChatHistory(options: UseChatHistoryOptions = {}) {
  const { maxRounds = 10 } = options;
  const [messages, setMessages] = useState<Message[]>([]);

  /**
   * 添加消息
   */
  const addMessage = useCallback((role: 'user' | 'assistant', content: string) => {
    const newMessage: Message = {
      id: Date.now().toString() + Math.random(),
      role,
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => {
      const updated = [...prev, newMessage];

      // 保留最近 maxRounds 轮对话（每轮包含用户消息和助手回复）
      // 如果消息数超过 maxRounds * 2，则删除最早的消息
      if (updated.length > maxRounds * 2) {
        return updated.slice(updated.length - maxRounds * 2);
      }

      return updated;
    });

    return newMessage;
  }, [maxRounds]);

  /**
   * 清空消息历史
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  /**
   * 获取用于 API 调用的上下文消息
   */
  const getContextMessages = useCallback(() => {
    return messages.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
    }));
  }, [messages]);

  /**
   * 设置完整的消息列表（用于加载历史记录）
   */
  const setMessageList = useCallback((newMessages: Message[]) => {
    setMessages(newMessages);
  }, []);

  return {
    messages,
    addMessage,
    clearMessages,
    getContextMessages,
    setMessageList,
  };
}
