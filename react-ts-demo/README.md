# 角色互动网页

一个基于 React + TypeScript + Node.js + Express+Prisma 的角色互动网页应用。

## 特性

### 主旨：从角色互动中学习英语单词和句子，强调互动式学习，拒绝死记硬背。

### 明确受众：

- 主要受众：全阶段英语学习者（AI，分阶段）
- 次要受众：喜欢与虚拟角色互动的用户（live2D 集成，互动模式，大概是事件+参数）

### 功能模块：

#### 初步框架（已实现）：

- **角色预览**：首页展示角色模型（预留 Live2D 集成）和对话功能
- **在线角色**：按分类浏览角色（动漫人物、卡通人物、插画、动物、原创）
- **角色详情**：与选定角色进行对话互动
- **情景模式**：支持多种对话场景（英语学习、日常对话、专属陪伴等）
- **响应式设计**：完美适配 PC 端和移动端

#### 后续添加功能：

- 英语学习模式切换，日常对话模式切换，专属陪伴模式切换(已实现)
- todo:增加「语音输入 / 语音朗读」：对接讯飞语音接口，实现「说英文 →AI 听 →AI 说英文 → 用户听」的全语音对话；
- todo:增加「单词本」：把对话中的生词存入数据库，生成单词本；
- todo:增加「对话难度选择」，AI 自动调整回复难度；
- todo:增加「用户登录」：不同用户的学习记录分开存储，更贴合实际项目需求。
- 增加「对话记录」功能，用户可以查看之前的对话历史。(首页已实现)

##### 第一阶段（框架已做好）：

有英语基础者（年龄超过 12 岁）：

- 简约风格界面设计，符合青少年及成人审美。
- 提供多种单词本（四六级，雅思托福），用户选择之后可以选择两种模式帮助记忆：
  - 单词本模式：用户可以查看单词本，根据单词本中的单词进行学习。
  - todo:记忆模式：用户可以选择将单词本中的单词传入角色，与角色互动，记忆单词（角色会根据用户输入的单词进行回复，用户需要根据回复记忆单词）。

##### 扩充阶段：

幼童阶段（12 岁以下）：

- 提供基础的英语对话功能，帮助用户从角色互动中学习单词和句子。
- 场景借鉴宝宝巴士中的通关样式以及对话流程，帮助用户快速上手。
- 设计简单易懂的界面，适合幼童使用。
- todo:引入趣味元素，如动画和声音，提升用户体验。
- todo:提供奖励机制，鼓励用户持续学习和互动。
- 确保内容健康，适合幼童使用。
- todo:提供家长监控和指导功能，帮助家长了解孩子的学习进度。
- todo:引入语音识别和朗读功能，帮助幼童练习发音和听力。
- 提供多样化的角色选择，用户可以选择不同的角色进行互动。

#### 语音功能：

- 引入讯飞语音接口，实现「说英文 →AI 听 →AI 说英文 → 用户听」的全语音对话。
- 提供语音输入功能，用户可以通过语音输入与角色互动。
- 提供语音朗读功能，用户可以通过语音朗读与角色互动。

#### 音视频

Pexels是免费无版权的高清音视频素材平台，所有素材均为CC0授权，可免费用于个人/商业项目，无需署名，很适合你的少儿英语角色互动网页，以下是获取、导入React+TS项目的完整流程，附适配少儿英语的搜索技巧。

---

##### 一、Pexels核心优势与访问入口

| 特性     | 说明                                                                                      |
| :------- | :---------------------------------------------------------------------------------------- |
| 授权类型 | CC0（公有领域贡献），可商用、修改、二次创作，无需标注来源                                 |
| 素材类型 | 高清视频（含少儿相关动画/实拍）、图片，无音频素材（音频需搭配其他平台）                   |
| 访问入口 | 官网：https://www.pexels.com/videos/（中文：https://www.pexels.com/zh-cn/videos/）        |
| 关键限制 | 无原生“少儿英语动画”分类，需精准搜索；无音频库，音频需另寻渠道（如YouTube Audio Library） |

---

##### 二、Pexels获取少儿英语视频素材（3步到位）

###### 1. 精准搜索关键词（适配少儿英语场景）

- 核心关键词：kids english animation（少儿英语动画）、children's educational video（儿童教育视频）、alphabet learning（字母学习）、phonics for kids（少儿自然拼读）、nursery rhymes（儿歌实拍/动画）
- 筛选技巧：进入Videos页→输入关键词→用左侧Filters筛选“Duration（时长，选0-1分钟/1-5分钟）”“Resolution（分辨率，优先1080p/4K）”“Orientation（横/竖屏）”，快速定位短视频素材。

##### 2. 下载素材（无需注册，直接下载）

1. 点击目标视频进入详情页；
2. 点击右侧“Free Download”，选择分辨率（如1080p），素材自动下载到本地；
3. 重命名素材（如“alphabet_abc_1080p.mp4”），便于后续项目管理。

##### 3. 合规与适配建议

- 优先选无水印、无Logo素材，避免二次编辑麻烦；
- 下载后可裁剪片段、添加英文字幕，适配少儿学习场景。

---

##### 三、导入React+TS项目（复用之前的本地/远程方案）

###### 方案A：本地导入（适合少量固定素材，与之前本地方案一致）

1. 项目目录：将下载的视频放入src/assets/videos/；
2. 类型声明：在src/typings.d.ts添加`declare module '*.mp4' { const src: string; export default src; }`；
3. 组件中使用：

