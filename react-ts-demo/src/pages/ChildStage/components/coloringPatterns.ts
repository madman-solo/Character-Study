/**
 * 涂色图案配置
 * 定义各种简单物体的轮廓绘制函数
 */

export interface ColoringPattern {
  id: string;
  word: string;
  translation: string;
  phonetic: string;
  category: "fruit" | "animal" | "object" | "nature";
  difficulty: "easy" | "medium" | "hard";
  drawOutline: (ctx: CanvasRenderingContext2D, width: number, height: number) => void;
}

// 绘制苹果轮廓
const drawApple = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.25;

  // 设置绘制样式
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // 苹果主体（圆形）
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.stroke();

  // 苹果顶部凹陷
  ctx.beginPath();
  ctx.moveTo(centerX - radius * 0.2, centerY - radius);
  ctx.quadraticCurveTo(centerX, centerY - radius * 1.15, centerX + radius * 0.2, centerY - radius);
  ctx.stroke();

  // 苹果茎
  ctx.beginPath();
  ctx.moveTo(centerX, centerY - radius);
  ctx.lineTo(centerX, centerY - radius * 1.35);
  ctx.lineWidth = 3;
  ctx.stroke();

  // 叶子
  ctx.beginPath();
  ctx.lineWidth = 3;
  ctx.ellipse(centerX + radius * 0.2, centerY - radius * 1.3, radius * 0.2, radius * 0.3, Math.PI / 4, 0, Math.PI * 2);
  ctx.stroke();

  // 叶子纹理
  ctx.beginPath();
  ctx.moveTo(centerX + radius * 0.15, centerY - radius * 1.4);
  ctx.lineTo(centerX + radius * 0.25, centerY - radius * 1.2);
  ctx.lineWidth = 2;
  ctx.stroke();
};

// 绘制香蕉轮廓
const drawBanana = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  const centerX = width / 2;
  const centerY = height / 2;
  const size = Math.min(width, height) * 0.3;

  // 设置绘制样式
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // 香蕉外轮廓（弧形）
  ctx.beginPath();
  ctx.moveTo(centerX - size * 1.2, centerY - size * 0.5);
  ctx.bezierCurveTo(
    centerX - size * 0.8, centerY - size * 0.8,
    centerX + size * 0.5, centerY - size * 0.3,
    centerX + size * 1.3, centerY + size * 0.3
  );
  ctx.bezierCurveTo(
    centerX + size * 1.2, centerY + size * 0.6,
    centerX + size * 0.3, centerY + size * 0.5,
    centerX - size * 0.5, centerY + size * 0.2
  );
  ctx.bezierCurveTo(
    centerX - size * 0.9, centerY + size * 0.1,
    centerX - size * 1.1, centerY - size * 0.2,
    centerX - size * 1.2, centerY - size * 0.5
  );
  ctx.stroke();

  // 香蕉顶部茎
  ctx.beginPath();
  ctx.moveTo(centerX - size * 1.2, centerY - size * 0.5);
  ctx.lineTo(centerX - size * 1.3, centerY - size * 0.7);
  ctx.lineWidth = 3;
  ctx.stroke();

  // 香蕉底部茎
  ctx.beginPath();
  ctx.moveTo(centerX + size * 1.3, centerY + size * 0.3);
  ctx.lineTo(centerX + size * 1.4, centerY + size * 0.5);
  ctx.lineWidth = 3;
  ctx.stroke();
};

