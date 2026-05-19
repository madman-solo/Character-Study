# 测试文档

## 概览

| 测试文件                                                 | 类型     | 框架               | 测试数 |
| -------------------------------------------------------- | -------- | ------------------ | ------ |
| `src/utils/__tests__/masteryAnalysis.test.ts`            | 单元测试 | Vitest             | 16     |
| `src/services/__tests__/spacedRepetitionService.test.ts` | 单元测试 | Vitest             | 17     |
| `src/components/__tests__/chatinterface.test.tsx`        | 组件测试 | Vitest + RTL       | 11     |
| `backend/routes/__tests__/wordProgress.test.js`          | 集成测试 | Vitest + Supertest | 8      |

---

## 如何运行测试

### 前端测试（单元 + 组件）

```bash
# 在项目根目录
npm test          # 单次运行
npm run test:watch  # 监听模式
```

### 后端集成测试

```bash
# 第一次使用前，初始化测试数据库（只需一次）
cd backend
DATABASE_URL=file:./prisma/test.db npx prisma db push

# 运行测试
npm test
```

> 后端测试使用独立的 `test.db`，不会污染开发数据库 `dev.db`。

---

## 测试一：masteryAnalysis 单元测试

**文件：** `src/utils/__tests__/masteryAnalysis.test.ts`

**测试对象：** `calculateMasteryScore`、`getMasteryLevel`、`analyzeMasteryDistribution`、`getMasteryPercentage`、`identifyWeakWords`、`calculateAverageMasteryScore`

**为什么写这个：** 掌握度算法是核心业务逻辑（三维加权：正确率50% + 时间衰减30% + 复习次数20%），纯函数，最适合单元测试，边界值清晰。

### 测试覆盖的关键边界

- 全部答对且刚复习 → 满分100
- 从未答题 → 只有时间分30分
- 30天前复习 → 时间衰减归零，得70分
- `lastStudied` 传字符串格式（后端返回 ISO 字符串）→ 不应报错
- `getMasteryLevel` 用 `it.each` 参数化测试10个分数边界，避免重复代码

### 辅助函数设计

```ts
function makeProgress(correctCount, wrongCount, daysAgo = 0): WordProgress;
```

用工厂函数构造测试数据，避免每个 `it` 里重复写完整对象。`daysAgo` 控制时间衰减，让时间相关测试可预测。

---

## 测试二：spacedRepetitionService 单元测试

**文件：** `src/services/__tests__/spacedRepetitionService.test.ts`

**测试对象：** 纯函数（`calculateAccuracy`、`isDueToday`、`formatNextReview`、`getMasteryLevel`）+ 异步函数（`trackWordProgress`、`getReviewWords`）

**为什么分两类处理：**

- 纯函数：直接调用断言，无需任何 mock
- 异步函数：依赖 `fetch`，单元测试不应真正发网络请求，用 `vi.stubGlobal` mock 全局 fetch

### mock fetch 的方式

```ts
// 为什么用 vi.stubGlobal 而不是 vi.spyOn：
// fetch 是全局变量，不是某个模块的导出，stubGlobal 是 Vitest 推荐方式
vi.stubGlobal(
  "fetch",
  vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(data) }),
);

// afterEach 还原，避免污染其他测试
afterEach(() => vi.unstubAllGlobals());
```

### 测试覆盖的关键场景

- `calculateAccuracy`：除零保护（0,0 → 0）、四舍五入（1/3 → 33）
- `isDueToday`：今天/昨天/明天三个边界，字符串日期格式
- `formatNextReview`：6个文案分支（需要复习/今天/明天/N天后/N周后/N个月后）
- `trackWordProgress`：成功路径、请求体验证、HTTP 500 错误、网络异常
- `getReviewWords`：URL 参数拼接验证（bookType、limit）

---

## 测试三：ChatInterface 组件测试

**文件：** `src/components/__tests__/chatinterface.test.tsx`

**测试对象：** `ChatInterface` 组件的用户交互行为

**为什么写组件测试而不是单元测试：** 组件本身没有复杂算法，价值在于验证"用户操作 → UI 变化"的链路，如按钮禁用状态、消息渲染、键盘快捷键。

### mock 策略

组件依赖三个外部模块，全部 mock：

```ts
vi.mock("../../services/chatService", () => ({
  chat: vi.fn(),
  saveMessage: vi.fn().mockResolvedValue(undefined),
  getConversationHistory: vi.fn().mockResolvedValue([]),
  deleteConversationHistory: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: "test-user" } }),
}));

vi.mock("../../services/characterService", () => ({
  saveConversation: vi.fn().mockResolvedValue(undefined),
  getConversationHistory: vi.fn().mockResolvedValue([]),
}));
```

**为什么 mock 这些：** `chatService` 会发真实 HTTP 请求，`AuthContext` 需要 Provider 包裹，mock 后组件可以独立渲染。

### 遇到的问题

**问题：** `vi.mock` 是静态提升的，mock 内部不能直接引用外部变量（如 `vi.fn()`），导致 `chat` mock 引用拿不到。

**解决：** 用动态 import 在 mock 之后获取引用：

```ts
const { chat } = await import("../../services/chatService");
// 然后在 beforeEach 里设置具体行为
vi.mocked(chat).mockResolvedValue({ content: "AI的回复", error: null });
```

**问题：** 测试打字机效果时，AI 回复不出现（打字机动画还没完成）。

**解决：** 传 `enableTypewriter={false}` prop 禁用打字机，让 AI 回复直接渲染：

```tsx
render(<ChatInterface {...defaultProps} enableTypewriter={false} />);
```

### 测试覆盖的关键场景

