/**
 * 特色教材页面
 * 精选英语教材
 */

import { useNavigate } from "react-router-dom";
import "../../../styles/ChildStageCss/SpecialMaterialsPage.css";

interface Material {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: string;
  items: number;
}

const SpecialMaterialsPage = () => {
  const navigate = useNavigate();

  const materials: Material[] = [
    {
      id: "1",
      title: "牛津阅读树",
      description: "经典分级阅读教材",
      icon: "🌳",
      type: "阅读",
      items: 200,
    },
    {
      id: "2",
      title: "剑桥少儿英语",
      description: "权威少儿英语教材",
      icon: "🎓",
      type: "综合",
      items: 150,
    },
    {
      id: "3",
      title: "新概念英语",
      description: "经典英语学习教材",
      icon: "📘",
      type: "综合",
      items: 144,
    },
    {
      id: "4",
      title: "朗文英语",
      description: "国际化英语教材",
      icon: "📗",
      type: "综合",
      items: 180,
    },
    {
      id: "5",
      title: "自然拼读教材",
      description: "系统学习拼读规则",
      icon: "🔤",
      type: "拼读",
      items: 100,
    },
    {
      id: "6",
      title: "英语绘本精选",
      description: "精美英文绘本合集",
      icon: "📚",
      type: "阅读",
      items: 300,
    },
    {
      id: "7",
      title: "英语儿歌集",
      description: "经典英文儿歌大全",
      icon: "🎵",
      type: "听力",
      items: 250,
    },
    {
      id: "8",
      title: "互动练习册",
      description: "趣味英语练习题",
      icon: "✏️",
      type: "练习",
      items: 500,
    },
  ];

  const handleBack = () => {
    navigate("/child-english-home");
  };

  const handleMaterialClick = (material: Material) => {
    alert(`教材: ${material.title}\n${material.description}\n功能开发中...`);
  };

  return (
    <div className="special-materials-page">
      <div className="special-materials-header">
        <button className="back-btn" onClick={handleBack}>
          ← 返回
        </button>
        <h1 className="page-title">📖 特色教材</h1>
        <div className="header-spacer"></div>
      </div>

      <div className="special-materials-intro">
        <p>精选国内外优质英语教材，系统化学习！</p>
      </div>

      <div className="special-materials-grid">
        {materials.map((material) => (
          <div
            key={material.id}
            className="material-card"
            onClick={() => handleMaterialClick(material)}
          >
            <div className="material-icon">{material.icon}</div>
            <div className="material-info">
              <h3 className="material-title">{material.title}</h3>
              <p className="material-description">{material.description}</p>
              <div className="material-meta">
                <span className="material-type">{material.type}</span>
                <span>📄 {material.items} 项</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpecialMaterialsPage;
