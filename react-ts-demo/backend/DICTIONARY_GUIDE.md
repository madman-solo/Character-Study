# 单词学习系统 - 词典集成指南

本系统集成了GitHub开源单词数据库，支持本地词典查询，并将有道API作为备选方案。

## 功能特点

- ✅ 本地词典数据库（基于ECDICT）
- ✅ 支持77万+英语单词
- ✅ 包含音标、翻译、例句、词性等完整信息
- ✅ 按考试大纲标注（中考、高考、四六级、雅思、托福等）
- ✅ 有道API作为备选方案
- ✅ 自动降级机制

## 数据来源

推荐使用 **ECDICT** (https://github.com/skywind3000/ECDICT)
- 77万+词条
- 包含音标、释义、例句
- 按考试大纲标注
- 提供SQLite/CSV格式

其他可选数据源：
- **zhenghaoyang24/english-vocabulary**: 10万+单词，含例句
- **KyleBing/english-vocabulary**: 中英文对照词汇
- **ismartcoding/endict**: 基于ECDICT的精简版
- **LinXueyuanStdio/DictionaryData**: 400+本单词书

## 快速开始

### 1. 数据库已配置

数据库schema已包含以下表：
- `Word`: 单词词典表
- `WordProgress`: 用户学习进度表

### 2. 导入单词数据

#### 方法一：从ECDICT CSV导入（推荐）

1. 下载ECDICT数据：
```bash
# 访问 https://github.com/skywind3000/ECDICT
# 下载 stardict.csv 文件
```

2. 导入全部数据：
```bash
cd backend
node importECDICT.js path/to/stardict.csv
```

3. 导入特定年级：
```bash
# 导入初一单词
node importECDICT.js stardict.csv --grade 初一

# 导入四级单词
node importECDICT.js stardict.csv --grade 四级

# 导入多个标签
node importECDICT.js stardict.csv --tags zk,gk,cet4
```

4. 限制导入数量（测试用）：
```bash
node importECDICT.js stardict.csv --max 1000
```

#### 方法二：使用内置示例数据

系统启动时会自动初始化5个示例单词（hello, good, morning, book, study）。

### 3. 配置有道API（可选）

如果本地词典没有某个单词，系统会自动使用有道API作为备选方案。

在 `backend/.env` 文件中配置：
```env
YOUDAO_APP_KEY=your_app_key
YOUDAO_APP_SECRET=your_app_secret
```

申请地址：https://ai.youdao.com/

## API使用

### 查询单词

```http
GET /api/dictionary/:word
```

响应示例：
```json
{
  "word": "hello",
  "phonetic": "/həˈləʊ/",
  "translation": "你好；喂",
  "example": "Hello, how are you today?",
  "definition": "used as a greeting",
  "pos": "int.",
  "collins": 5,
  "oxford": true,
  "tag": "zk gk cet4",
  "source": "local"
}
```

`source` 字段说明：
- `local`: 来自本地词典
- `youdao`: 来自有道API
- `fallback`: 默认数据

## 数据结构

### Word 表字段

| 字段 | 类型 | 说明 |
|------|------|------|
| word | String | 单词（唯一） |
| phonetic | String | 音标 |
| translation | String | 中文翻译 |
| definition | String | 英文释义 |
| pos | String | 词性 |
| collins | Int | 柯林斯星级(1-5) |
| oxford | Boolean | 是否牛津3000核心词 |
| tag | String | 标签（zk/gk/cet4/cet6/ielts/toefl） |
| bnc | Int | 英国国家语料库词频 |
| frq | Int | 当代语料库词频 |
| exchange | String | 时态复数等变换 |
| detail | String | 详细释义（JSON） |
| audio | String | 发音音频URL |

### 标签说明

- `zk`: 中考
- `gk`: 高考
- `cet4`: 四级
- `cet6`: 六级
- `ky`: 考研
- `ielts`: 雅思
- `toefl`: 托福
- `gre`: GRE

## 工作流程

1. 用户查询单词
2. 系统首先查询本地数据库
3. 如果本地有数据，直接返回（source: local）
4. 如果本地没有，尝试调用有道API（source: youdao）
5. 如果有道API也失败，返回默认数据（source: fallback）

## 性能优化

- 本地词典使用索引优化查询速度
- 批量导入使用 `createMany` 提高效率
- 支持按标签筛选，减少数据量

## 扩展功能

### 1. 按标签查询单词

```javascript
const { getWordsByTag } = require('./localDictionary');

// 获取中考单词
const words = await getWordsByTag('zk', 100);
```

### 2. 批量导入自定义数据

```javascript
const { importWordsToDatabase } = require('./localDictionary');

const words = [
  {
    word: 'example',
    phonetic: '/ɪɡˈzɑːmpl/',
    translation: '例子',
    // ... 其他字段
  }
];

await importWordsToDatabase(words);
```

## 故障排除

### 问题1：导入失败

检查CSV文件格式是否正确，确保字段分隔符为逗号。

### 问题2：查询速度慢

确保已创建索引：
```sql
CREATE INDEX idx_word ON Word(word);
CREATE INDEX idx_tag ON Word(tag);
```

### 问题3：有道API报错

检查API Key配置是否正确，确认API额度是否用完。

## 数据更新

定期更新ECDICT数据：
```bash
# 下载最新的stardict.csv
# 重新导入（会自动跳过已存在的单词）
node importECDICT.js stardict.csv
```

## 许可证

- ECDICT: MIT License
- 本项目: 遵循相应开源协议

## 参考资源

- [ECDICT GitHub](https://github.com/skywind3000/ECDICT)
- [有道智云API](https://ai.youdao.com/)
- [Prisma文档](https://www.prisma.io/docs)
