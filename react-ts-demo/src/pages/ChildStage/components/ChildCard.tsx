import "../../../styles/ChildStageCss/ChildCard.css";

interface ChildCardProps {
  icon: string;
  title: string;
  description?: string;
  onClick?: () => void;
}

const ChildCard = ({ icon, title, description, onClick }: ChildCardProps) => {
  return (
    <button className="child-card" onClick={onClick}>
      <div className="child-card-icon">
        <img src={icon} width={36} height={36} aria-hidden="true" alt={title} />
      </div>
      <h3 className="child-card-title">{title}</h3>
      {description && <p className="child-card-description">{description}</p>}
    </button>
  );
};

export default ChildCard;
