import type { LearningMode } from '../types';
import '../styles/LearningModeModal.css';

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
  const modes: { value: LearningMode; label: string; description: string; icon: string }[] = [
    {
      value: 'vocabulary-book',
      label: '单词本模式',
      description: '查看单词本，系统化学习单词',
      icon: '📚',
    },
    {
      value: 'interactive-memory',
      label: '互动记忆模式',
      description: '与角色互动，在对话中记忆单词',
      icon: '💬',
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content learning-mode-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>选择学习模式</h2>
          <button className="close-button" onClick={onClose}>
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

export default LearningModeModal;
