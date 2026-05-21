import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useEyeCare } from "../contexts/EyeCareContext";
import "../styles/ProfileSidebar.css";

interface ProfileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileSidebar = ({ isOpen, onClose }: ProfileSidebarProps) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { isEyeCareMode, toggleEyeCareMode } = useEyeCare();

  const menuItems = [
    {
      id: "settings",
      label: "设置",
      icon: "/src/assets/iconfont/设置.svg",
      path: "/settings",
    },
    {
      id: "study-time",
      label: "学习时长",
      icon: "/src/assets/iconfont/闹钟.svg",
      path: "/study-time",
    },
    {
      id: "my-characters",
      label: "我的角色",
      icon: "/src/assets/iconfont/已加好友.svg",
      path: "/my-characters",
    },
    {
      id: "favorites",
      label: "我的收藏",
      icon: "/src/assets/iconfont/收藏.svg",
      path: "/favorites",
    },
    {
      id: "help",
      label: "帮助与反馈",
      icon: "/src/assets/iconfont/帮助.svg",
      path: "/help",
    },
    {
      id: "share",
      label: "分享好友",
      icon: "/src/assets/iconfont/分享.svg",
      path: "/share",
    },
  ];

  const handleMenuClick = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleEyeCareToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleEyeCareMode();
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
    onClose();
  };

  return (
    <>
      <div className={`sidebar-overlay${isOpen ? " visible" : ""}`} onClick={onClose} role="button" tabIndex={0} aria-label="关闭侧边栏" onKeyDown={(e) => e.key === 'Enter' && onClose()}></div>
      <div className={`profile-sidebar${isOpen ? " open" : ""}`}>
        <div className="sidebar-header">
          <button className="close-button" onClick={onClose} aria-label="关闭侧边栏">
            <span aria-hidden="true">✕</span>
          </button>
        </div>

        <div className="user-profile">
          <div className="user-avatar">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} />
            ) : (
              <div className="avatar-placeholder">
                {user?.name?.charAt(0) || "?"}
              </div>
            )}
          </div>
          <div className="user-name">{user?.name || "未登录"}</div>
        </div>

        <div className="sidebar-menu">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className="menu-item"
              onClick={() => handleMenuClick(item.path)}
            >
              <span className="menu-icon">
                <img src={item.icon} alt={item.label} width={24} height={24} />
              </span>
              <span className="menu-label">{item.label}</span>
              <span className="menu-arrow">›</span>
            </button>
          ))}

          {/* 护眼模式切换 */}
          <button
            className={`menu-item eye-care-toggle ${isEyeCareMode ? "active" : ""}`}
            onClick={handleEyeCareToggle}
            aria-pressed={isEyeCareMode}
          >
            <span className="menu-icon">
              <img
                src="/src/assets/iconfont/护眼.svg"
                alt="护眼"
                width={24}
                height={24}
              />
            </span>
            <span className="menu-label">护眼模式</span>
            <div className="toggle-switch">
              <div
                className={`toggle-slider ${isEyeCareMode ? "active" : ""}`}
              ></div>
            </div>
          </button>
        </div>

        <div className="sidebar-footer">
          {isAuthenticated && user && !user.isGuest ? (
            <button className="logout-button" onClick={handleLogout}>
              退出登录
            </button>
          ) : (
            <button
              className="logout-button"
              onClick={() => {
                navigate("/login");
                onClose();
              }}
            >
              登录
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default ProfileSidebar;