```typescript
import React from 'react';
import alphabetVideo from '@/assets/videos/alphabet_abc_1080p.mp4';

const PexelsVideoPlayer: React.FC = () => {
  return (
    <video src={alphabetVideo} controls width={320} poster="/thumbnails/alphabet.jpg">
      <track kind="subtitles" srcLang="en" src="/subtitles/alphabet_en.vtt" label="English" />
    </video>
  );
};
export default PexelsVideoPlayer;
```

##### 方案B：远程加载（适合大量素材，避免打包体积过大）

1. 上传素材：将Pexels视频上传至云存储（如阿里云OSS免费额度、腾讯云COS），获取公网URL；
2. 后端接口：用Node.js+Prisma写接口关联素材URL（参考之前远程素材方案）；
3. 前端请求：通过fetch获取URL后渲染video标签，与之前RemoteVideoPlayer逻辑一致。

---

##### 四、Pexels+音频搭配（补全少儿英语音视频需求）

Pexels无音频库，可搭配以下免费音频平台，实现“视频+音频”组合：

1. YouTube Audio Library（https://studio.youtube.com/channel/UC-9-kyTW8ZkZNDHQJ6FgpwQ/music）：免费无版权音乐，搜索“kids”“educational”获取儿歌/背景音乐；
2. Bensound（https://www.bensound.com/royalty-free-music/）：部分免费音乐可商用，筛选“Children”分类；
3. 导入方式：将音频放入src/assets/audios/，组件中用`<audio src={musicUrl} controls />`播放，或作为视频背景音。

---

##### 五、常见问题与避坑

1. 搜索不到“纯动画”素材：Pexels以实拍素材为主，纯动画较少，可搭配之前提到的B站（搜CoComelon/Yakka Dee）、PBS Kids等平台互补；
2. 打包体积过大：优先用远程云存储方案，只在本地保留核心短视频；
3. 兼容性问题：视频格式优先MP4（H.264），添加fallback提示`<p>Your browser doesn't support HTML5 video.</p>`。

---

##### 六、Pexels+其他平台互补（覆盖少儿英语全素材）

| 素材类型     | Pexels角色                  | 互补平台                                | 优势                              |
| :----------- | :-------------------------- | :-------------------------------------- | :-------------------------------- |
| 少儿英语视频 | 实拍教育视频、字母/拼读素材 | B站（动画）、PBS Kids（纯动画）         | 动画+实拍结合，满足不同学习场景   |
| 音频         | 无音频库                    | YouTube Audio Library、喜马拉雅         | 免费儿歌/背景音乐，适配磨耳朵需求 |
| 字幕         | 无原生字幕                  | 手动制作VTT字幕、用剪映自动生成英文字幕 | 适配少儿跟读需求                  |

## 技术栈

### 前端

- React 19
- TypeScript
- React Router
- Axios
- Vite

### 后端

- Node.js
- Express
- CORS

## 项目结构

```
react-ts-demo/
├── src/
│   ├── api/           # API接口
│   ├── components/    # 组件
│   ├── pages/         # 页面
│   ├── styles/        # 样式文件
│   ├── types/         # 类型定义
│   ├── App.tsx        # 主应用
│   └── main.tsx       # 入口文件
├── backend/
│   └── server.js      # 后端服务器
└── package.json
```

## 安装依赖

```bash
npm install
```

## 运行项目

### 方式一：分别启动前后端（推荐）

1. 启动后端服务器（端口 3001）：

```bash
npm run server
```

2. 新开一个终端，启动前端开发服务器（端口 5173）：

```bash
npm run dev
```

3. 在浏览器中访问：`http://localhost:5173`

### 方式二：仅启动前端（使用模拟数据）

```bash
npm run dev
```

## API 接口

后端服务器运行在 `http://localhost:3001`，提供以下接口：

- `GET /api/characters` - 获取所有角色
- `GET /api/characters/:id` - 获取单个角色详情
- `GET /api/scenarios` - 获取所有情景模式
- `POST /api/chat` - 发送聊天消息

## 打包构建

### 开发环境构建

```bash
npm run build
```

### 生产环境构建（包含前后端）

```bash
npm run build:prod
```

此命令会：

1. 编译 TypeScript 代码
2. 使用 Vite 打包前端资源到 `dist` 目录
3. 复制后端生产配置到 `dist/server.js`
4. 优化代码并进行代码分割

## 部署

### 生产环境运行

1. 构建项目：

```bash
npm run build:prod
```

2. 启动生产服务器：

```bash
npm start
```

服务器将在端口 3001 上运行，同时提供前端静态文件和 API 服务。

### 部署到服务器

1. 将整个 `dist` 目录上传到服务器
2. 在服务器上安装生产依赖：

```bash
npm install --production
```

3. 使用 PM2 或其他进程管理器运行：

```bash
pm2 start dist/server.js --name "character-chat"
```

## 后续开发计划

- [ ] 集成 Live2D 角色模型
- [ ] 接入真实的 AI 对话 API
- [ ] 添加用户认证系统
- [ ] 实现对话历史保存
- [ ] 添加更多角色和情景模式

## 环境变量

项目支持以下环境变量配置：

- `VITE_API_BASE_URL`: API 基础 URL
- `PORT`: 服务器端口（默认 3001）
- `NODE_ENV`: 运行环境（development/production）

## 技术特点

- ✅ TypeScript 类型安全
- ✅ Vite 快速构建
- ✅ 代码分割优化
- ✅ 响应式设计
- ✅ 前后端分离
- ✅ RESTful API 设计
