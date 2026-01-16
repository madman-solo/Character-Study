import axios from 'axios';
import type { Character, ScenarioMode } from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 获取所有角色
export const getCharacters = async (category?: string) => {
  const response = await api.get<Character[]>('/characters', {
    params: category ? { category } : {},
  });
  return response.data;
};

// 获取单个角色详情
export const getCharacterById = async (id: string) => {
  const response = await api.get<Character>(`/characters/${id}`);
  return response.data;
};

// 获取所有情景模式
export const getScenarios = async () => {
  const response = await api.get<ScenarioMode[]>('/scenarios');
  return response.data;
};

// 发送聊天消息
export const sendChatMessage = async (
  characterId: string,
  message: string,
  scenarioId?: string
) => {
  const response = await api.post<{ reply: string; timestamp: string }>('/chat', {
    characterId,
    message,
    scenarioId,
  });
  return response.data;
};

// 获取用户的角色列表
export const getUserCharacters = async (userId: string) => {
  const response = await api.get<Character[]>(`/users/${userId}/characters`);
  return response.data;
};

// 获取用户的收藏列表
export const getUserFavorites = async (userId: string) => {
  const response = await api.get<Character[]>(`/users/${userId}/favorites`);
  return response.data;
};

// 添加角色到"我的角色"
export const addUserCharacter = async (
  userId: string,
  characterId: string,
  setAsDefault: boolean = false
) => {
  const response = await api.post(`/users/${userId}/characters`, {
    characterId,
    setAsDefault,
  });
  return response.data;
};

// 从"我的角色"移除角色
export const removeUserCharacter = async (userId: string, characterId: string) => {
  const response = await api.delete(`/users/${userId}/characters/${characterId}`);
  return response.data;
};

// 添加角色到收藏
export const addUserFavorite = async (userId: string, characterId: string) => {
  const response = await api.post(`/users/${userId}/favorites`, {
    characterId,
  });
  return response.data;
};

// 从收藏移除角色
export const removeUserFavorite = async (userId: string, characterId: string) => {
  const response = await api.delete(`/users/${userId}/favorites/${characterId}`);
  return response.data;
};

// 设置默认角色（首页显示）
export const setDefaultCharacter = async (userId: string, characterId: string) => {
  const response = await api.put(`/users/${userId}/characters/${characterId}/default`);
  return response.data;
};

export default api;