// 绘制猫咪轮廓
const drawCat = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  const centerX = width / 2;
  const centerY = height / 2;
  const size = Math.min(width, height) * 0.22;

  // 设置绘制样式
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // 头部（圆形）
  ctx.beginPath();
  ctx.arc(centerX, centerY, size, 0, Math.PI * 2);
  ctx.stroke();

  // 左耳
  ctx.beginPath();
  ctx.moveTo(centerX - size * 0.6, centerY - size * 0.6);
  ctx.lineTo(centerX - size * 0.9, centerY - size * 1.3);
  ctx.lineTo(centerX - size * 0.3, centerY - size * 0.85);
  ctx.closePath();
  ctx.stroke();

  // 右耳
  ctx.beginPath();
  ctx.moveTo(centerX + size * 0.6, centerY - size * 0.6);
  ctx.lineTo(centerX + size * 0.9, centerY - size * 1.3);
  ctx.lineTo(centerX + size * 0.3, centerY - size * 0.85);
  ctx.closePath();
  ctx.stroke();

  // 左眼
  ctx.beginPath();
  ctx.arc(centerX - size * 0.35, centerY - size * 0.2, size * 0.18, 0, Math.PI * 2);
  ctx.stroke();

  // 右眼
  ctx.beginPath();
  ctx.arc(centerX + size * 0.35, centerY - size * 0.2, size * 0.18, 0, Math.PI * 2);
  ctx.stroke();

  // 眼珠（左）
  ctx.beginPath();
  ctx.arc(centerX - size * 0.35, centerY - size * 0.2, size * 0.08, 0, Math.PI * 2);
  ctx.fillStyle = "#000000";
  ctx.fill();

  // 眼珠（右）
  ctx.beginPath();
  ctx.arc(centerX + size * 0.35, centerY - size * 0.2, size * 0.08, 0, Math.PI * 2);
  ctx.fill();

  // 鼻子
  ctx.beginPath();
  ctx.moveTo(centerX, centerY + size * 0.05);
  ctx.lineTo(centerX - size * 0.12, centerY + size * 0.2);
  ctx.lineTo(centerX + size * 0.12, centerY + size * 0.2);
  ctx.closePath();
  ctx.fillStyle = "#000000";
  ctx.fill();

  // 嘴巴（左）
  ctx.beginPath();
  ctx.moveTo(centerX, centerY + size * 0.2);
  ctx.quadraticCurveTo(centerX - size * 0.25, centerY + size * 0.4, centerX - size * 0.4, centerY + size * 0.35);
  ctx.lineWidth = 3;
  ctx.stroke();

  // 嘴巴（右）
  ctx.beginPath();
  ctx.moveTo(centerX, centerY + size * 0.2);
  ctx.quadraticCurveTo(centerX + size * 0.25, centerY + size * 0.4, centerX + size * 0.4, centerY + size * 0.35);
  ctx.stroke();

  // 胡须（左上）
  ctx.beginPath();
  ctx.moveTo(centerX - size * 0.7, centerY - size * 0.1);
  ctx.lineTo(centerX - size * 1.1, centerY - size * 0.2);
  ctx.lineWidth = 2;
  ctx.stroke();

  // 胡须（左中）
  ctx.beginPath();
  ctx.moveTo(centerX - size * 0.7, centerY + size * 0.1);
  ctx.lineTo(centerX - size * 1.15, centerY + size * 0.1);
  ctx.stroke();

  // 胡须（左下）
  ctx.beginPath();
  ctx.moveTo(centerX - size * 0.7, centerY + size * 0.3);
  ctx.lineTo(centerX - size * 1.1, centerY + size * 0.4);
  ctx.stroke();

  // 胡须（右上）
  ctx.beginPath();
  ctx.moveTo(centerX + size * 0.7, centerY - size * 0.1);
  ctx.lineTo(centerX + size * 1.1, centerY - size * 0.2);
  ctx.stroke();

  // 胡须（右中）
  ctx.beginPath();
  ctx.moveTo(centerX + size * 0.7, centerY + size * 0.1);
  ctx.lineTo(centerX + size * 1.15, centerY + size * 0.1);
  ctx.stroke();

  // 胡须（右下）
  ctx.beginPath();
  ctx.moveTo(centerX + size * 0.7, centerY + size * 0.3);
  ctx.lineTo(centerX + size * 1.1, centerY + size * 0.4);
  ctx.stroke();
};

