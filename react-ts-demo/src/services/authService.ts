/**
 * 认证服务
 * 处理用户认证相关的 API 请求
 */

const API_BASE_URL = 'http://localhost:3001/api';

export interface User {
  id: string;
  username: string;
  email?: string;
  nickname?: string;
  avatar?: string;
  ageGroup?: string;
  bio?: string;
  isGuest: boolean;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface RegisterData {
  username: string;
  password: string;
  email?: string;
  nickname?: string;
  ageGroup?: string;
}

export interface LoginData {
  username: string;
  password: string;
}

/**
 * 用户注册
 */
export async function register(data: RegisterData): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '注册失败');
  }

  return response.json();
}

/**
 * 用户登录
 */
export async function login(data: LoginData): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '登录失败');
  }

  return response.json();
}

/**
 * 获取当前用户信息
 */
export async function getCurrentUser(token: string): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/user/me`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('获取用户信息失败');
  }

  const data = await response.json();
  return data.user;
}

/**
 * 更新用户信息
 */
export async function updateUser(token: string, userData: Partial<User>): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/user/me`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '更新用户信息失败');
  }

  const data = await response.json();
  return data.user;
}

/**
 * 游客转换为正式用户
 */
export async function convertGuest(guestId: string, data: RegisterData): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/user/convert-guest`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      guestId,
      ...data,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '转换失败');
  }

  return response.json();
}
