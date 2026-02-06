/**
 * 美食英语页面
 * 食物相关英语
 */

import { useNavigate } from "react-router-dom";
import "../../../styles/ChildStageCss/FoodEnglishPage.css";

interface FoodCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  items: number;
}

const FoodEnglishPage = () => {
  const navigate = useNavigate();

  const categories: FoodCategory[] = [
    {
      id: "1",
      title: "水果蔬菜",
      description: "各种水果和蔬菜的英文",
      icon: "🍎",
      items: 40,
    },
    {
      id: "2",
      title: "肉类海鲜",
      description: "肉类和海鲜的英语",
      icon: "🍖",
      items: 30,
    },
    {
      id: "3",
      title: "主食谷物",
      description: "米饭面条等主食英语",
      icon: "🍚",
      items: 25,
    },
    {
      id: "4",
      title: "饮料甜品",
      description: "饮料和甜点的英文",
      icon: "🍰",
      items: 35,
    },
    {
      id: "5",
      title: "快餐小吃",
      description: "快餐和零食英语",
      icon: "🍔",
      items: 32,
    },
    {
      id: "6",
      title: "调味料",
      description: "各种调味品的英文",
      icon: "🧂",
      items: 20,
    },
    {
      id: "7",
      title: "餐具厨具",
      description: "餐具和厨房用具英语",
      icon: "🍴",
      items: 28,
    },
    {
      id: "8",
      title: "烹饪方法",
      description: "烹饪技巧和方法英语",
      icon: "👨‍🍳",
      items: 24,
    },
  ];

  const handleBack = () => {
    navigate("/child-english-home");
  };

  const handleCategoryClick = (category: FoodCategory) => {
    alert(`分类: ${category.title}\n${category.description}\n功能开发中...`);
  };

  return (
    <div className="food-english-page">
      <div className="food-english-header">
        <button className="back-btn" onClick={handleBack}>
          ← 返回
        </button>
        <h1 className="page-title">🍕 美食英语</h1>
        <div className="header-spacer"></div>
      </div>

      <div className="food-english-intro">
        <p>学习美食相关英语，享受美味的同时学英语！</p>
      </div>

      <div className="food-english-grid">
        {categories.map((category) => (
          <div
            key={category.id}
            className="food-category-card"
            onClick={() => handleCategoryClick(category)}
          >
            <div className="food-category-icon">{category.icon}</div>
            <div className="food-category-info">
              <h3 className="food-category-title">{category.title}</h3>
              <p className="food-category-description">
                {category.description}
              </p>
              <p className="food-category-items">🍽️ {category.items} 个词汇</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FoodEnglishPage;
