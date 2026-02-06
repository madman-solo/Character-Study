/**
 * Canvas 涂色组件
 * 支持鼠标和触摸绘制，适配移动端
 */

import { useRef, useEffect, useState, useCallback } from "react";
import "./CanvasColoring.css";
import type { ColoringPattern } from "./coloringPatterns";
import { playWordAudio } from "../../../services/audioService";
import { useChildSound } from "../../../hooks/useChildSound";

interface CanvasColoringProps {
  pattern?: ColoringPattern;
  imageUrl?: string;
  word: string;
  translation: string;
  phonetic?: string;
  onClose: () => void;
}

interface Point {
  x: number;
  y: number;
}

const CanvasColoring = ({
  pattern,
  imageUrl,
  word,
  translation,
  phonetic,
  onClose,
}: CanvasColoringProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const backgroundCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState("#FF6B6B");
  const [brushSize, setBrushSize] = useState(20);
  const [showWordHint, setShowWordHint] = useState(true);
  const [cursorPosition, setCursorPosition] = useState<Point | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState("");
  const [showControls, setShowControls] = useState(false); // 控制面板显示状态（默认收起）
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [showFailAnimation, setShowFailAnimation] = useState(false);

  // 音效管理
  const { playCorrectSound, playWrongSound } = useChildSound();

  // 发音功能（使用百度翻译 API）
  const playPronunciation = useCallback(async () => {
    try {
      await playWordAudio(word, { lang: 'en', speed: 4 });
    } catch (error) {
      console.error('播放发音失败:', error);
      alert('发音播放失败，请检查网络连接');
    }
  }, [word]);

  // 检查涂色完成度
  const checkColoringProgress = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return 0;

    const ctx = canvas.getContext("2d");
    if (!ctx) return 0;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let coloredPixels = 0;

    // 检查有多少像素被涂色
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] > 0) {
        coloredPixels++;
      }
    }

    const totalPixels = canvas.width * canvas.height;
    return (coloredPixels / totalPixels) * 100;
  }, []);

  // 触发单词问答
  const triggerQuiz = useCallback(() => {
    setShowQuiz(true);
    setQuizAnswer("");
  }, []);

  // 提交问答答案
  const submitQuizAnswer = useCallback(() => {
    if (quizAnswer.toLowerCase().trim() === word.toLowerCase()) {
      // 答对了
      playCorrectSound();
      setShowSuccessAnimation(true);
      setTimeout(() => {
        alert(`🎉 答对了！${word} 就是 ${translation}！`);
        setShowQuiz(false);
        setShowSuccessAnimation(false);
      }, 500);
    } else {
      // 答错了
      playWrongSound();
      setShowFailAnimation(true);
      setTimeout(() => {
        alert(`❌ 再想想哦～提示：${translation}`);
        setShowFailAnimation(false);
      }, 500);
    }
  }, [quizAnswer, word, translation, playCorrectSound, playWrongSound]);

  // 常用颜色快捷选择（符合配色方案）
  const quickColors = [
    "#F7E14D", // 主色调黄色
    "#0D3869", // 辅助色深蓝
    "#D2D4D3", // 辅助色灰色
    "#000000", // 黑色
    "#FFFFFF", // 白色
    "#FF6B6B", // 红色
    "#4ECDC4", // 青色
    "#4CAF50", // 绿色
    "#FF9800", // 橙色
    "#C77DFF", // 紫色
    "#795548", // 棕色
    "#FFB6C1", // 粉色
  ];

  // 画笔大小选项
  const brushSizes = [10, 20, 30, 40];

  // 加载背景图片或绘制图案轮廓
  const loadBackgroundImage = useCallback(() => {
    const backgroundCanvas = backgroundCanvasRef.current;
    if (!backgroundCanvas) return;

    const ctx = backgroundCanvas.getContext("2d");
    if (!ctx) return;

    // 清空画布
    ctx.clearRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);

    console.log('🎨 Canvas尺寸:', backgroundCanvas.width, 'x', backgroundCanvas.height);
    console.log('🎨 Pattern:', pattern);

    // 如果有图案配置，绘制图案轮廓
    if (pattern) {
      console.log('✅ 开始绘制图案:', pattern.word);

      // 设置白色背景
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);

      // 绘制图案轮廓
      pattern.drawOutline(ctx, backgroundCanvas.width, backgroundCanvas.height);

      console.log('✅ 图案绘制完成');
    }
    // 否则加载图片
    else if (imageUrl) {
      console.log('📷 加载图片:', imageUrl);
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        // 绘制背景图片
        const scale = Math.min(
          backgroundCanvas.width / img.width,
          backgroundCanvas.height / img.height
        );
        const x = (backgroundCanvas.width - img.width * scale) / 2;
        const y = (backgroundCanvas.height - img.height * scale) / 2;

        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

        // 添加涂色轮廓效果
        ctx.globalCompositeOperation = "multiply";
        ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
        ctx.fillRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);
        ctx.globalCompositeOperation = "source-over";
      };
      img.src = imageUrl;
    } else {
      console.warn('⚠️ 没有pattern也没有imageUrl');
    }
  }, [pattern, imageUrl]);

  // Canvas 初始化
  useEffect(() => {
    const canvas = canvasRef.current;
    const backgroundCanvas = backgroundCanvasRef.current;
    if (!canvas || !backgroundCanvas) return;

    // 设置 Canvas 尺寸
    const setCanvasSize = () => {
      const container = canvas.parentElement;
      if (!container) {
        console.warn('⚠️ Canvas 容器不存在');
        return;
      }

      console.log('📏 容器尺寸:', container.clientWidth, 'x', container.clientHeight);

      // 使用容器的实际尺寸，不限制最大值
      const width = container.clientWidth - 40; // 减去padding
      const height = container.clientHeight - 40;

      console.log('📏 计算后的Canvas尺寸:', width, 'x', height);

      canvas.width = width;
      canvas.height = height;
      backgroundCanvas.width = width;
      backgroundCanvas.height = height;

      // 加载背景图片或绘制图案
      loadBackgroundImage();
    };

    setCanvasSize();
    window.addEventListener("resize", setCanvasSize);

    return () => {
      window.removeEventListener("resize", setCanvasSize);
    };
  }, [loadBackgroundImage]);

  // 获取鼠标/触摸位置
  const getPosition = useCallback((e: MouseEvent | TouchEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }, []);

  // 绘制函数（优化为圆角画笔）
  const draw = useCallback(
    (x: number, y: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = currentColor;
      ctx.lineCap = "round"; // 圆角画笔
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
      ctx.fill();
    },
    [currentColor, brushSize]
  );

  // 开始绘制
  const startDrawing = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      setIsDrawing(true);
      const pos = getPosition(e.nativeEvent as MouseEvent | TouchEvent);
      draw(pos.x, pos.y);
    },
    [getPosition, draw]
  );

  // 绘制中
  const onDrawing = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawing) {
        // 更新光标位置
        const pos = getPosition(e.nativeEvent as MouseEvent | TouchEvent);
        setCursorPosition(pos);
        return;
      }

      e.preventDefault();
      const pos = getPosition(e.nativeEvent as MouseEvent | TouchEvent);
      draw(pos.x, pos.y);
      setCursorPosition(pos);
    },
    [isDrawing, getPosition, draw]
  );

  // 停止绘制
  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
  }, []);

  // 鼠标离开画布
  const handleMouseLeave = useCallback(() => {
    setIsDrawing(false);
    setCursorPosition(null);
  }, []);

  // 清空画布
  const handleClear = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  // 重置画布（清空并重新加载背景）
  const handleReset = useCallback(() => {
    handleClear();
    loadBackgroundImage();
  }, [handleClear, loadBackgroundImage]);

  // 保存作品
  const handleSave = useCallback(() => {
    const canvas = canvasRef.current;
    const backgroundCanvas = backgroundCanvasRef.current;
    if (!canvas || !backgroundCanvas) return;

    // 创建临时画布合并两层
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;

    // 绘制背景层
    tempCtx.drawImage(backgroundCanvas, 0, 0);
    // 绘制涂色层
    tempCtx.drawImage(canvas, 0, 0);

    // 下载图片
    const link = document.createElement("a");
    link.download = `coloring-${word}-${Date.now()}.png`;
    link.href = tempCanvas.toDataURL();
    link.click();

    // 显示保存成功提示
    alert(`🎉 作品已保存！单词：${word} (${translation})`);
  }, [word, translation]);

  return (
    <div className="canvas-coloring-container">
      {/* 顶部工具栏 */}
      <div className="canvas-toolbar">
        <button className="close-btn" onClick={onClose} title="关闭涂色板，返回上一页">
          ✕ 关闭
        </button>
        <div className="word-display">
          <div className="word-info">
            <span className="word-english">{word}</span>
            {phonetic && <span className="word-phonetic">{phonetic}</span>}
            <span className="word-chinese">{translation}</span>
          </div>
          <button className="pronunciation-btn" onClick={playPronunciation} title="播放发音">
            🔊 发音
          </button>
        </div>
        <div className="toolbar-spacer"></div>
      </div>

      {/* Canvas 画布区域 */}
      <div className="canvas-wrapper">
        <canvas
          ref={backgroundCanvasRef}
          className="background-canvas"
        />
        <canvas
          ref={canvasRef}
          className="drawing-canvas"
          onMouseDown={startDrawing}
          onMouseMove={onDrawing}
          onMouseUp={stopDrawing}
          onMouseLeave={handleMouseLeave}
          onTouchStart={startDrawing}
          onTouchMove={onDrawing}
          onTouchEnd={stopDrawing}
        />

        {/* 画笔跟随光标 */}
        {cursorPosition && (
          <div
            className="brush-cursor"
            style={{
              left: cursorPosition.x,
              top: cursorPosition.y,
              width: brushSize,
              height: brushSize,
              backgroundColor: currentColor,
            }}
          />
        )}
      </div>

      {/* 底部控制面板 */}
      <div className={`canvas-controls ${showControls ? 'expanded' : 'collapsed'}`}>
        {/* 切换按钮 */}
        <button
          className="controls-toggle-btn"
          onClick={() => setShowControls(!showControls)}
          title={showControls ? "收起控制面板" : "展开控制面板"}
        >
          {showControls ? '▼ 收起工具栏' : '▲ 展开工具栏'}
        </button>

        {/* 控制面板内容 */}
        {showControls && (
          <div className="controls-content">
            {/* 颜色选择 - 快捷色卡 + 取色器 */}
            <div className="control-section">
              <h3 className="control-title">🎨 选择颜色</h3>
              <div className="color-palette">
                {quickColors.map((color) => (
                  <button
                    key={color}
                    className={`color-option ${currentColor === color ? "active" : ""}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setCurrentColor(color)}
                    title={`选择颜色: ${color}`}
                    aria-label={`选择颜色 ${color}`}
                  />
                ))}
              </div>
              <div className="color-picker-wrapper">
                <label htmlFor="color-picker" className="color-picker-label">
                  🌈 自定义颜色
                </label>
                <input
                  id="color-picker"
                  type="color"
                  className="color-picker-input"
                  value={currentColor}
                  onChange={(e) => setCurrentColor(e.target.value)}
                  title="选择任意颜色"
                />
              </div>
            </div>

            {/* 画笔大小 */}
            <div className="control-section">
              <h3 className="control-title">✏️ 画笔</h3>
              <div className="brush-size-options">
                {brushSizes.map((size) => (
                  <button
                    key={size}
                    className={`brush-size-btn ${brushSize === size ? "active" : ""}`}
                    onClick={() => setBrushSize(size)}
                    title={`画笔大小: ${size}px`}
                    aria-label={`选择画笔大小 ${size}像素`}
                  >
                    <div
                      className="brush-preview"
                      style={{
                        width: size / 2,
                        height: size / 2,
                        backgroundColor: currentColor,
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="control-section">
              <h3 className="control-title">🛠️ 操作</h3>
              <div className="action-buttons">
                <button className="action-btn clear-btn" onClick={handleClear} title="清空所有涂色内容">
                  🗑️ 清空
                </button>
                <button className="action-btn reset-btn" onClick={handleReset} title="重置画布，恢复原始轮廓">
                  🔄 重置
                </button>
                <button className="action-btn save-btn" onClick={handleSave} title="保存你的涂色作品">
                  💾 保存
                </button>
                <button className="action-btn quiz-btn" onClick={triggerQuiz} title="测试一下你记住这个单词了吗">
                  ❓ 问答
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 单词问答模态框 */}
      {showQuiz && (
        <div className={`quiz-modal ${showSuccessAnimation ? 'success' : ''} ${showFailAnimation ? 'fail' : ''}`}>
          <div className="quiz-content">
            <h2 className="quiz-title">🎯 单词小测试</h2>
            <p className="quiz-question">这个图案的英文单词是什么？</p>
            <p className="quiz-hint">提示：{translation}</p>
            <input
              type="text"
              className="quiz-input"
              value={quizAnswer}
              onChange={(e) => setQuizAnswer(e.target.value)}
              placeholder="请输入英文单词"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  submitQuizAnswer();
                }
              }}
              autoFocus
            />
            <div className="quiz-buttons">
              <button className="quiz-submit-btn" onClick={submitQuizAnswer}>
                ✓ 提交答案
              </button>
              <button className="quiz-cancel-btn" onClick={() => setShowQuiz(false)}>
                ✕ 取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 单词提示动画 */}
      {showWordHint && (
        <div className="word-hint-animation">
          <div className="word-hint-content">
            <span className="hint-word">{word}</span>
            <button
              className="hint-close"
              onClick={() => setShowWordHint(false)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CanvasColoring;
