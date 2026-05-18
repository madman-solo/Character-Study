import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ChatInterface from "../components/ChatInterface";
import { useAuth } from "../contexts/AuthContext";
import type { CustomCharacter } from "../services/characterService";
import { getUserCharacters } from "../services/characterService";
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
  character?: CustomCharacter;
}

const CustomCompanionChatPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const setup = location.state as CustomSetup;
  const { user } = useAuth();
  const userId = user?.id || "guest";

  // 角色系统状态：优先从 location.state 中读取刚创建/编辑的角色
  const [selectedCharacter, setSelectedCharacter] =
    useState<CustomCharacter | null>(setup?.character || null);
  const [, setShowCharacterForm] = useState(false);
  const [, setEditingCharacter] = useState<CustomCharacter | undefined>(undefined);
  void setShowCharacterForm; void setEditingCharacter;

  // 如果没有设置信息，返回设置页面
  useEffect(() => {
    if (!setup || !setup.userIdentity || !setup.companionIdentity) {
      navigate("/custom-companion-setup");
    }
  }, [setup, navigate]);

  // 持久化 characterId，刷新时从数据库重新加载
  useEffect(() => {
    if (setup?.character?.id) {
      localStorage.setItem("lastCharacterId", String(setup.character.id));
    }
  }, [setup?.character?.id]);

  useEffect(() => {
    if (selectedCharacter) return; // 已有角色，不需要重新加载
    const savedId = localStorage.getItem("lastCharacterId");
    if (!savedId) return;
    getUserCharacters(userId).then((chars) => {
      const found = chars.find((c) => c.id === Number(savedId));
      if (found) setSelectedCharacter(found);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]); // 只在 userId 变化时执行，selectedCharacter 变化不触发

  if (!setup) return null;

  // 处理角色选择
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSelectCharacter = (character: CustomCharacter) => {
    setSelectedCharacter(character);
  };
  void handleSelectCharacter;

  // 处理创建新角色
  const _handleCreateNew = () => {
    setEditingCharacter(undefined);
    navigate("/character-creation", { state: { userId } });
  };
  void _handleCreateNew;

  // 处理编辑角色
  const _handleEditCharacter = (character: CustomCharacter) => {
    navigate("/character-creation", { state: { character } });
  };
  void _handleEditCharacter;

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
    //优先使用角色的背景设置：
    if (selectedCharacter) {
      const bg = selectedCharacter.sceneBackground || "default";
      if (
        bg === "custom-gradient" &&
        selectedCharacter.customColor &&
        selectedCharacter.customColor2
      ) {
        return {
          background: `linear-gradient(135deg, ${selectedCharacter.customColor} 0%, ${selectedCharacter.customColor2} 100%)`,
          "--bg-style": `linear-gradient(135deg, ${selectedCharacter.customColor} 0%, ${selectedCharacter.customColor2} 100%)`,
        } as React.CSSProperties;
      } else if (bg === "custom-image" && selectedCharacter.customImage) {
        return {
          backgroundImage: `url(${selectedCharacter.customImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          "--bg-style": `url(${selectedCharacter.customImage}) center/cover fixed`,
        } as React.CSSProperties;
      }
    }
    if (
      setup.background === "custom-gradient" &&
      setup.customColor &&
      setup.customColor2
    ) {
      return {
        background: `linear-gradient(135deg, ${setup.customColor} 0%, ${setup.customColor2} 100%)`,
        "--bg-style": `linear-gradient(135deg, ${setup.customColor} 0%, ${setup.customColor2} 100%)`,
      } as React.CSSProperties;
    } else if (setup.background === "custom-image" && setup.customImage) {
      return {
        backgroundImage: `url(${setup.customImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        "--bg-style": `url(${setup.customImage}) center/cover fixed`,
      } as React.CSSProperties;
    } else {
      return {
        background:
          backgroundOptions[setup.background] || backgroundOptions.default,
        "--bg-style":
          backgroundOptions[setup.background] || backgroundOptions.default,
      } as React.CSSProperties;
    }
  };

  return (
    <div className="custom-companion-chat-page" style={getBackgroundStyle()}>
      {/* 角色选择器 */}
      {/* <div className="character-selector-wrapper">
        <CharacterSelector
          userId={userId}
          onSelectCharacter={handleSelectCharacter}
          onCreateNew={handleCreateNew}
          onEditCharacter={handleEditCharacter}
          currentCharacterId={selectedCharacter?.id}
        />
      </div> */}

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
