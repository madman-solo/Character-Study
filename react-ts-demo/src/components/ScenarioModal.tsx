import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ScenarioMode, EnglishLevel } from "../types";
import "../styles/ScenarioModal.css";

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
  const navigate = useNavigate();
  const [showLevelSelection, setShowLevelSelection] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<ScenarioMode | null>(
    null,
  );
  const [showTip, setShowTip] = useState(false);
  const [showCompanionSelection, setShowCompanionSelection] = useState(false);

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

  const levels: { value: EnglishLevel; label: string; description: string }[] =
    [
      { value: "1-6", label: "1~6岁", description: "无基础" },
      { value: "7-12", label: "7~12岁", description: "有一些基础" },
      { value: "12+", label: "12岁以上", description: "有一定基础" },
    ];

  const handleScenarioClick = (scenario: ScenarioMode) => {
    if (scenario.id === "1") {
      // 英语学习模式，显示难度选择
      onSelectScenario(scenario);

      setSelectedScenario(scenario);
      setShowLevelSelection(true);
    } else if (scenario.id === "2") {
      // 日常对话：跳转到首页
      // todo:外层的日常对话不是英语模式，只是跳转到首页
      onSelectScenario(scenario);
      onNavigateHome?.();
      onClose();
    } else if (scenario.id === "3") {
      onSelectScenario(scenario);

      // 专属陪伴：显示树洞/自定义选择
      setSelectedScenario(scenario);
      setShowCompanionSelection(true);
    } else {
      // 其他模式直接选择
      onSelectScenario(scenario);
      onClose();
    }
  };

  const handleLevelSelect = (level: EnglishLevel) => {
    if (selectedScenario) {
      if (level === "1-6") {
        // 1-6岁：显示提示
        setShowTip(true);
        onSelectScenario(selectedScenario, level);
      } else if (level === "7-12") {
        // 7-12岁：导航到单词本学习中心
        navigate("/child-vocabulary-hub");
        setShowLevelSelection(false);
        setSelectedScenario(null);
        onClose();
      } else {
        // 12+：显示英语学习模式选择
        onShowEnglishModeSelection?.(level);
        setShowLevelSelection(false);
        setSelectedScenario(null);
        onClose();
      }
    }
  };

  const handleBack = () => {
    setShowLevelSelection(false);
    setShowCompanionSelection(false);
    setSelectedScenario(null);
    setShowTip(false);
  };

  const handleCompanionSelect = (type: "tree-hole" | "custom") => {
    if (type === "tree-hole") {
      // 跳转到树洞对话页面
      navigate("/tree-hole");
      // todo: 记录选择的场景模式为专属陪伴
      onClose();
    } else {
      // 跳转到角色选择页面
      navigate("/character-selection");
      // todo: 记录选择的场景模式为专属陪伴，应该在情景模式完成
      onClose();
    }
  };

  const handleTipConfirm = () => {
    setShowTip(false);
    setShowLevelSelection(false);
    setSelectedScenario(null);
    onClose();
    navigate("/child-english-home");
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            {showTip
              ? "温馨提示"
              : showCompanionSelection
                ? "选择陪伴模式"
                : showLevelSelection
                  ? "选择对话难度"
                  : "选择情景模式"}
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
        ) : showCompanionSelection ? (
          <div className="companion-selection">
            <button className="back-button" onClick={handleBack}>
              ← 返回
            </button>
            <div className="companion-grid">
              <div
                className="companion-card"
                onClick={() => handleCompanionSelect("tree-hole")}
              >
                <div className="companion-icon">🌳</div>
                <h3 className="companion-name">树洞</h3>
                <p className="companion-description">倾诉心声，温暖陪伴</p>
              </div>
              <div
                className="companion-card"
                onClick={() => handleCompanionSelect("custom")}
              >
                <div className="companion-icon">✨</div>
                <h3 className="companion-name">自定义</h3>
                <p className="companion-description">打造专属场景</p>
              </div>
            </div>
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
