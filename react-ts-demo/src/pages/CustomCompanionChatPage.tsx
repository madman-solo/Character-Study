import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ChatInterface from "../components/ChatInterface";
import CharacterSelector from "../components/CharacterSelector";
import CharacterForm from "../components/CharacterForm";
import { useAuth } from "../contexts/AuthContext";
import type { CustomCharacter } from "../services/characterService";
import "../styles/CustomCompanionChatPage.css";

interface CustomSetup {
  userIdentity: string;
  userName: string;
  userStory: string;
  companionIdentity: string;
  companionName: string;
  companionStory: string;
  backgroundStory: string;
  background: string;
  customColor?: string;
  customColor2?: string;
  customImage?: string;
}

const CustomCompanionChatPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const setup = location.state as CustomSetup;
  const { user } = useAuth();
  const userId = user?.id || "guest";

  // 角色系统状态
  const [selectedCharacter, setSelectedCharacter] =
    useState<CustomCharacter | null>(null);
  const [showCharacterForm, setShowCharacterForm] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<
    CustomCharacter | undefined
  >(undefined);

  // 如果没有设置信息，返回设置页面
  useEffect(() => {
    if (!setup || !setup.userIdentity || !setup.companionIdentity) {
      navigate("/custom-companion-setup");
    }
  }, [setup, navigate]);

  if (!setup) return null;

  // 处理角色选择
  const handleSelectCharacter = (character: CustomCharacter) => {
    setSelectedCharacter(character);
  };

  // 处理创建新角色
  const handleCreateNew = () => {
    setEditingCharacter(undefined);
    navigate("/character-creation", { state: { userId } });
  };

  // 处理编辑角色
  const handleEditCharacter = (character: CustomCharacter) => {
    navigate("/character-creation", { state: { character } });
  };

  // // 处理表单成功
  // const handleFormSuccess = () => {
  //   // setShowCharacterForm(false);
  //   setEditingCharacter(undefined);
  //   // 刷新角色列表会由CharacterSelector自动处理
  // };

  // // 处理表单取消
  // const handleFormCancel = () => {
  //   setShowCharacterForm(false);
  //   setEditingCharacter(undefined);
  // };

  // 构建系统提示词
  const getSystemPrompt = () => {
    // 如果选择了自定义角色，使用角色的systemPrompt
    if (selectedCharacter) {
      return selectedCharacter.systemPrompt;
    }

    // 否则使用原有的自定义设置
    return `你是用户自定义的陪伴角色。

角色设定：
- 你的身份是：${setup.companionIdentity}
- 你的名字是：${setup.companionName || "未设置"}
- 你的故事：${setup.companionStory || "无"}
- 用户的身份是：${setup.userIdentity}
- 用户的名字是：${setup.userName || "未设置"}
- 用户的故事：${setup.userStory || "无"}
- 你们之间的关系背景：${setup.backgroundStory || "无特定背景"}

请根据这些设定，提供温暖、真诚、符合角色身份的陪伴和对话。`;
  };

  // 获取标题
  const getTitle = () => {
    if (selectedCharacter) {
      return selectedCharacter.name;
    }
    return setup.companionName || setup.companionIdentity;
  };

  // 背景样式映射
  const backgroundOptions: Record<string, string> = {
    default: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    sunset: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    ocean: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    forest: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    night: "linear-gradient(135deg, #4a5568 0%, #2d3748 100%)",
    cherry: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  };

  // 获取背景样式
  const getBackgroundStyle = (): React.CSSProperties => {
    if (
      setup.background === "custom-gradient" &&
      setup.customColor &&
      setup.customColor2
    ) {
      return {
        background: `linear-gradient(135deg, ${setup.customColor} 0%, ${setup.customColor2} 100%)`,
      };
    } else if (setup.background === "custom-image" && setup.customImage) {
      return {
        backgroundImage: `url(${setup.customImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      };
    } else {
      return {
        background:
          backgroundOptions[setup.background] || backgroundOptions.default,
      };
    }
  };

  return (
    <div className="custom-companion-chat-page" style={getBackgroundStyle()}>
      {/* 角色选择器 */}
      <div className="character-selector-wrapper">
        <CharacterSelector
          userId={userId}
          onSelectCharacter={handleSelectCharacter}
          onCreateNew={handleCreateNew}
          onEditCharacter={handleEditCharacter}
          currentCharacterId={selectedCharacter?.id}
        />
      </div>

      {/* 聊天界面 */}
      <ChatInterface
        scene="custom"
        title={getTitle()}
        systemPrompt={getSystemPrompt()}
        placeholder="输入消息..."
        enableTypewriter={true}
        maxRounds={10}
        characterId={selectedCharacter?.id}
      />

      {/* 角色创建/编辑表单
      {showCharacterForm && (
        <CharacterForm
          userId={userId}
          character={editingCharacter}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )} */}
    </div>
  );
};

export default CustomCompanionChatPage;
