import { createContext, useContext, useState, type ReactNode } from "react";
import * as authService from "../services/authService";

interface User {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  gender?: string;
  bio?: string;
  nickname?: string;
  ageGroup?: string;
  isGuest?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  login: (name: string, password: string) => Promise<void>;
  register: (name: string, password: string, email?: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  skipLogin: () => void;
  convertGuestToUser: (username: string, password: string, email?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  // 从 localStorage 初始化状态
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        // 确保 name 字段存在（兼容旧数据）
        if (parsed && !parsed.name && parsed.username) {
          parsed.name = parsed.username;
        }
        return parsed;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('auth_token');
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const savedUser = localStorage.getItem('auth_user');
    const savedToken = localStorage.getItem('auth_token');
    if (savedUser && savedToken) {
      try {
        const parsedUser = JSON.parse(savedUser);
        // 只有当用户不是游客且有 token 时才认为已认证
        return !parsedUser.isGuest && !!savedToken;
      } catch {
        return false;
      }
    }
    return false;
  });

  const login = async (username: string, password: string) => {
    try {
      const response = await authService.login({ username, password });

      // 保存 token 和用户信息
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('auth_user', JSON.stringify(response.user));

      setToken(response.token);
      setUser({
        id: response.user.id,
        name: response.user.username,
        email: response.user.email,
        nickname: response.user.nickname,
        avatar: response.user.avatar,
        ageGroup: response.user.ageGroup,
        bio: response.user.bio,
        isGuest: false,
      });
      setIsAuthenticated(true);
    } catch (error) {
      console.error('登录失败:', error);
      throw error;
    }
  };

  const register = async (username: string, password: string, email?: string) => {
    try {
      await authService.register({ username, password, email });
      // 注册成功后不自动登录，让用户手动登录
    } catch (error) {
      console.error('注册失败:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));
    }
  };

  const skipLogin = () => {
    // 跳过登录，以游客身份进入
    const guestUser: User = {
      id: `guest_${Date.now()}`,
      name: "游客",
      email: "",
      avatar: "",
      gender: "未设置",
      bio: "游客模式",
      isGuest: true,
    };
    setUser(guestUser);
    setIsAuthenticated(false);
    localStorage.setItem('auth_user', JSON.stringify(guestUser));
  };

  const convertGuestToUser = async (username: string, password: string, email?: string) => {
    if (!user || !user.isGuest) {
      throw new Error('当前不是游客模式');
    }

    try {
      const response = await authService.convertGuest(user.id, { username, password, email });

      // 保存新的 token 和用户信息
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('auth_user', JSON.stringify(response.user));

      setToken(response.token);
      setUser({
        id: response.user.id,
        name: response.user.username,
        email: response.user.email,
        nickname: response.user.nickname,
        avatar: response.user.avatar,
        ageGroup: response.user.ageGroup,
        bio: response.user.bio,
        isGuest: false,
      });
      setIsAuthenticated(true);
    } catch (error) {
      console.error('游客转换失败:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        token,
        login,
        register,
        logout,
        updateUser,
        skipLogin,
        convertGuestToUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