- 初始空状态显示"开始对话"
- 输入为空时发送按钮 `disabled`
- 发送中显示 loading 指示器（让 `chat` 返回永不 resolve 的 Promise）
- Enter 发送 / Shift+Enter 不发送
- API 失败时显示错误提示

---

## 测试四：wordProgress 集成测试

**文件：** `backend/routes/__tests__/wordProgress.test.js`

**测试对象：** `POST /api/word-progress`、`GET /api/word-progress/review/:userId`

**为什么是集成测试而不是单元测试：** 路由逻辑本身不复杂，价值在于验证"HTTP 请求 → Express 路由 → Prisma → SQLite → 响应"的完整链路，mock 掉数据库就失去了意义。

### 关键设计决策

**1. 不 mock Prisma，用真实测试数据库**

用独立的 `test.db`（通过 `DATABASE_URL` 环境变量切换），不污染开发数据 `dev.db`。

**2. server.js 导出 app**

Supertest 需要 `app` 对象，但不能触发 `app.listen`（否则占用端口）。修改方式：

```js
// 修改前
app.listen(PORT, async () => { ... });

// 修改后：只有直接运行时才 listen，被 require 时只导出 app
if (require.main === module) {
  app.listen(PORT, async () => { ... });
}
module.exports = app;
```

**3. 测试文件用 ESM，后端用 createRequire 加载 CommonJS**

后端是 CommonJS（`require`），Vitest 测试文件必须用 ESM（`import`）。两者共存的方式：

```js
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const app = require("../../server"); // 加载 CommonJS 模块
```

**4. beforeAll 自动创建测试数据，afterAll 清理**

```js
beforeAll(async () => {
  // 创建测试用 Word，避免依赖数据库中已有数据
  const word = await prisma.word.create({
    data: { word: "__test_word__", translation: "测试" },
  });
  TEST_WORD_ID = word.id;
});

afterAll(async () => {
  // 清理所有测试数据，断开连接避免进程挂起
  await prisma.word.delete({ where: { id: TEST_WORD_ID } });
  await prisma.$disconnect();
});
```

**5. beforeEach 清空进度记录**

每个测试前清空该用户的 `WordProgress`，保证测试之间互不影响（特别是计数累加的 case）。

### 遇到的问题

**问题1：** Windows 不支持 `KEY=value command` 语法，`DATABASE_URL=file:./prisma/test.db vitest run` 报错"不是内部或外部命令"。

**解决：** 在 `backend/` 安装 `cross-env`，改为：

```json
"test": "cross-env DATABASE_URL=file:./prisma/test.db vitest run --config vitest.config.js"
```

**问题2：** 测试文件用 `require("vitest")` 报错：`Vitest cannot be imported in a CommonJS module using require()`。

**解决：** 测试文件改为 ESM（`import`），后端模块用 `createRequire` 加载（见上方设计决策3）。

**问题3：** `TEST_WORD_ID = 1` 硬编码，测试库是空的，外键约束导致 POST 失败。

**解决：** 改为 `beforeAll` 动态创建 Word 记录，`afterAll` 删除，测试完全自包含。

### 测试覆盖的关键场景

- 缺少必填字段 → 400
- 首次答题 → `create` 分支，`correctCount=1`
- 重复答题 → `update` 分支，计数累加
- `bookType` query 参数过滤
- `limit` 参数限制返回数量

---

## 配置文件说明

### 前端：`vite.config.ts`

```ts
test: {
  environment: 'jsdom',   // 模拟浏览器环境，React 组件测试需要
  globals: true,
  setupFiles: './src/test/setup.ts',  // 引入 @testing-library/jest-dom 扩展断言
}
```

### 后端：`backend/vitest.config.js`

```js
test: {
  environment: 'node',  // 纯 Node 环境，不需要 DOM
}
```

两套配置独立，互不干扰。前端用 `jsdom`，后端用 `node`。

---

集成测试：backend/routes/**tests**/wordProgress.test.js
为什么用 Supertest 而不是 mock
集成测试的价值在于验证完整链路：HTTP 请求 → Express 路由 → Prisma → SQLite → 响应。如果 mock 掉数据库，就退化成单元测试，失去了验证路由逻辑和数据库交互的意义。

四个关键设计决策

1. 独立测试数据库

通过 DATABASE_URL 环境变量切换到 test.db，不污染开发数据：

"test": "cross-env DATABASE_URL=file:./prisma/test.db vitest run --config vitest.config.js"
用 cross-env 是因为 Windows 不支持 KEY=value command 语法。

2. server.js 导出 app 但不 listen

Supertest 需要 app 对象，但不能触发 listen（否则占用端口）：

if (require.main === module) {
app.listen(PORT, ...);
}
module.exports = app; 3. ESM 测试文件加载 CommonJS 后端

Vitest 测试文件是 ESM，后端是 CommonJS，用 createRequire 桥接：

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const app = require("../../server"); 4. 测试数据完全自包含

beforeAll：动态创建测试用 Word 记录，拿到真实 id（不硬编码，避免外键约束失败）
beforeEach：清空该用户的 WordProgress，保证每个 it 互不影响
afterAll：删除所有测试数据，prisma.$disconnect() 避免进程挂起
测试覆盖的 8 个场景
路由 场景 验证的逻辑
POST 缺少必填字段 输入校验 → 400
POST 首次答对 create 分支，correctCount=1
POST 首次答错 create 分支，wrongCount=1
POST 重复答题 update 分支，计数累加
GET 无记录 空状态响应结构正确
GET 有记录 关联查询返回 word + progress
GET bookType 过滤 query 参数过滤生效
GET limit 参数 返回数量不超过限制
运行方式

# 第一次：初始化测试数据库（只需一次）

cd react-ts-demo/backend
DATABASE_URL=file:./prisma/test.db npx prisma db push

# 运行测试

npm test
