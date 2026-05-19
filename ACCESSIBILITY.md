# 无障碍（Accessibility）实现记录

> 项目：角色互动英语学习网页（React + TypeScript）
> 目标：符合 WCAG 2.1 AA 标准，支持键盘导航、屏幕阅读器、焦点管理

---

## 第一步：语义化 HTML 与 ARIA 角色

### 实现内容

将页面中用 `div`/`span` 模拟的交互元素替换为原生语义元素，或补充 ARIA 属性。

**核心原则：**

- 原生 HTML 元素自带语义，不需要重复声明（如 `<button>` 不需要 `role="button"`）
- 只在语义缺失时才使用 ARIA（`div` 当按钮、进度条、对话框等）
- 三种必须加 ARIA 的场景：
  1. `div`/`span` 模拟交互元素
  2. 动态内容需通知屏幕阅读器（`role="alert"` / `aria-live`）
  3. 补充视觉信息（图标按钮的 `aria-label`、装饰图片的 `aria-hidden`）

**涉及文件：** `Navbar.tsx`、`Characters.tsx`、`CharacterDetail.tsx`、`ChildEnglishHome.tsx` 等

**典型修改：**

```tsx
// 错误：div 当列表用，无语义
<div className="category-nav">
  <div className="category-item" onClick={...}>动漫人物</div>
</div>

// 正确：用原生 button，或补充 role
<nav aria-label="角色分类">
  <button className="category-btn" onClick={...}>动漫人物</button>
</nav>
```

---

## 第二步：键盘导航支持

### 问题

可点击的 `div` 元素无法通过 Tab 键聚焦，也无法用 Enter/Space 触发。

### 解决方案

对无法改为 `<button>` 的可点击 `div`，补充：

- `tabIndex={0}` — 加入 Tab 顺序
- `role="button"` — 告知屏幕阅读器语义
- `onKeyDown` — 支持 Enter/Space 触发
- `aria-label` — 提供文字描述

```tsx
<div
  role="button"
  tabIndex={0}
  aria-label="查看奖励中心"
  onClick={() => setShowRewardCenter(true)}
  onKeyDown={(e) =>
    (e.key === "Enter" || e.key === " ") &&
    (e.preventDefault(), setShowRewardCenter(true))
  }
/>
```

**涉及文件：** `ChildEnglishHome.tsx`（积分徽章、用户头像）、`VocabularyModal.tsx`（单词本卡片）、`ListeningPage.tsx`（精听素材卡片）、`ColoringPage.tsx`（涂色图片卡片）

### 遇到的问题：InteractiveLearningCard 导致"全部框中"

**现象：** Tab 键遍历 `child-special-grid` 区域时，整个网格被框住，而不是逐个卡片聚焦。

**原因：** `InteractiveLearningCard` 根元素是可点击的 `div`，没有 `tabIndex`，Tab 键跳过它，焦点落在父容器上，导致整个网格被框住。

**修复：** 将根元素从 `div` 改为 `button`，同时补充 `aria-label` 和 `aria-pressed`：

```tsx
// 修改前
<div className="interactive-learning-card" onClick={handleClick}>

// 修改后
<button
  className="interactive-learning-card"
  onClick={handleClick}
  aria-label={`${title}：${description}，获得${points}积分${isCompleted ? "，已完成" : ""}`}
  aria-pressed={isCompleted}
>
```

---

## 第三步：图片无障碍

### 原则

| 图片类型                                | 处理方式                    |
| --------------------------------------- | --------------------------- |
| 传达信息的图片                          | `alt="描述内容"`            |
| 装饰性图标（按钮内已有文字/aria-label） | `alt="" aria-hidden="true"` |
| 勋章/有意义的图标                       | `alt={badge.name}`          |

**涉及文件：** `ChildEnglishHome.tsx`、`ChildVocabularyBook.tsx`、`ChildVocabularyHub.tsx`、`RewardCenter.tsx`、`SoundControl.tsx`

**典型修改：**

```tsx
// 修改前：缺少 alt
<img src="/src/assets/iconfont/搜索.svg" width={30} height={30} />

// 修改后：装饰性图标
<img src="/src/assets/iconfont/搜索.svg" alt="" aria-hidden="true" width={30} height={30} />

// 有意义的图标（勋章）
<img src={badge.icon} alt={badge.name} width={36} height={36} />
```

---

## 第四步：表单无障碍

### 实现内容

每个表单控件必须有关联的 `<label>`，必填字段标注 `aria-required`，错误提示用 `role="alert"` 实时播报。

**涉及文件：** `CharacterCreationPage.tsx`、`CustomCompanionSetupPage.tsx`、`LoginPage.tsx`

