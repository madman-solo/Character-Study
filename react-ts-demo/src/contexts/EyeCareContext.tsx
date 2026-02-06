/**
 * 护眼模式上下文
 * 提供全局护眼模式状态管理和持久化
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface EyeCareContextType {
  isEyeCareMode: boolean;
  toggleEyeCareMode: () => void;
}

const EyeCareContext = createContext<EyeCareContextType | undefined>(undefined);

export const EyeCareProvider = ({ children }: { children: ReactNode }) => {
  // 从 localStorage 读取初始状态
  const [isEyeCareMode, setIsEyeCareMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('eyeCareMode');
    return saved === 'true';
  });

  // 切换护眼模式
  const toggleEyeCareMode = () => {
    setIsEyeCareMode(prev => !prev);
  };

  // 监听状态变化，同步到 localStorage 和 DOM
  useEffect(() => {
    // 保存到 localStorage
    localStorage.setItem('eyeCareMode', String(isEyeCareMode));

    // 在 body 上添加/移除 class
    if (isEyeCareMode) {
      document.body.classList.add('eye-care-mode');
    } else {
      document.body.classList.remove('eye-care-mode');
    }

    console.log('护眼模式:', isEyeCareMode ? '已开启' : '已关闭');
  }, [isEyeCareMode]);

  // 初始化时应用护眼模式
  useEffect(() => {
    if (isEyeCareMode) {
      document.body.classList.add('eye-care-mode');
    }
  }, []);

  return (
    <EyeCareContext.Provider value={{ isEyeCareMode, toggleEyeCareMode }}>
      {children}
    </EyeCareContext.Provider>
  );
};

export const useEyeCare = () => {
  const context = useContext(EyeCareContext);
  if (context === undefined) {
    throw new Error('useEyeCare must be used within an EyeCareProvider');
  }
  return context;
};
