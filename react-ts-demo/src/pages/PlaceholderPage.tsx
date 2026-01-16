import { useNavigate } from 'react-router-dom';
import '../styles/PlaceholderPage.css';

interface PlaceholderPageProps {
  title: string;
  icon: string;
  description?: string;
}

const PlaceholderPage = ({ title, icon, description }: PlaceholderPageProps) => {
  const navigate = useNavigate();

  return (
    <div className="placeholder-page">
      <div className="placeholder-container">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← 返回
        </button>

        <div className="placeholder-content">
          <div className="placeholder-icon">{icon}</div>
          <h1 className="placeholder-title">{title}</h1>
          <p className="placeholder-description">
            {description || '该功能正在开发中，敬请期待...'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PlaceholderPage;
