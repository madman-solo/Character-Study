import type { LearningMode } from "../types";
import "../styles/LearningModeModal.css";
import { useFocusTrap, useEscClose } from "../hooks/useAccessibility";
import { useRef } from "react";
interface LearningModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMode: (mode: LearningMode) => void;
}

const LearningModeModal = ({
  isOpen,
  onClose,
  onSelectMode,
}: LearningModeModalProps) => {
  const modes: {
    value: LearningMode;
    label: string;
    description: string;
    icon: string;
  }[] = [
    {
      value: "vocabulary-book",
      label: "单词本模式",
      description: "查看单词本，系统化学习单词",
      icon: "/src/assets/iconfont/单词本.svg",
    },
    {
      value: "interactive-memory",
      label: "互动记忆模式",
      description: "与角色互动，在对话中记忆单词",
      icon: "/src/assets/iconfont/对话框.svg",
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
        className="modal-content learning-mode-modal"
        onClick={(e) => e.stopPropagation()}
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal-header">
          <h2 id="modal-title">选择学习模式</h2>
          <button className="close-button" onClick={onClose} aria-label="关闭">
            ✕
          </button>
        </div>

        <div className="modes-grid">
          {modes.map((mode) => (
            <div
              key={mode.value}
              className="mode-card"
              onClick={() => {
                onSelectMode(mode.value);
                onClose();
              }}
            >
              <div className="mode-icon">
                <img src={mode.icon} alt={mode.label} width={38} height={38} />
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

export default LearningModeModal;
