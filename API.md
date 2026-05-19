# API 文档建设记录

本文档记录了为 `react-ts-demo` 项目集成 Swagger（OpenAPI 3.0）自动化 API 文档的完整过程，包括方案选型、集成步骤、遇到的问题及解决方法。

---

## 一、方案选型

### 候选方案

| 方案                | 说明                                   | 优点                 | 缺点                     |
| ------------------- | -------------------------------------- | -------------------- | ------------------------ |
| Markdown 静态文档   | 手写 `docs/API文档.md`                 | 简单，零依赖         | 需手动维护，易与代码脱节 |
| **Swagger（选用）** | `swagger-jsdoc` + `swagger-ui-express` | 自动生成，可在线调试 | 需在路由注释中维护 JSDoc |
| Postman Collection  | 导出 JSON 文件                         | 方便测试             | 不适合文档展示           |

**最终选用 Swagger**，原因：长远维护性更好，支持在线接口调试，注释与代码同处一文件不易遗漏。

---

## 二、集成步骤

### 2.1 安装依赖

在 `react-ts-demo/backend/` 目录下：

```bash
npm install swagger-jsdoc swagger-ui-express
```

### 2.2 在 server.js 中配置 Swagger

```js
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: { title: "青少年英语学习平台 API", version: "1.0.0" },
    servers: [{ url: "http://localhost:3001" }],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
    },
  },
  apis: ["./routes/*.js", "./server.js"], // 扫描所有路由文件中的 @swagger 注释
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
```

访问地址：**http://localhost:3001/api-docs**

### 2.3 路由文件中编写 JSDoc 注释

每个路由文件在顶部用 `/** @swagger */` 块描述接口，示例：

```js
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: 用户登录
 *     tags: [认证]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: 返回 JWT token
 */
```

需要 JWT 认证的接口加：

```yaml
security:
  - bearerAuth: []
```

---

## 三、检查与修复过程

### 3.1 验证命令

用以下命令验证所有路由注释能否被正确解析（无需启动服务器）：

```bash
cd backend
node -e "
const swaggerJsdoc = require('swagger-jsdoc');
const spec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: { title: 'Test', version: '1.0.0' },
    servers: [{ url: 'http://localhost:3001' }],
    components: { securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } } }
  },
  apis: ['./routes/*.js', './server.js']
});
console.log('paths数量:', Object.keys(spec.paths || {}).length);
console.log(Object.keys(spec.paths || {}));
"
```

### 3.2 发现的问题及修复

检查后发现以下三类问题，涉及 11 个路由文件：

#### 问题一：`tags` 块缩进错误（`asr.js`）

**错误写法：**

```js
/**
 * @swagger
 *  tags:          ← 多了一个空格，导致解析为路径而非全局 tag
 *   name: 语音识别
 * /api/asr/recognize:
 *   post: ...
 */
```

**修复：** 删除多余缩进，将 `tags` 定义移除（全局 tag 定义应在 `swaggerJsdoc` 的 `definition.tags` 中，不在路由注释里），路由注释只保留接口定义。

---

#### 问题二：路径与实际路由不匹配

| 文件                 | 注释中的路径                            | 实际路由                                  |
| -------------------- | --------------------------------------- | ----------------------------------------- |
| `learningSession.js` | `/api/learning-session/create/{userId}` | `/api/learning-session/start` 等 5 个端点 |
| `wordProgress.js`    | `/api/word-progress/create`             | `/api/word-progress`（POST）              |

**原因：** 注释是早期草稿，后来路由实现改了但注释没同步更新。

**修复：** 对照实际 `router.get/post/put/delete` 定义，重写注释中的路径。

---

#### 问题三：端点文档不完整（只写了第一个，其余缺失）

| 文件              | 已有文档的端点         | 缺失的端点                                                      |
| ----------------- | ---------------------- | --------------------------------------------------------------- |
| `reports.js`      | `/daily/:userId`       | `/weekly/:userId`、`/monthly/:userId`、`POST /generate/:userId` |
| `learningData.js` | `GET /:userId`         | `POST /`                                                        |
| `tts.js`          | `GET /speak`           | `GET /url`                                                      |
| `listening.js`    | `GET /materials`       | `GET /material/:id`                                             |
| `childWords.js`   | `GET /by-grade/:grade` | `/by-letter/:letter`、`/random`、`/:word`、`GET /`              |
| `user.js`         | `GET /me`              | `PUT /me`、`POST /convert-guest`                                |
| `study.js`        | `POST /start`          | `/heartbeat`、`/pause`、`/resume`、`/end`、`GET /stats`         |
| `writing.js`      | `POST /correct`        | `POST /submit`、`GET /history/:userId`、`POST /continue`        |

**修复：** 读取每个路由文件的完整内容，逐一补全所有 `router.xxx()` 对应的 Swagger 注释。

---

### 3.3 修复后验证结果

```
解析成功，paths数量: 45
```

修复前仅识别 16 个路径，修复后达到 45 个，覆盖所有路由端点。

---

## 四、最终端点清单

| 模块             | 端点                                                                                    |
| ---------------- | --------------------------------------------------------------------------------------- |
| 认证             | `POST /api/auth/register`、`POST /api/auth/login`                                       |
| 用户             | `GET/PUT /api/user/me`、`POST /api/user/convert-guest`                                  |
| 学习数据         | `GET /api/learning-data/{userId}`、`POST /api/learning-data`                            |
| 学习会话（内存） | `POST /start/heartbeat/end`、`GET /active/{userId}`、`GET /stats`                       |
| 学习模式（DB）   | `POST /api/study/start/heartbeat/pause/resume/end`、`GET /api/study/stats`              |
| 单词进度         | `POST/GET /api/word-progress`（成人）、`POST/GET /api/child-word-progress`（少儿）      |
| 少儿词汇         | `GET /api/child-words`（列表/年级/字母/随机/详情）                                      |
| 听力训练         | `GET /api/listening/materials`、`GET /api/listening/material/{id}`                      |
| 写作练习         | `POST /api/writing/correct/submit/continue`、`GET /api/writing/history/{userId}`        |
| TTS 发音         | `GET /api/tts/speak`、`GET /api/tts/url`                                                |
| 音频代理         | `GET /api/audio/speak`                                                                  |
| 口语 TTS         | `GET /api/speaking-tts/speak`                                                           |
| 语音识别         | `POST /api/asr/recognize`                                                               |
| 学习报告         | `GET /api/reports/daily/weekly/monthly/{userId}`、`POST /api/reports/generate/{userId}` |
| 奖励数据         | `GET /api/reward-data/{userId}`                                                         |
| 上传             | `POST /api/upload/character-bg`                                                         |

---

## 五、注意事项

1. **查询参数不能写在路径里**：`/api/speak?text=xxx` 是错误写法，查询参数应用 `parameters` 的 `in: query` 描述。

2. **多端点写在同一注释块**：同一文件的多个端点可以写在一个 `/** @swagger */` 块中，用空行分隔各路径，避免多个注释块互相干扰。

3. **路径参数用 `{param}` 格式**：Swagger 路径参数写法是 `{userId}`，不是 Express 的 `:userId`。

4. **验证优先于启动**：修改注释后先用 `node -e` 验证解析，比启动整个服务器更快定位问题。
