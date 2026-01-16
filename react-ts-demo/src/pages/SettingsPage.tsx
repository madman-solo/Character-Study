import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "../styles/SettingsPage.css";

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    gender: user?.gender || "未设置",
    bio: user?.bio || "",
    avatar: user?.avatar || "",
  });

  const handleSave = () => {
    updateUser(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      gender: user?.gender || "未设置",
      bio: user?.bio || "",
      avatar: user?.avatar || "",
    });
    setIsEditing(false);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 检查文件类型
      if (!file.type.startsWith("image/")) {
        alert("请选择图片文件");
        return;
      }

      // 检查文件大小（限制为5MB）
      if (file.size > 5 * 1024 * 1024) {
        alert("图片大小不能超过5MB");
        return;
      }

      // 读取文件并转换为Base64
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target?.result as string;
        setFormData({ ...formData, avatar: base64String });
        // 自动保存头像，无需等待编辑模式
        updateUser({ avatar: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-container">
        <div className="settings-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            ← 返回
          </button>
          {/* <h1>个人设置</h1> */}
        </div>

        <div className="settings-content">
          <div className="settings-section">
            <h2>基本信息</h2>

            <div className="setting-item">
              <label>头像</label>
              <div className="avatar-setting">
                <div
                  className="avatar-preview clickable"
                  onClick={handleAvatarClick}
                  title="点击上传头像"
                >
                  {formData.avatar ? (
                    <img src={formData.avatar} alt="头像" />
                  ) : (
                    <div className="avatar-placeholder">
                      {formData.name?.charAt(0) || "?"}
                    </div>
                  )}
                  <div className="avatar-overlay">
                    <span className="upload-icon">📷</span>
                    <span className="upload-text">点击上传</span>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
                <div className="avatar-hint">
                  <p>支持 JPG、PNG、GIF 格式</p>
                  <p>文件大小不超过 5MB</p>
                </div>
              </div>
            </div>

            <div className="setting-item">
              <label>用户名</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="setting-input"
                />
              ) : (
                <div className="setting-value">{formData.name}</div>
              )}
            </div>

            <div className="setting-item">
              <label>性别</label>
              {isEditing ? (
                <select
                  value={formData.gender}
                  onChange={(e) =>
                    setFormData({ ...formData, gender: e.target.value })
                  }
                  className="setting-select"
                >
                  <option value="未设置">未设置</option>
                  <option value="男">男</option>
                  <option value="女">女</option>
                  <option value="其他">其他</option>
                </select>
              ) : (
                <div className="setting-value">{formData.gender}</div>
              )}
            </div>

            <div className="setting-item">
              <label>账号ID</label>
              <div className="setting-value">{user?.id || "未登录"}</div>
            </div>

            <div className="setting-item">
              <label>个人说明</label>
              {isEditing ? (
                <textarea
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  className="setting-textarea"
                  rows={4}
                  placeholder="介绍一下自己吧~"
                />
              ) : (
                <div className="setting-value">
                  {formData.bio || "这个人很懒，什么都没写~"}
                </div>
              )}
            </div>
          </div>

          <div className="settings-section">
            <h2>账号安全</h2>

            <div className="setting-item">
              <label>密码</label>
              <div className="setting-value">
                ••••••••
                {isEditing && (
                  <button className="change-password-btn">修改密码</button>
                )}
              </div>
            </div>
          </div>

          <div className="settings-actions">
            {isEditing ? (
              <>
                <button className="save-button" onClick={handleSave}>
                  保存
                </button>
                <button className="cancel-button" onClick={handleCancel}>
                  取消
                </button>
              </>
            ) : (
              <button
                className="edit-button"
                onClick={() => setIsEditing(true)}
              >
                编辑资料
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