// 绘制狗狗轮廓
const drawDog = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  const centerX = width / 2;
  const centerY = height / 2;
  const size = Math.min(width, height) * 0.22;

  // 设置绘制样式
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // 头部（椭圆）
  ctx.beginPath();
  ctx.ellipse(centerX, centerY, size * 1.1, size, 0, 0, Math.PI * 2);
  ctx.stroke();

  // 左耳（下垂）
  ctx.beginPath();
  ctx.ellipse(centerX - size * 0.8, centerY - size * 0.2, size * 0.35, size * 0.7, -Math.PI / 6, 0, Math.PI * 2);
  ctx.stroke();

  // 右耳（下垂）
  ctx.beginPath();
  ctx.ellipse(centerX + size * 0.8, centerY - size * 0.2, size * 0.35, size * 0.7, Math.PI / 6, 0, Math.PI * 2);
  ctx.stroke();

  // 左眼
  ctx.beginPath();
  ctx.arc(centerX - size * 0.4, centerY - size * 0.25, size * 0.18, 0, Math.PI * 2);
  ctx.stroke();

  // 右眼
  ctx.beginPath();
  ctx.arc(centerX + size * 0.4, centerY - size * 0.25, size * 0.18, 0, Math.PI * 2);
  ctx.stroke();

  // 眼珠（左）
  ctx.beginPath();
  ctx.arc(centerX - size * 0.4, centerY - size * 0.25, size * 0.08, 0, Math.PI * 2);
  ctx.fillStyle = "#000000";
  ctx.fill();

  // 眼珠（右）
  ctx.beginPath();
  ctx.arc(centerX + size * 0.4, centerY - size * 0.25, size * 0.08, 0, Math.PI * 2);
  ctx.fill();

  // 鼻子（大圆）
  ctx.beginPath();
  ctx.arc(centerX, centerY + size * 0.25, size * 0.25, 0, Math.PI * 2);
  ctx.fillStyle = "#000000";
  ctx.fill();

  // 鼻孔（左）
  ctx.beginPath();
  ctx.arc(centerX - size * 0.1, centerY + size * 0.25, size * 0.06, 0, Math.PI * 2);
  ctx.fillStyle = "#FFFFFF";
  ctx.fill();

  // 鼻孔（右）
  ctx.beginPath();
  ctx.arc(centerX + size * 0.1, centerY + size * 0.25, size * 0.06, 0, Math.PI * 2);
  ctx.fill();

  // 嘴巴（左）
  ctx.beginPath();
  ctx.moveTo(centerX, centerY + size * 0.5);
  ctx.quadraticCurveTo(centerX - size * 0.35, centerY + size * 0.75, centerX - size * 0.5, centerY + size * 0.65);
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 3;
  ctx.stroke();

  // 嘴巴（右）
  ctx.beginPath();
  ctx.moveTo(centerX, centerY + size * 0.5);
  ctx.quadraticCurveTo(centerX + size * 0.35, centerY + size * 0.75, centerX + size * 0.5, centerY + size * 0.65);
  ctx.stroke();

  // 舌头
  ctx.beginPath();
  ctx.ellipse(centerX, centerY + size * 0.8, size * 0.2, size * 0.15, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#FF6B9D";
  ctx.fill();
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 2;
  ctx.stroke();
};

// 图案配置列表
export const coloringPatterns: ColoringPattern[] = [
  {
    id: "apple",
    word: "apple",
    translation: "苹果",
    phonetic: "/ˈæpl/",
    category: "fruit",
    difficulty: "easy",
    drawOutline: drawApple,
  },
  {
    id: "banana",
    word: "banana",
    translation: "香蕉",
    phonetic: "/bəˈnænə/",
    category: "fruit",
    difficulty: "easy",
    drawOutline: drawBanana,
  },
  {
    id: "cat",
    word: "cat",
    translation: "猫",
    phonetic: "/kæt/",
    category: "animal",
    difficulty: "medium",
    drawOutline: drawCat,
  },
  {
    id: "dog",
    word: "dog",
    translation: "狗",
    phonetic: "/dɔːɡ/",
    category: "animal",
    difficulty: "medium",
    drawOutline: drawDog,
  },
];