```tsx
<label htmlFor="name-input">
  角色名字 <span className="required">*</span>
</label>
<input
  id="name-input"
  aria-required="true"
  aria-describedby="name-error"
  type="text"
  value={characterData.name}
  onChange={...}
/>
<span role="alert" aria-live="polite" id="name-error">
  {nameError}
</span>
```

**错误状态管理：** 在组件内定义错误变量，只在当前步骤且字段为空时显示，避免初始渲染就触发错误提示：

```tsx
const nameError =
  !characterData.name.trim() && currentStep === 1 ? "角色名字不能为空" : "";
```

---

## 第五步：模态框无障碍（Focus Trap + ESC 关闭）

### 实现内容

模态框打开时，焦点必须被"困"在模态框内循环，不能 Tab 到背景内容；按 ESC 关闭。

**封装为自定义 Hook：** `src/hooks/useAccessibility.ts`

```ts
export function useFocusTrap(ref: RefObject<HTMLElement>, isOpen: boolean) {
  useEffect(() => {
    if (!isOpen) return;
    const el = ref.current;
    if (!el) return;

    const focusable = el.querySelectorAll<HTMLElement>(
      'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])',
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first?.focus(); // 打开时自动聚焦第一个元素

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      // 动态重新查询，支持子视图切换
      const focusableNow = el.querySelectorAll<HTMLElement>(...);
      const firstNow = focusableNow[0];
      const lastNow = focusableNow[focusableNow.length - 1];
      // 焦点逃出模态框时强制拉回
      if (!el.contains(document.activeElement)) {
        e.preventDefault();
        (e.shiftKey ? lastNow : firstNow)?.focus();
        return;
      }
      if (e.shiftKey ? document.activeElement === firstNow : document.activeElement === lastNow) {
        e.preventDefault();
        (e.shiftKey ? lastNow : firstNow)?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);
}

export function useEscClose(onClose: () => void, isOpen: boolean) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);
}
```

**模态框使用方式：**

```tsx
const modalRef = useRef<HTMLDivElement>(null);
useFocusTrap(modalRef, isOpen);
useEscClose(onClose, isOpen);

<div
  ref={modalRef}
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  tabIndex={-1}
>
```

**涉及文件：** `ScenarioModal.tsx`、`EnglishLearningModeModal.tsx`、`VocabularyModal.tsx`、`LearningModeModal.tsx`

### 遇到的问题：子视图切换后焦点陷阱失效

**现象：** `ScenarioModal` 内部有多个子视图（选择情景 → 选择级别），切换子视图后 Tab 键可以逃出模态框。

**原因：** `useFocusTrap` 在 `useEffect` 中只查询一次可聚焦元素，子视图切换后 DOM 变化，`first`/`last` 引用已过期。

**修复：** 在 `handleKeyDown` 内部每次都重新查询可聚焦元素，而不是闭包捕获初始值：

```ts
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key !== "Tab") return;
  // 每次按 Tab 都重新查询当前 DOM
  const focusableNow = el.querySelectorAll<HTMLElement>(...);
  ...
};
```

---

## 第六步：焦点回归（Focus Return）

### 问题

模态框关闭后，焦点消失（落到 `body`），键盘用户失去位置感，必须从头 Tab。

### 解决方案

封装 `useFocusReturn` hook，打开模态框时保存触发元素，关闭时恢复焦点：

```ts
// src/hooks/useAccessibility.ts
export function useFocusReturn() {
  const triggerRef = useRef<HTMLElement | null>(null);
  const save = () => {
    triggerRef.current = document.activeElement as HTMLElement;
  };
  const restore = () => {
    triggerRef.current?.focus();
  };
  return { save, restore };
}
```

**在 `App.tsx` 中使用：**

```tsx
const scenarioFocus = useFocusReturn();
const englishModeFocus = useFocusReturn();
const vocabularyFocus = useFocusReturn();
const learningModeFocus = useFocusReturn();

// 打开时保存触发元素
<Navbar
  onScenarioClick={() => { scenarioFocus.save(); setIsScenarioModalOpen(true); }}
/>

// 关闭时恢复焦点
<ScenarioModal
  onClose={() => { setIsScenarioModalOpen(false); scenarioFocus.restore(); }}
/>
<EnglishLearningModeModal
  onClose={() => { setIsEnglishModeModalOpen(false); englishModeFocus.restore(); }}
/>
<VocabularyModal
  onClose={() => { setIsVocabularyModalOpen(false); vocabularyFocus.restore(); }}
/>
<LearningModeModal
  onClose={() => { setIsLearningModeModalOpen(false); learningModeFocus.restore(); }}
/>
```

