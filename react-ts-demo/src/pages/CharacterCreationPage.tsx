import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createCharacter, updateCharacter } from '../services/characterService';
import type { CustomCharacter } from '../services/characterService';
import '../styles/CharacterCreationPage.css';

interface CharacterData {
  // 基础信息
  name: string;
  avatar: string;
  gender: 'male' | 'female' | 'other';
  age: string;

  // 性格设定
  personality: string;
  traits: string[];
  speakingStyle: string;

  // 背景故事
  background: string;
  hobbies: string[];

  // 关系设定
  relationshipType: string; // 朋友、恋人、导师等
  userRole: string; // 用户在关系中的角色

  // 场景设定
  sceneBackground: string;
  customColor?: string;
  customColor2?: string;
  customImage?: string;
}

const CharacterCreationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const userId = user?.id || 'guest';

  // 从路由获取编辑中的角色（如果有）
  const editingCharacter = (location.state as { character?: CustomCharacter })?.character;
  const isEditMode = !!editingCharacter;

  const [currentStep, setCurrentStep] = useState(1);
  const [characterData, setCharacterData] = useState<CharacterData>({
    name: '',
    avatar: '',
    gender: 'female',
    age: '',
    personality: '',
    traits: [],
    speakingStyle: '',
    background: '',
    hobbies: [],
    relationshipType: '朋友',
    userRole: '',
    sceneBackground: 'default',
    customColor: '#667eea',
    customColor2: '#764ba2',
  });

  // 加载编辑角色数据
  useEffect(() => {
    if (editingCharacter) {
      setCharacterData({
        name: editingCharacter.name,
        avatar: editingCharacter.avatar || '',
        gender: editingCharacter.gender,
        age: editingCharacter.age || '',
        personality: editingCharacter.personality,
        traits: editingCharacter.traits,
        speakingStyle: editingCharacter.speakingStyle || '',
        background: editingCharacter.background || '',
        hobbies: editingCharacter.hobbies,
        relationshipType: '朋友', // 默认值，因为旧数据可能没有
        userRole: '',
        sceneBackground: 'default',
        customColor: '#667eea',
        customColor2: '#764ba2',
      });
    }
  }, [editingCharacter]);

  const [traitInput, setTraitInput] = useState('');
  const [hobbyInput, setHobbyInput] = useState('');

  // 预设性格标签
  const presetTraits = [
    '温柔', '活泼', '冷静', '傲娇', '开朗', '内向',
    '幽默', '认真', '天然呆', '成熟', '可爱', '高冷',
    '善良', '勇敢', '聪明', '浪漫', '神秘', '乐观'
  ];

  // 预设关系类型
  const relationshipTypes = [
    { id: 'friend', name: '朋友', icon: '👫', desc: '互相陪伴的好友' },
    { id: 'lover', name: '恋人', icon: '💑', desc: '浪漫的恋爱关系' },
    { id: 'mentor', name: '导师', icon: '👨‍🏫', desc: '指导与学习' },
    { id: 'family', name: '家人', icon: '👨‍👩‍👧', desc: '温暖的家庭关系' },
    { id: 'companion', name: '伙伴', icon: '🤝', desc: '并肩前行的伙伴' },
    { id: 'custom', name: '自定义', icon: '✨', desc: '创造独特关系' },
  ];

  // 背景主题
  const backgroundThemes = [
    { id: 'default', name: '梦幻紫', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { id: 'sunset', name: '日落橙', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
    { id: 'ocean', name: '海洋蓝', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    { id: 'forest', name: '森林绿', gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
    { id: 'night', name: '星空黑', gradient: 'linear-gradient(135deg, #4a5568 0%, #2d3748 100%)' },
    { id: 'cherry', name: '樱花粉', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  ];

  // 添加标签
  const addTrait = () => {
    if (traitInput.trim() && !characterData.traits.includes(traitInput.trim())) {
      setCharacterData({
        ...characterData,
        traits: [...characterData.traits, traitInput.trim()],
      });
      setTraitInput('');
    }
  };

  const removeTrait = (trait: string) => {
    setCharacterData({
      ...characterData,
      traits: characterData.traits.filter(t => t !== trait),
    });
  };

  const togglePresetTrait = (trait: string) => {
    if (characterData.traits.includes(trait)) {
      removeTrait(trait);
    } else {
      setCharacterData({
        ...characterData,
        traits: [...characterData.traits, trait],
      });
    }
  };

  // 添加爱好
  const addHobby = () => {
    if (hobbyInput.trim() && !characterData.hobbies.includes(hobbyInput.trim())) {
      setCharacterData({
        ...characterData,
        hobbies: [...characterData.hobbies, hobbyInput.trim()],
      });
      setHobbyInput('');
    }
  };

  const removeHobby = (hobby: string) => {
    setCharacterData({
      ...characterData,
      hobbies: characterData.hobbies.filter(h => h !== hobby),
    });
  };

  // 图片上传
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCharacterData({ ...characterData, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // 背景图片上传
  const handleBackgroundImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCharacterData({
          ...characterData,
          sceneBackground: 'custom-image',
          customImage: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // 步骤验证
  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return characterData.name.trim() !== '';
      case 2:
        return characterData.personality.trim() !== '' && characterData.traits.length > 0;
      case 3:
        return true; // 背景故事可选
      case 4:
        return characterData.relationshipType !== '';
      case 5:
        return true; // 场景设定可选
      default:
        return false;
    }
  };

  // 下一步
  const handleNext = () => {
    if (canProceed() && currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  // 上一步
  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // 完成创建/更新
  const handleComplete = async () => {
    if (!canProceed()) {
      alert('请完成必填项');
      return;
    }

    try {
      let character;

      if (isEditMode && editingCharacter) {
        // 更新现有角色
        character = await updateCharacter(editingCharacter.id, {
          name: characterData.name,
          avatar: characterData.avatar,
          gender: characterData.gender,
          age: characterData.age,
          personality: characterData.personality,
          background: characterData.background,
          speakingStyle: characterData.speakingStyle,
          hobbies: characterData.hobbies,
          traits: characterData.traits,
        });
      } else {
        // 创建新角色
        character = await createCharacter({
          userId,
          name: characterData.name,
          avatar: characterData.avatar,
          gender: characterData.gender,
          age: characterData.age,
          personality: characterData.personality,
          background: characterData.background,
          speakingStyle: characterData.speakingStyle,
          hobbies: characterData.hobbies,
          traits: characterData.traits,
        });
      }

      // 导航到对话页面
      navigate('/custom-companion-chat', {
        state: {
          character,
          userIdentity: characterData.userRole || '用户',
          userName: user?.id || '未设置',
          userStory: '',
          companionIdentity: character.name,
          companionName: character.name,
          companionStory: character.background || '',
          backgroundStory: `你们是${characterData.relationshipType}关系`,
          background: characterData.sceneBackground,
          customColor: characterData.customColor,
          customColor2: characterData.customColor2,
          customImage: characterData.customImage,
        },
      });
    } catch (error) {
      console.error(isEditMode ? '更新角色失败:' : '创建角色失败:', error);
      alert(isEditMode ? '更新角色失败，请重试' : '创建角色失败，请重试');
    }
  };

  // 渲染步骤内容
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderBasicInfo();
      case 2:
        return renderPersonality();
      case 3:
        return renderBackground();
      case 4:
        return renderRelationship();
      case 5:
        return renderSceneSetup();
      default:
        return null;
    }
  };

  // 步骤1: 基础信息
  const renderBasicInfo = () => (
    <div className="step-content">
      <h2 className="step-title">✨ 基础信息</h2>
      <p className="step-subtitle">让我们先认识一下你的角色</p>

      <div className="avatar-upload-section">
        <div className="avatar-preview">
          {characterData.avatar ? (
            <img src={characterData.avatar} alt="角色头像" />
          ) : (
            <div className="avatar-placeholder">
              <span>{characterData.name[0] || '?'}</span>
            </div>
          )}
        </div>
        <label className="upload-btn">
          <input type="file" accept="image/*" onChange={handleImageUpload} hidden />
          上传头像
        </label>
      </div>

      <div className="form-field">
        <label className="field-label">
          角色名字 <span className="required">*</span>
        </label>
        <input
          type="text"
          className="field-input"
          value={characterData.name}
          onChange={(e) => setCharacterData({ ...characterData, name: e.target.value })}
          placeholder="给你的角色起个名字"
          maxLength={20}
        />
      </div>

      <div className="form-row">
        <div className="form-field">
          <label className="field-label">性别</label>
          <div className="gender-options">
            {[
              { value: 'female', label: '女性', icon: '♀' },
              { value: 'male', label: '男性', icon: '♂' },
              { value: 'other', label: '其他', icon: '⚧' },
            ].map((option) => (
              <button
                key={option.value}
                className={`gender-btn ${characterData.gender === option.value ? 'active' : ''}`}
                onClick={() => setCharacterData({ ...characterData, gender: option.value as any })}
              >
                <span className="gender-icon">{option.icon}</span>
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="form-field">
          <label className="field-label">年龄</label>
          <input
            type="text"
            className="field-input"
            value={characterData.age}
            onChange={(e) => setCharacterData({ ...characterData, age: e.target.value })}
            placeholder="例如: 18岁"
          />
        </div>
      </div>
    </div>
  );

  // 步骤2: 性格设定
  const renderPersonality = () => (
    <div className="step-content">
      <h2 className="step-title">🎭 性格设定</h2>
      <p className="step-subtitle">塑造角色的独特个性</p>

      <div className="form-field">
        <label className="field-label">
          性格描述 <span className="required">*</span>
        </label>
        <textarea
          className="field-textarea"
          value={characterData.personality}
          onChange={(e) => setCharacterData({ ...characterData, personality: e.target.value })}
          placeholder="描述角色的性格特点，例如：温柔体贴、善解人意、喜欢照顾别人..."
          rows={4}
        />
      </div>

      <div className="form-field">
        <label className="field-label">
          性格标签 <span className="required">*</span>
        </label>
        <div className="preset-traits-grid">
          {presetTraits.map((trait) => (
            <button
              key={trait}
              className={`trait-chip ${characterData.traits.includes(trait) ? 'active' : ''}`}
              onClick={() => togglePresetTrait(trait)}
            >
              {trait}
            </button>
          ))}
        </div>

        <div className="custom-trait-input">
          <input
            type="text"
            className="field-input"
            value={traitInput}
            onChange={(e) => setTraitInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTrait())}
            placeholder="自定义标签"
          />
          <button className="add-btn" onClick={addTrait}>添加</button>
        </div>

        {characterData.traits.length > 0 && (
          <div className="selected-traits">
            {characterData.traits.map((trait) => (
              <span key={trait} className="trait-tag">
                {trait}
                <button onClick={() => removeTrait(trait)}>×</button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="form-field">
        <label className="field-label">说话风格</label>
        <textarea
          className="field-textarea"
          value={characterData.speakingStyle}
          onChange={(e) => setCharacterData({ ...characterData, speakingStyle: e.target.value })}
          placeholder="描述角色的说话方式，例如：语气温柔、喜欢用叠词、经常使用敬语..."
          rows={3}
        />
      </div>
    </div>
  );

  // 步骤3: 背景故事
  const renderBackground = () => (
    <div className="step-content">
      <h2 className="step-title">📖 背景故事</h2>
      <p className="step-subtitle">赋予角色生命和深度</p>

      <div className="form-field">
        <label className="field-label">背景故事</label>
        <textarea
          className="field-textarea"
          value={characterData.background}
          onChange={(e) => setCharacterData({ ...characterData, background: e.target.value })}
          placeholder="角色的过去经历、成长环境、重要事件..."
          rows={5}
        />
      </div>

      <div className="form-field">
        <label className="field-label">兴趣爱好</label>
        <div className="custom-trait-input">
          <input
            type="text"
            className="field-input"
            value={hobbyInput}
            onChange={(e) => setHobbyInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHobby())}
            placeholder="添加兴趣爱好"
          />
          <button className="add-btn" onClick={addHobby}>添加</button>
        </div>

        {characterData.hobbies.length > 0 && (
          <div className="selected-traits">
            {characterData.hobbies.map((hobby) => (
              <span key={hobby} className="trait-tag">
                {hobby}
                <button onClick={() => removeHobby(hobby)}>×</button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // 步骤4: 关系设定
  const renderRelationship = () => (
    <div className="step-content">
      <h2 className="step-title">💫 关系设定</h2>
      <p className="step-subtitle">定义你们之间的关系</p>

      <div className="relationship-grid">
        {relationshipTypes.map((type) => (
          <button
            key={type.id}
            className={`relationship-card ${characterData.relationshipType === type.name ? 'active' : ''}`}
            onClick={() => setCharacterData({ ...characterData, relationshipType: type.name })}
          >
            <div className="relationship-icon">{type.icon}</div>
            <div className="relationship-name">{type.name}</div>
            <div className="relationship-desc">{type.desc}</div>
          </button>
        ))}
      </div>

      {characterData.relationshipType === '自定义' && (
        <div className="form-field">
          <label className="field-label">自定义关系</label>
          <input
            type="text"
            className="field-input"
            value={characterData.userRole}
            onChange={(e) => setCharacterData({ ...characterData, userRole: e.target.value })}
            placeholder="描述你们的关系"
          />
        </div>
      )}
    </div>
  );

  // 步骤5: 场景设定
  const renderSceneSetup = () => (
    <div className="step-content">
      <h2 className="step-title">🎨 场景设定</h2>
      <p className="step-subtitle">选择对话的视觉氛围</p>

      <div className="background-grid">
        {backgroundThemes.map((theme) => (
          <button
            key={theme.id}
            className={`background-card ${characterData.sceneBackground === theme.id ? 'active' : ''}`}
            onClick={() => setCharacterData({ ...characterData, sceneBackground: theme.id })}
          >
            <div className="background-preview" style={{ background: theme.gradient }}></div>
            <div className="background-name">{theme.name}</div>
          </button>
        ))}
      </div>

      <div className="custom-background-section">
        <label className="upload-btn secondary">
          <input type="file" accept="image/*" onChange={handleBackgroundImageUpload} hidden />
          上传自定义背景
        </label>
      </div>

      {characterData.sceneBackground === 'custom-gradient' && (
        <div className="color-picker-section">
          <div className="form-field">
            <label className="field-label">渐变色1</label>
            <input
              type="color"
              value={characterData.customColor}
              onChange={(e) => setCharacterData({ ...characterData, customColor: e.target.value })}
            />
          </div>
          <div className="form-field">
            <label className="field-label">渐变色2</label>
            <input
              type="color"
              value={characterData.customColor2}
              onChange={(e) => setCharacterData({ ...characterData, customColor2: e.target.value })}
            />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="character-creation-page">
      <div className="creation-container">
        {/* 页面标题 */}
        <h1 className="page-title" style={{ textAlign: 'center', marginBottom: '20px', color: '#6c6c6e' }}>
          {isEditMode ? '✏️ 编辑角色' : '✨ 创建角色'}
        </h1>

        {/* 进度指示器 */}
        <div className="progress-bar">
          {[1, 2, 3, 4, 5].map((step) => (
            <div
              key={step}
              className={`progress-step ${currentStep >= step ? 'active' : ''} ${currentStep === step ? 'current' : ''}`}
            >
              <div className="step-circle">{step}</div>
              <div className="step-label">
                {step === 1 && '基础'}
                {step === 2 && '性格'}
                {step === 3 && '背景'}
                {step === 4 && '关系'}
                {step === 5 && '场景'}
              </div>
            </div>
          ))}
        </div>

        {/* 步骤内容 */}
        <div className="content-area">
          {renderStepContent()}
        </div>

        {/* 导航按钮 */}
        <div className="navigation-buttons">
          <button
            className="nav-btn secondary"
            onClick={() => navigate('/character-selection')}
          >
            取消
          </button>

          {currentStep > 1 && (
            <button className="nav-btn secondary" onClick={handlePrev}>
              上一步
            </button>
          )}

          {currentStep < 5 ? (
            <button
              className="nav-btn primary"
              onClick={handleNext}
              disabled={!canProceed()}
            >
              下一步
            </button>
          ) : (
            <button
              className="nav-btn primary"
              onClick={handleComplete}
              disabled={!canProceed()}
            >
              {isEditMode ? '保存修改' : '完成创建'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CharacterCreationPage;
