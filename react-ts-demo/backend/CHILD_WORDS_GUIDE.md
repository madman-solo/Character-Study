# 少儿英语单词库使用指南

本指南介绍如何从 ecdict.csv 筛选、清洗并导入适合幼儿（3-6岁）和小学（1-6年级）的英语单词。

## 功能特点

- ✅ 自动筛选适合幼儿和小学的单词
- ✅ 严格按学段区分（幼儿 + 小学1-6年级）
- ✅ 数据清洗（音标格式化、释义简化）
- ✅ 基于新课标小学核心800词
- ✅ 词频优先排序
- ✅ 每日一词自动使用少儿单词库

## 筛选规则

### 幼儿单词（3-6岁，grade=0）
- **单词长度**: 2-4个字母
- **词性**: 仅名词（n.）、动词（v.）
- **释义**: 具象、简单（≤5个字）
- **示例**: cat, dog, run, jump, red, big

### 小学单词（1-6年级，grade=1-6）
- **单词长度**: 2-6个字母
- **词性**: 名词（n.）、动词（v.）、形容词（adj.）
- **释义**: 简化核心释义（≤10个字）
- **年级分配**:
  - 一年级: 2-3字母高频词
  - 二年级: 3-4字母高频词
  - 三年级: 4字母词
  - 四年级: 5字母高频词
  - 五年级: 5字母词
  - 六年级: 6字母词

## 快速开始

### 步骤1: 运行数据库迁移

```bash
cd react-ts-demo/backend
npx prisma migrate dev --name add_child_words
```

### 步骤2: 筛选和清洗单词

```bash
node processChildWords.js
```

这将从 `ecdict.csv` 中筛选适合的单词，并保存到 `childWords.json`。

**预期输出**:
```
开始处理 ecdict.csv...
已处理 10000 行...
已处理 20000 行...
...
处理完成！
==================================================
统计信息:
总行数: 400000
跳过: 395000
幼儿单词 (3-6岁): 150
小学一年级: 80
小学二年级: 120
小学三年级: 150
小学四年级: 180
小学五年级: 200
小学六年级: 220
总计筛选: 1100
==================================================
结果已保存到: childWords.json
```

### 步骤3: 导入到数据库

```bash
node importChildWords.js
```

**预期输出**:
```
开始导入少儿单词到数据库...

数据统计:
幼儿单词: 150
小学一年级: 80
...
总计: 1100 个单词

清空现有少儿单词数据...
开始批量导入...
已导入 100/1100 (9%)
已导入 200/1100 (18%)
...
导入完成！
==================================================
成功导入: 1100
失败: 0
==================================================
```

## 数据结构

### ChildWord 表字段

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Int | 主键（自增） |
| word | String | 单词（唯一） |
| phonetic | String | 音标（格式: /xxx/） |
| translation | String | 简化释义 |
| pos | String | 词性（n./v./adj.） |
| grade | Int | 年级（0=幼儿，1-6=小学） |
| bnc | Int | 英国国家语料库词频 |
| frq | Int | 当代语料库词频 |
| audio | String | 发音音频URL（可选） |

### ChildWordProgress 表字段

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Int | 主键（自增） |
| userId | String | 用户ID |
| wordId | Int | 单词ID |
| correctCount | Int | 正确次数 |
| wrongCount | Int | 错误次数 |
| lastStudied | DateTime | 最后学习时间 |
| mastered | Boolean | 是否已掌握 |

## API 使用

### 获取每日一词（少儿版）

```http
GET /api/dictionary/daily-word
```

**响应示例**:
```json
{
  "word": "cat",
  "phonetic": "/kæt/",
  "translation": "猫",
  "example": "This is cat.",
  "pos": "n.",
  "grade": 0,
  "source": "child-local"
}
```

**说明**:
- 优先返回幼儿到小学三年级的单词（grade 0-3）
- 如果低年级单词不足，从所有少儿单词中选择
- `source: "child-local"` 表示来自少儿单词库

## 文件说明

### 核心文件

1. **filterChildWords.js** - 筛选规则和工具函数
   - 小学核心800词列表
   - 幼儿常见词列表
   - 音标清洗函数
   - 释义简化函数

2. **processChildWords.js** - 主处理脚本
   - 读取 ecdict.csv
   - 应用筛选规则
   - 数据清洗
   - 输出 childWords.json

3. **importChildWords.js** - 数据库导入脚本
   - 批量导入单词
   - 验证导入结果
   - 显示统计信息

## 自定义配置

### 修改年级分配规则

编辑 `processChildWords.js` 中的 `determineGrade` 函数:

```javascript
function determineGrade(word, bnc, frq) {
  const len = word.length;
  const frequency = (bnc || 0) + (frq || 0);

  // 自定义规则
  if (len <= 3 && frequency > 15000) return 1; // 更严格的一年级标准
  // ... 其他规则
}
```

### 添加更多核心词

编辑 `filterChildWords.js` 中的 `PRIMARY_CORE_WORDS`:

```javascript
const PRIMARY_CORE_WORDS = new Set([
  'a', 'about', 'after', // ... 现有单词
  'your-new-word', // 添加新单词
]);
```

## 故障排除

### 问题1: 找不到 ecdict.csv

**错误**: `错误: 找不到 ecdict.csv 文件`

**解决**: 确保 `ecdict.csv` 位于 `react-ts-demo/` 目录下

```bash
# 检查文件是否存在
ls react-ts-demo/ecdict.csv
```

### 问题2: 筛选出的单词太少

**原因**: 筛选规则过于严格

**解决**:
1. 放宽单词长度限制
2. 增加核心词列表
3. 调整词频阈值

### 问题3: 数据库导入失败

**错误**: `Prisma Client 未找到 childWord 模型`

**解决**: 运行数据库迁移

```bash
npx prisma generate
npx prisma migrate dev
```

## 维护和更新

### 定期更新单词库

```bash
# 1. 下载最新的 ecdict.csv
# 2. 重新处理
node processChildWords.js

# 3. 重新导入（会清空现有数据）
node importChildWords.js
```

### 查看数据库统计

```bash
# 进入 Prisma Studio
npx prisma studio

# 或使用 SQLite 命令
sqlite3 prisma/dev.db "SELECT grade, COUNT(*) FROM ChildWord GROUP BY grade;"
```

## 许可证

- ECDICT: MIT License
- 本项目: 遵循相应开源协议
