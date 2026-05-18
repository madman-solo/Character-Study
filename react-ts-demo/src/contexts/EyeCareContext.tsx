import type { ReactNode } from "react";
import { createContext, useContext, useState, useEffect, useRef } from "react";

interface EyeCareContextType {
  isEyeCareMode: boolean;
  toggleEyeCareMode: () => void;
}

const EyeCareContext = createContext<EyeCareContextType | undefined>(undefined);

export const EyeCareProvider = ({ children }: { children: ReactNode }) => {
  const [isEyeCareMode, setIsEyeCareMode] = useState<boolean>(() => {
    return localStorage.getItem("eyeCareMode") === "true";
  });
  const reminderTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const toggleEyeCareMode = () => {
    setIsEyeCareMode((prev) => !prev);
  };

  useEffect(() => {
    localStorage.setItem("eyeCareMode", String(isEyeCareMode));

    if (isEyeCareMode) {
      document.body.classList.add("eye-care-mode");
      document.body.style.filter = "";

      reminderTimer.current = setInterval(() => {
        const el = document.createElement("div");
        el.className = "eye-care-reminder";
        el.textContent = "👁️ 已学习20分钟，请看向6米外休息20秒";
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 5000);
      }, 20 * 60 * 1000);
    } else {
      document.body.classList.remove("eye-care-mode");
      document.body.style.filter = "";
      if (reminderTimer.current) {
        clearInterval(reminderTimer.current);
        reminderTimer.current = null;
      }
    }

    return () => {
      if (reminderTimer.current) clearInterval(reminderTimer.current);
    };
  }, [isEyeCareMode]);

  return (
    <EyeCareContext.Provider value={{ isEyeCareMode, toggleEyeCareMode }}>
      {children}
    </EyeCareContext.Provider>
  );
};

export const useEyeCare = () => {
  const context = useContext(EyeCareContext);
  if (context === undefined) {
    throw new Error("useEyeCare must be used within an EyeCareProvider");
  }
  return context;
};
