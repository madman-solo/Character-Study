import { createContext, useContext, useState, ReactNode } from "react";

interface User {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  gender?: string;
  bio?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (name: string, password: string) => Promise<void>;
  register: (name: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  skipLogin: () => void;
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
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = async (name: string, password: string) => {
    // TODO: 实现真实的登录逻辑
    // 模拟登录
    const mockUser: User = {
      id: "1",
      name: "用户",
      email: "",
      avatar: "",
      gender: "未设置",
      bio: "这个人很懒，什么都没写~",
    };
    setUser(mockUser);
    setIsAuthenticated(true);
  };

  const register = async (name: string, password: string) => {
    // TODO: 实现真实的注册逻辑
    // 模拟注册
    const mockUser: User = {
      id: Date.now().toString(),
      name: name,
      email: "",
      avatar: "",
      gender: "未设置",
      bio: "这个人很懒，什么都没写~",
    };
    setUser(mockUser);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  const skipLogin = () => {
    // 跳过登录，以游客身份进入
    const guestUser: User = {
      id: "guest",
      name: "游客",
      email: "",
      avatar: "",
      gender: "未设置",
      bio: "游客模式",
    };
    setUser(guestUser);
    setIsAuthenticated(false); // 游客不算已认证
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        register,
        logout,
        updateUser,
        skipLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
