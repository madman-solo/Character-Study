import type { EnglishLevel } from "../types";
import "../styles/EnglishLearningModeModal.css";
import { useFocusTrap, useEscClose } from "../hooks/useAccessibility";
import { useRef } from "react";
export type EnglishLearningModeType =
  | "daily-conversation"
  | "listening-speaking"
  | "vocabulary"
  | "real-time-translation"
  | "writing";

interface EnglishLearningModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  level: EnglishLevel | null;
  onSelectMode: (mode: EnglishLearningModeType) => void;
}

const EnglishLearningModeModal = ({
  isOpen,
  onClose,
  onSelectMode,
}: EnglishLearningModeModalProps) => {
  const modes: {
    value: EnglishLearningModeType;
    label: string;
    description: string;
    icon: string;
  }[] = [
    {
      value: "daily-conversation",
      label: "日常对话",
      description: "在日常对话中学习英语",
      icon: "/src/assets/iconfont/对话框.svg",
    },
    {
      value: "listening-speaking",
      label: "听力+口语",
      description: "提升听力和口语能力",
      icon: "/src/assets/iconfont/芝士_听力理解.svg",
    },
    {
      value: "vocabulary",
      label: "单词本",
      description: "系统化学习单词",
      icon: "/src/assets/iconfont/单词本.svg",
    },
    {
      value: "real-time-translation",
      label: "实时翻译",
      description: "多语言实时翻译工具",
      icon: "/src/assets/iconfont/语言翻译.svg",
    },
    {
      value: "writing",
      label: "写作",
      description: "AI辅助写作与实时纠正",
      icon: "/src/assets/iconfont/书写.svg",
    },
  ];
  const modalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(modalRef, isOpen);
  useEscClose(onClose, isOpen);
  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="presentation"
      aria-hidden="true"
    >
      <div
        className="modal-content english-mode-modal"
        onClick={(e) => e.stopPropagation()}
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
      >
        <div className="modal-header">
          <h2 id="modal-title">选择英语学习模式</h2>
          <button className="close-button" onClick={onClose} aria-label="关闭">
            ✕
          </button>
        </div>

        <div className="english-modes-grid">
          {modes.map((mode) => (
            <div
              key={mode.value}
              className="english-mode-card"
              role="button"
              tabIndex={0}
              onClick={() => { onSelectMode(mode.value); onClose(); }}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onSelectMode(mode.value), onClose())}
            >
              <div className="mode-icon">
                <img src={mode.icon} alt={mode.label} width={44} height={44} />
              </div>
              <h3 className="mode-label">{mode.label}</h3>
              <p className="mode-description">{mode.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EnglishLearningModeModal;
