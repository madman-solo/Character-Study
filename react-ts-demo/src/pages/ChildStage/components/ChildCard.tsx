import '../../../styles/ChildStageCss/ChildCard.css';

interface ChildCardProps {
  icon: string;
  title: string;
  description?: string;
  onClick?: () => void;
}

const ChildCard = ({ icon, title, description, onClick }: ChildCardProps) => {
  return (
    <div className="child-card" onClick={onClick}>
      <div className="child-card-icon">{icon}</div>
      <h3 className="child-card-title">{title}</h3>
      {description && (
        <p className="child-card-description">{description}</p>
      )}
    </div>
  );
};

export default ChildCard;
