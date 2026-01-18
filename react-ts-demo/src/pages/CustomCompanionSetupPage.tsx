import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/CustomCompanionSetupPage.css';

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

const CustomCompanionSetupPage = () => {
  const navigate = useNavigate();
  const [setup, setSetup] = useState<CustomSetup>({
    userIdentity: '',
    userName: '',
    userStory: '',
    companionIdentity: '',
    companionName: '',
    companionStory: '',
    backgroundStory: '',
    background: 'default',
    customColor: '#667eea',
    customColor2: '#764ba2',
    customImage: '',
  });
  const [showUserModal, setShowUserModal] = useState(false);
  const [showCompanionModal, setShowCompanionModal] = useState(false);
  const [tempUserIdentity, setTempUserIdentity] = useState('');
  const [tempUserName, setTempUserName] = useState('');
  const [tempUserStory, setTempUserStory] = useState('');
  const [tempCompanionIdentity, setTempCompanionIdentity] = useState('');
  const [tempCompanionName, setTempCompanionName] = useState('');
  const [tempCompanionStory, setTempCompanionStory] = useState('');
  const [tempBackgroundStory, setTempBackgroundStory] = useState('');

  const backgroundOptions = [
    { id: 'default', name: '默认背景', preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { id: 'sunset', name: '日落余晖', preview: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
    { id: 'ocean', name: '海洋之心', preview: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    { id: 'forest', name: '森林绿意', preview: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
    { id: 'night', name: '星空夜晚', preview: 'linear-gradient(135deg, #4a5568 0%, #2d3748 100%)' },
    { id: 'cherry', name: '樱花粉', preview: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSetup({ ...setup, background: 'custom-image', customImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenUserModal = () => {
    setTempUserIdentity(setup.userIdentity);
    setTempUserName(setup.userName);
    setTempUserStory(setup.userStory);
    setTempBackgroundStory(setup.backgroundStory);
    setShowUserModal(true);
  };

  const handleOpenCompanionModal = () => {
    setTempCompanionIdentity(setup.companionIdentity);
    setTempCompanionName(setup.companionName);
    setTempCompanionStory(setup.companionStory);
    setTempBackgroundStory(setup.backgroundStory);
    setShowCompanionModal(true);
  };

  const handleSaveUserSettings = () => {
    setSetup({
      ...setup,
      userIdentity: tempUserIdentity,
      userName: tempUserName,
      userStory: tempUserStory,
      backgroundStory: tempBackgroundStory
    });
    setShowUserModal(false);
  };

  const handleSaveCompanionSettings = () => {
    setSetup({
      ...setup,
      companionIdentity: tempCompanionIdentity,
      companionName: tempCompanionName,
      companionStory: tempCompanionStory,
      backgroundStory: tempBackgroundStory
    });
    setShowCompanionModal(false);
  };

  const handleCopyColor = (color: string) => {
    navigator.clipboard.writeText(color);
    alert(`颜色 ${color} 已复制到剪贴板`);
  };

  const handleStartChat = () => {
    if (!setup.userIdentity || !setup.companionIdentity) {
      alert('请填写完整的身份信息');
      return;
    }
    // 跳转到自定义聊天页面，传递设置信息
    navigate('/custom-companion-chat', { state: setup });
  };

  return (
    <div className="custom-setup-page">
      <div className="setup-container">
        {/* 头部 */}
        <div className="setup-header">
          <button className="setup-back-button" onClick={() => navigate('/')}>
            ← 返回
          </button>
          <h1 className="setup-title">自定义场景设置</h1>
          <p className="setup-subtitle">打造属于你的专属陪伴体验</p>
        </div>

        {/* 设置表单 */}
        <div className="setup-form">
          {/* 你的设定 */}
          <div className="form-section">
            <label className="form-label">
              <span className="label-icon">👤</span>
              <span className="label-text">你的设定</span>
            </label>
            <button
              type="button"
              className="settings-button"
              onClick={handleOpenUserModal}
            >
              {setup.userIdentity || '点击设置你的角色信息'}
            </button>
          </div>

          {/* 对方的设定 */}
          <div className="form-section">
            <label className="form-label">
              <span className="label-icon">💫</span>
              <span className="label-text">对方的设定</span>
            </label>
            <button
              type="button"
              className="settings-button"
              onClick={handleOpenCompanionModal}
            >
              {setup.companionIdentity || '点击设置对方的角色信息'}
            </button>
          </div>

          {/* 自定义背景 */}
          <div className="form-section">
            <label className="form-label">
              <span className="label-icon">🎨</span>
              <span className="label-text">自定义背景</span>
            </label>

            {/* 取色卡 */}
            <div className="custom-background-section">
              <div className="color-picker-container">
                <div className="color-picker-row">
                  <div className="color-picker-wrapper">
                    <label className="color-picker-label">颜色1</label>
                    <div className="color-input-group">
                      <input
                        type="color"
                        className="color-picker-input"
                        value={setup.customColor}
                        onChange={(e) => setSetup({ ...setup, background: 'custom-gradient', customColor: e.target.value })}
                      />
                      <div className="color-preview" style={{ background: setup.customColor }}></div>
                      <span className="color-value">{setup.customColor}</span>
                      <button
                        className="copy-color-btn"
                        onClick={() => handleCopyColor(setup.customColor || '#667eea')}
                        title="复制颜色"
                      >
                        📋
                      </button>
                    </div>
                  </div>

                  <div className="color-picker-wrapper">
                    <label className="color-picker-label">颜色2（渐变）</label>
                    <div className="color-input-group">
                      <input
                        type="color"
                        className="color-picker-input"
                        value={setup.customColor2}
                        onChange={(e) => setSetup({ ...setup, background: 'custom-gradient', customColor2: e.target.value })}
                      />
                      <div className="color-preview" style={{ background: setup.customColor2 }}></div>
                      <span className="color-value">{setup.customColor2}</span>
                      <button
                        className="copy-color-btn"
                        onClick={() => handleCopyColor(setup.customColor2 || '#764ba2')}
                        title="复制颜色"
                      >
                        📋
                      </button>
                    </div>
                  </div>
                </div>

                <div className="gradient-preview-box">
                  <div className="gradient-preview-label">渐变预览</div>
                  <div
                    className="gradient-preview"
                    style={{
                      background: `linear-gradient(135deg, ${setup.customColor} 0%, ${setup.customColor2} 100%)`
                    }}
                  ></div>
                </div>
              </div>

              {/* 上传本地图片 */}
              <div className="image-upload-wrapper">
                <label className="image-upload-label">
                  <input
                    type="file"
                    accept="image/*"
                    className="image-upload-input"
                    onChange={handleImageUpload}
                  />
                  <span className="upload-button">📁 上传本地图片</span>
                </label>
              </div>
            </div>

            {/* 预设背景 */}
            <div className="preset-backgrounds">
              <div className="preset-label">或选择预设背景</div>
              <div className="background-grid">
                {backgroundOptions.map((bg) => (
                  <div
                    key={bg.id}
                    className={`background-option ${setup.background === bg.id ? 'selected' : ''}`}
                    onClick={() => setSetup({ ...setup, background: bg.id })}
                  >
                    <div
                      className="background-preview"
                      style={{ background: bg.preview }}
                    ></div>
                    <span className="background-name">{bg.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 开始按钮 */}
          <button className="start-chat-button" onClick={handleStartChat}>
            开始对话
          </button>
        </div>

        {/* 预览区 */}
        <div className="setup-preview">
          <div className="preview-label">预览</div>
          <div
            className="preview-box"
            style={{
              background:
                setup.background === 'custom-gradient'
                  ? `linear-gradient(135deg, ${setup.customColor} 0%, ${setup.customColor2} 100%)`
                  : setup.background === 'custom-image' && setup.customImage
                  ? `url(${setup.customImage})`
                  : backgroundOptions.find((bg) => bg.id === setup.background)?.preview,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="preview-info">
              <div className="preview-identity">
                <span className="preview-role">你</span>
                <span className="preview-text">
                  {setup.userIdentity || '未设置身份'}
                </span>
              </div>
              <div className="preview-identity">
                <span className="preview-role">对方</span>
                <span className="preview-text">
                  {setup.companionIdentity || '未设置身份'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 你的设定模态框 */}
      {showUserModal && (
        <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">你的设定</h2>
              <button className="modal-close" onClick={() => setShowUserModal(false)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-field">
                <label className="modal-label">你的身份</label>
                <input
                  type="text"
                  className="modal-input"
                  placeholder="例如：学生、上班族、旅行者..."
                  value={tempUserIdentity}
                  onChange={(e) => setTempUserIdentity(e.target.value)}
                />
              </div>

              <div className="modal-field">
                <label className="modal-label">你的名字</label>
                <input
                  type="text"
                  className="modal-input"
                  placeholder="请输入你的名字..."
                  value={tempUserName}
                  onChange={(e) => setTempUserName(e.target.value)}
                />
              </div>

              <div className="modal-field">
                <label className="modal-label">你的故事</label>
                <textarea
                  className="modal-textarea"
                  placeholder="描述你的背景故事、性格特点等..."
                  value={tempUserStory}
                  onChange={(e) => setTempUserStory(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="modal-field">
                <label className="modal-label">背景情节设定</label>
                <textarea
                  className="modal-textarea"
                  placeholder="描述你们相遇的场景、故事背景等..."
                  value={tempBackgroundStory}
                  onChange={(e) => setTempBackgroundStory(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="modal-button cancel" onClick={() => setShowUserModal(false)}>
                取消
              </button>
              <button className="modal-button confirm" onClick={handleSaveUserSettings}>
                确定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 对方的设定模态框 */}
      {showCompanionModal && (
        <div className="modal-overlay" onClick={() => setShowCompanionModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">对方的设定</h2>
              <button className="modal-close" onClick={() => setShowCompanionModal(false)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-field">
                <label className="modal-label">对方的身份</label>
                <input
                  type="text"
                  className="modal-input"
                  placeholder="例如：好友、导师、知己..."
                  value={tempCompanionIdentity}
                  onChange={(e) => setTempCompanionIdentity(e.target.value)}
                />
              </div>

              <div className="modal-field">
                <label className="modal-label">对方的名字</label>
                <input
                  type="text"
                  className="modal-input"
                  placeholder="请输入对方的名字..."
                  value={tempCompanionName}
                  onChange={(e) => setTempCompanionName(e.target.value)}
                />
              </div>

              <div className="modal-field">
                <label className="modal-label">对方的故事</label>
                <textarea
                  className="modal-textarea"
                  placeholder="描述对方的背景故事、性格特点等..."
                  value={tempCompanionStory}
                  onChange={(e) => setTempCompanionStory(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="modal-field">
                <label className="modal-label">背景情节设定</label>
                <textarea
                  className="modal-textarea"
                  placeholder="描述你们相遇的场景、故事背景等..."
                  value={tempBackgroundStory}
                  onChange={(e) => setTempBackgroundStory(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="modal-button cancel" onClick={() => setShowCompanionModal(false)}>
                取消
              </button>
              <button className="modal-button confirm" onClick={handleSaveCompanionSettings}>
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomCompanionSetupPage;
