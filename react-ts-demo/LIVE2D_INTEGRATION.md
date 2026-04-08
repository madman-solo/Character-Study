# Live2D 模型集成说明

## 已完成的工作

### 1. 安装依赖
- `pixi.js` - 2D 渲染引擎
- `pixi-live2d-display` - Live2D 模型显示库

### 2. 创建组件
- **文件位置**: `src/components/Live2DModel.tsx`
- **功能**:
  - 加载并显示 Live2D Cubism 3.x 模型
  - 自动缩放和居中模型
  - 鼠标跟随效果（模型会跟随鼠标移动）
  - 点击交互（点击模型播放动作）
  - 自动播放待机动画

### 3. 集成到首页
- **文件位置**: `src/pages/Home.tsx`
- 替换了原来的占位符，现在显示真实的 Live2D 模型
- 添加了加载状态提示

### 4. 样式优化
- **文件位置**: `src/styles/HomeNew.css`
- 添加了 Live2D 容器样式
- 添加了加载动画
- 响应式设计（支持移动端）

## 模型信息

**当前使用的模型**: tororo_hijiki/hijiki
- 位置: `public/tororo_hijiki/hijiki/runtime/hijiki.model3.json`
- 类型: Live2D Cubism 3.x
- 支持的动作:
  - Idle（待机）
  - Tap（点击）
  - FlickUp（向上滑动）
  - FlickDown（向下滑动）
  - Flick（滑动）

## 交互功能

1. **鼠标跟随**: 移动鼠标，模型的眼睛和身体会跟随鼠标方向
2. **点击互动**: 点击模型会随机播放 Tap 动作
3. **自动待机**: 模型会自动播放待机动画

## 如何更换模型

如果要使用其他 Live2D 模型：

1. 将模型文件放到 `public` 目录下
2. 修改 `src/pages/Home.tsx` 中的 `modelPath` 属性：
   ```tsx
   <Live2DModel
     modelPath="/你的模型路径/model3.json"
     width={400}
     height={600}
     onModelLoaded={() => setModelLoaded(true)}
   />
   ```

## 启动应用

```bash
npm run dev
```

访问首页即可看到 Live2D 模型。

## 注意事项

- 模型文件必须放在 `public` 目录下
- 模型路径使用相对于 `public` 的路径
- 支持 Live2D Cubism 2.x 和 3.x 版本的模型
- 首次加载可能需要几秒钟时间
