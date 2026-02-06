/**
 * 图案预览组件
 * 在卡片中显示图案轮廓预览
 */

import { useRef, useEffect } from "react";
import type { ColoringPattern } from "./coloringPatterns";

interface PatternPreviewProps {
  pattern: ColoringPattern;
  width?: number;
  height?: number;
}

const PatternPreview = ({ pattern, width = 300, height = 250 }: PatternPreviewProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 设置canvas尺寸
    canvas.width = width;
    canvas.height = height;

    // 清空画布
    ctx.clearRect(0, 0, width, height);

    // 设置白色背景
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, width, height);

    // 绘制图案轮廓
    pattern.drawOutline(ctx, width, height);
  }, [pattern, width, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
      }}
    />
  );
};

export default PatternPreview;
