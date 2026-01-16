import { useState } from 'react';
import type { ScenarioMode, EnglishLevel } from '../types';
import '../styles/ScenarioModal.css';

interface ScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectScenario: (scenario: ScenarioMode, level?: EnglishLevel) => void;
  onShowEnglishModeSelection?: (level: EnglishLevel) => void;
  onNavigateHome?: () => void;
}

const ScenarioModal = ({
  isOpen,
  onClose,
  onSelectScenario,
  onShowEnglishModeSelection,
  onNavigateHome,
}: ScenarioModalProps) => {
  const [showLevelSelection, setShowLevelSelection] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<ScenarioMode | null>(null);
  const [showTip, setShowTip] = useState(false);

  const scenarios: ScenarioMode[] = [
    {
      id: "1",
      name: "英语学习",
      description: "通过对话提升英语水平",
      icon: "📚",
    },
    {
      id: "2",
      name: "日常对话",
      description: "轻松愉快的日常交流",
      icon: "💬",
    },
    {
      id: "3",
      name: "专属陪伴",
      description: "贴心的情感陪伴",
      icon: "💝",
    },
  ];

  const levels: { value: EnglishLevel; label: string; description: string }[] = [
    { value: '0-12', label: '0~12岁', description: '无基础' },
    { value: '13-18', label: '13~18岁', description: '有一些基础' },
    { value: '18+', label: '18岁以上', description: '四六级及以上' },
  ];

  const handleScenarioClick = (scenario: ScenarioMode) => {
    if (scenario.id === "1") {
      // 英语学习模式，显示难度选择
      setSelectedScenario(scenario);
      setShowLevelSelection(true);
    } else if (scenario.id === "2") {
      // 日常对话：跳转到首页
      onSelectScenario(scenario);
      onNavigateHome?.();
      onClose();
    } else {
      // 其他模式直接选择
      onSelectScenario(scenario);
      onClose();
    }
  };

  const handleLevelSelect = (level: EnglishLevel) => {
    if (selectedScenario) {
      if (level === '0-12') {
        // 0-12岁：显示提示
        setShowTip(true);
        onSelectScenario(selectedScenario, level);
      } else {
        // 13-18岁或18+：显示英语学习模式选择
        onShowEnglishModeSelection?.(level);
        setShowLevelSelection(false);
        setSelectedScenario(null);
        onClose();
      }
    }
  };

  const handleBack = () => {
    setShowLevelSelection(false);
    setSelectedScenario(null);
    setShowTip(false);
  };

  const handleTipConfirm = () => {
    setShowTip(false);
    setShowLevelSelection(false);
    setSelectedScenario(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            {showTip
              ? '温馨提示'
              : showLevelSelection
              ? '选择对话难度'
              : '选择情景模式'}
          </h2>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        {showTip ? (
          <div className="tip-content">
            <div className="tip-icon">🎉</div>
            <p className="tip-text">现在可以跟随角色开始学习啦！</p>
            <button className="confirm-button" onClick={handleTipConfirm}>
              开始学习
            </button>
          </div>
        ) : !showLevelSelection ? (
          <div className="scenarios-grid">
            {scenarios.map((scenario) => (
              <div
                key={scenario.id}
                className="scenario-card"
                onClick={() => handleScenarioClick(scenario)}
              >
                <div className="scenario-icon">{scenario.icon}</div>
                <h3 className="scenario-name">{scenario.name}</h3>
                <p className="scenario-description">{scenario.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="level-selection">
            <button className="back-button" onClick={handleBack}>
              ← 返回
            </button>
            <div className="levels-grid">
              {levels.map((level) => (
                <div
                  key={level.value}
                  className="level-card"
                  onClick={() => handleLevelSelect(level.value)}
                >
                  <h3 className="level-label">{level.label}</h3>
                  <p className="level-description">{level.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScenarioModal;
