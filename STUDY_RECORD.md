# 学习时长功能开发记录

## 功能架构

学习时长由三层协作实现：**前端计时 → 后端会话管理 → 统计展示**

### 相关文件
- `src/hooks/useStudyTimer.ts` — 会话生命周期管理（start/pause/resume/end/heartbeat）
- `src/hooks/useActivityTracker.ts` — 用户活跃度检测（防挂机）
- `src/pages/StudyTimePage.tsx` — 学习时长展示页
- `backend/routes/study.js` — 后端会话 API
- `backend/prisma/schema.prisma` — StudySession / UserLearningData 表结构

---

## 计算规则

### 真实学习时长
```
真实时长（秒）= 总时长 - 累计暂停时长（totalPause）
```
会话结束时写入 `UserLearningData.totalStudyTime`（分钟）和 `dailyStudyTime`（JSON，按日期）。

### 日均学习
```
日均 = round(totalStudyTime / 有学习记录的天数)
```
- 只统计有记录的天，跳过的天不计入分母
- 不包含当前进行中的会话（liveMinutes 未加入日均计算）

### 实时时长（stats 接口）
查询 `/api/study/stats` 时，会额外查询当前 active 会话，将 liveMinutes 加入今日和累计，但不影响日均。

---

## 防挂机机制

- `useActivityTracker` 监听 5 种交互事件 + 媒体 `timeupdate` 事件
- **10 分钟**无任何操作自动暂停（原为 3 分钟，已调整以兼容被动听音频场景）
- 切换标签页 / 窗口失焦立即暂停
- 前端心跳间隔：**25 秒**；后端超时判定：**60 秒**（余量 35 秒）

---

## 开发过程中遇到的问题与解决

### 1. 401 Unauthorized — study 接口鉴权失败

**现象**：`POST /api/study/start 401`，`GET /api/study/stats 401`

**原因**：`useStudyTimer` 和 `StudyTimePage` 的 axios 请求没有携带 `Authorization: Bearer <token>` 头。项目其他接口都是手动传 token，但这两处遗漏了。

**修复**：
- `App.tsx` 中从 `useAuth()` 取出 `token`，传给 `useStudyTimer(user?.id, token)`
- `useStudyTimer` 接收 token 参数，所有请求统一加 `{ headers: { Authorization: \`Bearer ${token}\` } }`
- `StudyTimePage` 同样引入 `useAuth()` 取 token 后带入请求头
- `start()` 加 `!token` 守卫，未登录时不发请求

---

### 2. 404 Not Found — resume 接口重复调用

**现象**：`POST /api/study/resume 404`

**原因**：`blur` 和 `visibilitychange` 事件会同时触发，导致 `pause()` 被调用两次；`focus` 和 `visibilitychange` 同样导致 `resume()` 被调用两次。第二次 resume 时会话已是 `active` 状态，后端只处理 `status=paused` 的会话，返回 404。

**修复**：在 `useStudyTimer` 中加 `isPaused` ref 作为状态锁：
- `pause()` 检查 `isPaused.current === false` 才发请求，发完置为 `true`
- `resume()` 检查 `isPaused.current === true` 才发请求，发完置为 `false`

---

### 3. ERR_CONNECTION_REFUSED — 心跳连接被拒绝

**现象**：`POST /api/study/heartbeat net::ERR_CONNECTION_REFUSED`

**原因**：后端服务重启或短暂宕机时，心跳 interval 仍在运行，连接被拒绝。重启后旧 sessionId 在数据库中已被标记为 ended，继续发心跳会收到 404。

**修复**：心跳改为 async，捕获错误后判断：
- 收到 404 或无 response（网络断开）时，清空 sessionId，重新调用 `/start` 创建新会话

---

### 4. 500 Internal Server Error — word-progress 外键约束失败

**现象**：`POST /api/word-progress 500`，Prisma 报 `P2003 Foreign key constraint failed`

**原因**：`server.js` 返回单词列表时，`id` 字段用的是 `(index + 1).toString()`（数组下标），不是数据库 `Word` 表的真实 id。前端拿这个假 id 创建 `WordProgress` 记录时，外键找不到对应的 `Word` 行。

**修复**：`server.js` 单词列表格式化处改为 `id: word.id.toString()`，返回数据库真实 id。

---

### 5. StudyTimePage 不实时更新

**现象**：进入学习时长页面后，数据不随学习进行而变化。

**原因**：原实现只在 `useEffect` 加载时请求一次数据，且当前进行中的会话在 `/end` 前不写入 `UserLearningData`，所以即使刷新也看不到实时时长。

**修复**：
- 前端：`useEffect` 改为每 30 秒轮询一次 `/api/study/stats`
- 后端：`/stats` 接口额外查询当前 active 会话，计算 `liveMinutes` 加入返回值

---

### 6. 媒体事件监听立即失效

**现象**：为支持被动听音频场景，在 `useActivityTracker` 中添加 `timeupdate` 事件监听，但实际无效。

**原因**：addEventListener 和 removeEventListener 写在同一层同步代码里，监听刚添加就立即被移除：
```ts
// 错误写法
el.addEventListener("timeupdate", onMediaActivity);   // 添加
el.removeEventListener("timeupdate", onMediaActivity); // 立即移除！
```

**修复**：用变量保存元素列表，addEventListener 在 effect 主体中执行，removeEventListener 移入 cleanup 函数：
```ts
const mediaEls = Array.from(document.querySelectorAll("audio, video"));
mediaEls.forEach(el => el.addEventListener("timeupdate", onMediaActivity));
return () => {
  mediaEls.forEach(el => el.removeEventListener("timeupdate", onMediaActivity));
};
```

---

## 容易忽视的注意事项

1. **项目所有需鉴权的接口都需手动传 token**，没有全局 axios 拦截器，新增接口时必须显式加 `Authorization` 头。

2. **blur + visibilitychange 会同时触发**，任何涉及"暂停/恢复"的状态切换都需要加幂等守卫（ref 状态锁），否则后端会收到重复请求。

3. **前端 id 与数据库 id 不一致**：`/api/vocabulary/words` 返回的单词列表原来用数组下标作为 id，凡是需要将该 id 作为外键写入数据库的场景，必须确保返回的是真实数据库 id。

4. **useEffect cleanup 中才能 removeEventListener**：addEventListener 和对应的 removeEventListener 必须分别在 effect 主体和 return 函数中，不能写在同一层同步代码里。

5. **日均学习不含当天进行中的会话**，只反映历史已结束会话的平均值，这是设计上的合理取舍。
