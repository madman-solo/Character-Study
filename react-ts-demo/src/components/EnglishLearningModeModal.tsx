import type { EnglishLevel } from '../types';
import '../styles/EnglishLearningModeModal.css';

export type EnglishLearningModeType = 'daily-conversation' | 'listening-speaking' | 'vocabulary';

interface EnglishLearningModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  level: EnglishLevel | null;
  onSelectMode: (mode: EnglishLearningModeType) => void;
}

const EnglishLearningModeModal = ({
  isOpen,
  onClose,
  level,
  onSelectMode,
}: EnglishLearningModeModalProps) => {
  const modes: { value: EnglishLearningModeType; label: string; description: string; icon: string }[] = [
    {
      value: 'daily-conversation',
      label: '日常对话',
      description: '在日常对话中学习英语',
      icon: '💬',
    },
    {
      value: 'listening-speaking',
      label: '听力+口语',
      description: '提升听力和口语能力',
      icon: '🎧',
    },
    {
      value: 'vocabulary',
      label: '单词本',
      description: '系统化学习单词',
      icon: '📖',
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content english-mode-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>选择英语学习模式</h2>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="english-modes-grid">
          {modes.map((mode) => (
            <div
              key={mode.value}
              className="english-mode-card"
              onClick={() => {
                onSelectMode(mode.value);
                onClose();
              }}
            >
              <div className="mode-icon">{mode.icon}</div>
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
