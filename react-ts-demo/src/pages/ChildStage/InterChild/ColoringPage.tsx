/**
 * 趣味涂色页面
 * 边涂色边学单词
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../../styles/ChildStageCss/ColoringPage.css";
import CanvasColoring from "../components/CanvasColoring";
import PatternPreview from "../components/PatternPreview";
import { coloringPatterns } from "../components/coloringPatterns";

interface ColoringImage {
  id: string;
  title: string;
  word: string;
  translation: string;
  difficulty: "easy" | "medium" | "hard";
}

const ColoringPage = () => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<ColoringImage | null>(
    null,
  );
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  void selectedCategory;
  void setSelectedCategory;

  // 使用图案配置生成涂色图片列表
  const coloringImages: ColoringImage[] = coloringPatterns.map((pattern) => ({
    id: pattern.id,
    title: pattern.translation,
    word: pattern.word,
    translation: pattern.translation,
    difficulty: pattern.difficulty,
  }));

  const handleBack = () => {
    navigate("/child-english-home");
  };

  const handleImageSelect = (image: ColoringImage) => {
    setSelectedImage(image);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "#44a047";
      case "medium":
        return "#f1b457";
      case "hard":
        return "#ad3830";
      default:
        return "#999";
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "简单";
      case "medium":
        return "中等";
      case "hard":
        return "困难";
      default:
        return "";
    }
  };

  return (
    <div className="coloring-page">
      {/* 顶部导航 */}
      <div className="coloring-header">
        <button
          className="back-btn"
          onClick={handleBack}
          role="button"
          aria-label="返回上一页"
        >
          ← 返回
        </button>
        <h1 className="page-title" role="heading">
          🎨 趣味涂色
        </h1>
        <div className="header-spacer"></div>
      </div>

      {/* 说明 */}
      <div className="coloring-intro" role="region" aria-label="涂色说明">
        <p>选择一张图片开始涂色，边玩边学英语单词！</p>
      </div>

      {/* 涂色图片网格 */}
      <div
        className="coloring-grid"
        role="list"
        aria-label="可选择的涂色图片列表"
      >
        {coloringImages.map((image) => (
          <div
            key={image.id}
            className="coloring-card"
            role="listitem"
            tabIndex={0}
            aria-label={`${image.word}（${image.translation}），难度：${image.difficulty === 'easy' ? '简单' : image.difficulty === 'medium' ? '中等' : '困难'}`}
            onClick={() => handleImageSelect(image)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), handleImageSelect(image))}
          >
            <div className="coloring-image">
              <PatternPreview
                pattern={coloringPatterns.find((p) => p.id === image.id)!}
                width={300}
                height={250}
              />
              <div
                className="difficulty-badge"
                style={{ background: getDifficultyColor(image.difficulty) }}
              >
                {getDifficultyText(image.difficulty)}
              </div>
            </div>
            <div className="coloring-info">
              <h3 className="coloring-word">{image.word}</h3>
              <p className="coloring-translation">{image.translation}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Canvas 涂色组件 */}
      {selectedImage && (
        <CanvasColoring
          role="region"
          aria-label="涂色画布，使用方向键移动画笔，空格键切换颜色"
          width={800}
          height={600}
          pattern={coloringPatterns.find((p) => p.id === selectedImage.id)}
          word={selectedImage.word}
          translation={selectedImage.translation}
          phonetic={
            coloringPatterns.find((p) => p.id === selectedImage.id)?.phonetic
          }
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
};

export default ColoringPage;
