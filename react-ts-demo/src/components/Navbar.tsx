import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Navbar.css';

interface NavbarProps {
  onScenarioClick: () => void;
  onVocabularyClick?: () => void;
  onProfileClick?: () => void;
  selectedScenario?: string;
  selectedVocabulary?: string;
  showVocabularyButton?: boolean;
}

const Navbar = ({
  onScenarioClick,
  onVocabularyClick,
  onProfileClick,
  selectedScenario,
  selectedVocabulary,
  showVocabularyButton = false
}: NavbarProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          角色互动
        </Link>

        <button
          className="mobile-menu-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <ul className={`navbar-menu ${isMobileMenuOpen ? 'active' : ''}`}>
          <li>
            <Link
              to="/"
              className={isActive('/') ? 'active' : ''}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              角色预览
            </Link>
          </li>
          <li>
            <Link
              to="/characters"
              className={isActive('/characters') ? 'active' : ''}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              在线角色
            </Link>
          </li>
          <li>
            <button
              className={`scenario-btn ${selectedScenario ? 'selected' : ''}`}
              onClick={() => {
                onScenarioClick();
                setIsMobileMenuOpen(false);
              }}
            >
              {selectedScenario || '情景模式'}
            </button>
          </li>
          {showVocabularyButton && (
            <li>
              <button
                className={`vocabulary-btn ${selectedVocabulary ? 'selected' : ''}`}
                onClick={() => {
                  onVocabularyClick?.();
                  setIsMobileMenuOpen(false);
                }}
              >
                {selectedVocabulary || '单词本'}
              </button>
            </li>
          )}
          <li>
            <button
              className="profile-btn"
              onClick={() => {
                onProfileClick?.();
                setIsMobileMenuOpen(false);
              }}
            >
              我的
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