**链式模态框的焦点回归：** `VocabularyModal` 由 `EnglishLearningModeModal` 内部触发，关闭时焦点回到 `EnglishLearningModeModal` 内的触发按钮，再关闭 `EnglishLearningModeModal` 时焦点回到 Navbar 的情景模式按钮，实现逐级回归。

---

## 遇到的典型问题汇总

### 1. ARIA 过度使用

**错误做法：** 给每个 `<div>`、`<p>`、`<h1>` 都加 `role` 属性。

**正确理解：** 原生 HTML 元素已有语义，重复声明会干扰屏幕阅读器。只在以下情况使用 ARIA：

- `div`/`span` 模拟交互元素
- 进度条、对话框等无原生元素的复杂组件
- 动态内容需要通知屏幕阅读器

### 2. 护眼模式导致导航栏下移

**现象：** 开启护眼模式后点击"在线角色"，导航栏往下偏移。

**原因：** `EyeCareMode.css` 全局覆盖了所有 `button` 的 `border-color`，但没有重置 `border-width`。Navbar 原本 `border: none`（等价于 `border-width: 0`），护眼模式只改了 `border-color`，浏览器用默认 `border-width: medium`（约 3px）渲染，撑高了导航栏。

**修复：** 在护眼模式 CSS 中为导航栏按钮和链接单独设置例外规则：

```css
body.eye-care-mode .navbar-menu li button,
body.eye-care-mode .navbar-menu li a {
  border: none !important;
  box-shadow: none !important;
  background: none !important;
}
```

### 3. Tab 键遍历时整个区域被框住

**现象：** Tab 到某个区域时，整个容器被框住而不是逐个元素聚焦。

**原因：** 区域内的可点击元素是 `div`，没有 `tabIndex`，Tab 跳过所有子元素，焦点落在父容器上。

**修复：** 将可点击 `div` 改为 `button`，或添加 `tabIndex={0}` + `role="button"` + `onKeyDown`。

### 4. 模态框内 `<img>` 的 alt 与 aria-hidden 冲突

**现象：** 图片设置了 `alt=""` 但没有 `aria-hidden="true"`，屏幕阅读器会读出空内容，造成停顿。

**修复：** 装饰性图片统一使用 `alt="" aria-hidden="true"`，有意义的图片使用描述性 `alt`。

---

## 文件改动清单

| 文件                                                          | 改动内容                                                     |
| ------------------------------------------------------------- | ------------------------------------------------------------ |
| `src/hooks/useAccessibility.ts`                               | 新增：`useFocusTrap`、`useEscClose`、`useFocusReturn`        |
| `src/App.tsx`                                                 | 焦点回归：4个模态框的 save/restore                           |
| `src/components/Navbar.tsx`                                   | `aria-label`、`aria-expanded`、`aria-controls`               |
| `src/components/ScenarioModal.tsx`                            | `role="dialog"`、`aria-modal`、`useFocusTrap`、`useEscClose` |
| `src/components/EnglishLearningModeModal.tsx`                 | 同上                                                         |
| `src/components/VocabularyModal.tsx`                          | 同上 + 单词本卡片 `tabIndex`/`role`/`onKeyDown`              |
| `src/components/LearningModeModal.tsx`                        | 同上                                                         |
| `src/pages/CharacterCreationPage.tsx`                         | label/input 关联、`aria-required`、`role="alert"`            |
| `src/pages/CustomCompanionSetupPage.tsx`                      | 同上                                                         |
| `src/pages/LoginPage.tsx`                                     | 同上                                                         |
| `src/pages/ChildStage/ChildEnglishHome.tsx`                   | 积分徽章/头像 `tabIndex`/`role`/`onKeyDown`；img alt         |
| `src/pages/ChildStage/ChildVocabularyBook.tsx`                | img `alt="" aria-hidden="true"`                              |
| `src/pages/ChildStage/ChildVocabularyHub.tsx`                 | img 补充 `aria-hidden="true"`                                |
| `src/pages/ChildStage/components/InteractiveLearningCard.tsx` | `div` → `button`，`aria-label`，`aria-pressed`               |
| `src/pages/ChildStage/components/RewardCenter.tsx`            | img alt                                                      |
| `src/pages/ChildStage/components/SoundControl.tsx`            | img `alt="" aria-hidden="true"`                              |
| `src/pages/ChildStage/InterChild/ColoringPage.tsx`            | 涂色卡片 `tabIndex`/`role`/`onKeyDown`/`aria-label`          |
| `src/pages/ListeningPage.tsx`                                 | 精听卡片 `tabIndex`/`role`/`onKeyDown`                       |
| `src/styles/EyeCareMode.css`                                  | 导航栏按钮/链接例外规则，防止撑高导航栏                      |
