import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/ProfileSidebar.css';

interface ProfileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileSidebar = ({ isOpen, onClose }: ProfileSidebarProps) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const menuItems = [
    { id: 'settings', label: '设置', icon: '⚙️', path: '/settings' },
    { id: 'friends', label: '我的好友', icon: '👥', path: '/friends' },
    { id: 'study-time', label: '学习时长', icon: '⏱️', path: '/study-time' },
    { id: 'my-characters', label: '我的角色', icon: '🎭', path: '/my-characters' },
    { id: 'games', label: '益智小游戏', icon: '🎮', path: '/games' },
    { id: 'notes', label: '我的笔记', icon: '📝', path: '/notes' },
    { id: 'favorites', label: '我的收藏', icon: '⭐', path: '/favorites' },
    { id: 'eye-care', label: '护眼模式', icon: '👁️', path: '/eye-care' },
    { id: 'help', label: '帮助与反馈', icon: '❓', path: '/help' },
    { id: 'share', label: '分享好友', icon: '📤', path: '/share' },
  ];

  const handleMenuClick = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="sidebar-overlay" onClick={onClose}></div>
      <div className={`profile-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="user-profile">
          <div className="user-avatar">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} />
            ) : (
              <div className="avatar-placeholder">
                {user?.name?.charAt(0) || '?'}
              </div>
            )}
          </div>
          <div className="user-name">{user?.name || '未登录'}</div>
        </div>

        <div className="sidebar-menu">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className="menu-item"
              onClick={() => handleMenuClick(item.path)}
            >
              <span className="menu-icon">{item.icon}</span>
              <span className="menu-label">{item.label}</span>
              <span className="menu-arrow">›</span>
            </div>
          ))}
        </div>

        {isAuthenticated && (
          <div className="sidebar-footer">
            <button className="logout-button" onClick={handleLogout}>
              退出登录
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default ProfileSidebar;
