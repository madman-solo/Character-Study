// 加载环境变量
require("dotenv").config();

const { PrismaClient } = require("@prisma/client");
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { injectDateContext } = require("./utils/dateInjector");
const RateLimiter = require("./utils/rateLimiter");
const RetryHandler = require("./utils/retryHandler");

const prisma = new PrismaClient();
const app = express();
const PORT = 3001;

// 百度千帆 API 配置
const QIANFAN_API_KEY = process.env.QIANFAN_API_KEY;
const QIANFAN_BASE_URL = "https://qianfan.baidubce.com/v2";
const QIANFAN_SECRET_KEY = process.env.QIANFAN_SECRET_KEY;

// 初始化限流器和重试处理器
// 根据千帆 API 的 TPM 限制调整参数：
// - 每分钟最多 5 个请求
// - 请求之间至少间隔 8 秒
const rateLimiter = new RateLimiter(5, 60000, 8000);
const retryHandler = new RetryHandler({
  maxRetries: 5,
  baseDelay: 3000,
  maxDelay: 60000,
});
// 千帆 API 请求工具函数（带限流和重试）
async function qianfanRequest(endpoint, method = "GET", data = null) {
  // 使用限流器包装请求
  return rateLimiter.enqueue(async () => {
    // 使用重试处理器执行请求
    return retryHandler.executeWithRetry(
      async () => {
        const config = {
          method,
          url: `${QIANFAN_BASE_URL}${endpoint}`,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${QIANFAN_API_KEY}`,
          },
        };

        if (data && method !== "GET") {
          config.data = data;
        }

        const response = await axios(config);
        return response.data;
      },
      { name: `${method} ${endpoint}` },
    );
  });
}

// 中间件
app.use(cors());
app.use(express.json());

// 引入认证路由
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const learningDataRoutes = require("./routes/learningData");
const rewardDataRoutes = require("./routes/rewardData");
const childWordsRoutes = require("./routes/childWords");
const wordProgressRoutes = require("./routes/wordProgress");
const learningSessionRoutes = require("./routes/learningSession");
const reportsRoutes = require("./routes/reports");
const ttsRoutes = require("./routes/tts");
const audioRoutes = require("./routes/audio");

// 注册认证路由
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/learning-data", learningDataRoutes);
app.use("/api/reward-data", rewardDataRoutes);
app.use("/api/child-words", childWordsRoutes);
app.use("/api", wordProgressRoutes);
app.use("/api/learning-session", learningSessionRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/tts", ttsRoutes);
app.use("/api/audio", audioRoutes);

// 模拟角色数据
const characters = [
  {
    id: "1",
    name: "初音未来",
    avatar: "🎤",
    category: "动漫人物",
    description: "虚拟歌姬，充满活力，喜欢唱歌和与人交流",
    tags: ["音乐", "可爱", "活泼"],
    popularity: 95,
  },
  {
    id: "2",
    name: "路飞",
    avatar: "🏴‍☠️",
    category: "动漫人物",
    description: "海贼王，热血冒险，永不放弃",
    tags: ["冒险", "热血", "勇敢"],
    popularity: 92,
  },
  {
    id: "3",
    name: "米老鼠",
    avatar: "🐭",
    category: "卡通人物",
    description: "经典卡通形象，乐观开朗",
    tags: ["经典", "可爱", "友善"],
    popularity: 88,
  },
];

// API路由

// 获取所有角色
app.get("/api/characters", async (req, res) => {
  try {
    const { category } = req.query;

    // 从数据库获取角色
    let dbCharacters = await prisma.character.findMany({
      where: category ? { category } : {},
      orderBy: { popularity: "desc" },
    });

    // 如果数据库为空，使用默认数据
    if (dbCharacters.length === 0) {
      const filtered = category
        ? characters.filter((char) => char.category === category)
        : characters;
      return res.json(filtered);
    }

    // 将数据库数据转换为前端格式
    const formattedCharacters = dbCharacters.map((char) => ({
      id: char.id.toString(),
      name: char.name,
      avatar: char.avatar,
      category: char.category,
      description: char.description || "",
      tags: JSON.parse(char.tags),
      popularity: char.popularity,
    }));

    res.json(formattedCharacters);
  } catch (error) {
    console.error("获取角色列表失败:", error);
    res.status(500).json({ error: "服务器错误" });
  }
});

// 获取单个角色详情
app.get("/api/characters/:id", async (req, res) => {
  try {
    const characterId = parseInt(req.params.id);

    // 从数据库获取角色
    let character = await prisma.character.findUnique({
      where: { id: characterId },
    });

    // 如果数据库中没有，使用默认数据
    if (!character) {
      const defaultCharacter = characters.find(
        (char) => char.id === req.params.id,
      );
      if (defaultCharacter) {
        return res.json(defaultCharacter);
      }
      return res.status(404).json({ error: "角色未找到" });
    }

    // 将数据库数据转换为前端格式
    const formattedCharacter = {
      id: character.id.toString(),
      name: character.name,
      avatar: character.avatar,
      category: character.category,
      description: character.description || "",
      tags: JSON.parse(character.tags),
      popularity: character.popularity,
    };

    res.json(formattedCharacter);
  } catch (error) {
    console.error("获取角色详情失败:", error);
    res.status(500).json({ error: "服务器错误" });
  }
});

// 获取所有情景模式
app.get("/api/scenarios", (req, res) => {
  res.json(scenarios);
});

// ========== 百度千帆 API 接口 ==========

// 0. 获取限流器状态（监控端点）
app.get("/api/qianfan/status", (_req, res) => {
  const status = rateLimiter.getStatus();
  res.json({
    ...status,
    message:
      status.queueLength > 0
        ? `当前有 ${status.queueLength} 个请求在队列中等待`
        : "系统运行正常",
    rateLimitInfo: `${status.recentRequests}/${status.maxRequests} 请求/分钟`,
  });
});

// 1. 获取模型列表
app.get("/api/qianfan/models", async (req, res) => {
  try {
    const data = await qianfanRequest("/models", "GET");
    res.json(data);
  } catch (error) {
    res.status(500).json({
      error: "获取模型列表失败",
      message: error.response?.data?.error?.message || error.message,
    });
  }
});

// 2. 文本生成接口（对话）
app.post("/api/qianfan/chat", async (req, res) => {
  try {
    const { messages, model = "ernie-speed-8k", ...otherParams } = req.body;

    const data = await qianfanRequest("/chat/completions", "POST", {
      model,
      messages,
      ...otherParams,
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({
      error: "文本生成失败",
      message: error.response?.data?.error?.message || error.message,
    });
  }
});

// 3. 续写接口
app.post("/api/qianfan/completions", async (req, res) => {
  try {
    const {
      prompt,
      model = "qwen3-coder-480b-a35b-instruct",
      ...otherParams
    } = req.body;

    const data = await qianfanRequest("/completions", "POST", {
      model,
      prompt,
      ...otherParams,
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({
      error: "续写失败",
      message: error.response?.data?.error?.message || error.message,
    });
  }
});

// 4. 视觉理解接口
app.post("/api/qianfan/vision", async (req, res) => {
  try {
    const {
      messages,
      model = "qwen2.5-vl-7b-instruct",
      ...otherParams
    } = req.body;

    const data = await qianfanRequest("/chat/completions", "POST", {
      model,
      messages,
      ...otherParams,
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({
      error: "视觉理解失败",
      message: error.response?.data?.error?.message || error.message,
    });
  }
});

// 5. 向量接口
app.post("/api/qianfan/embeddings", async (req, res) => {
  try {
    const { input, model = "embedding-v1", ...otherParams } = req.body;

    const data = await qianfanRequest("/embeddings", "POST", {
      model,
      input,
      ...otherParams,
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({
      error: "向量生成失败",
      message: error.response?.data?.error?.message || error.message,
    });
  }
});

// 6. 重排序接口
app.post("/api/qianfan/rerank", async (req, res) => {
  try {
    const {
      query,
      documents,
      model = "bce-reranker-base",
      ...otherParams
    } = req.body;

    const data = await qianfanRequest("/rerank", "POST", {
      model,
      query,
      documents,
      ...otherParams,
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({
      error: "重排序失败",
      message: error.response?.data?.error?.message || error.message,
    });
  }
});

// ========== 用户对话数据管理 API ==========

// 保存用户对话消息
app.post("/api/users/:userId/conversations", async (req, res) => {
  try {
    const { userId } = req.params;
    const { message, sender, characterId } = req.body;

    const conversation = await prisma.conversation.create({
      data: {
        userId,
        message,
        sender,
        characterId: characterId ? parseInt(characterId) : null,
        timestamp: new Date(),
      },
    });

    res.json({ success: true, data: conversation });
  } catch (error) {
    console.error("保存对话失败:", error);
    res.status(500).json({ error: "保存对话失败" });
  }
});

// 获取用户的对话历史
app.get("/api/users/:userId/conversations", async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const conversations = await prisma.conversation.findMany({
      where: { userId },
      orderBy: { timestamp: "desc" },
      take: parseInt(limit),
      skip: parseInt(offset),
    });

    res.json(conversations);
  } catch (error) {
    console.error("获取对话历史失败:", error);
    res.status(500).json({ error: "获取对话历史失败" });
  }
});

// 删除用户的对话历史
app.delete("/api/users/:userId/conversations", async (req, res) => {
  try {
    const { userId } = req.params;

    await prisma.conversation.deleteMany({
      where: { userId },
    });

    res.json({ success: true });
  } catch (error) {
    console.error("删除对话历史失败:", error);
    res.status(500).json({ error: "删除对话历史失败" });
  }
});

// todo：模拟对话接口
app.post("/api/chat", (req, res) => {
  const { characterId, message, scenarioId } = req.body;

  // todo:模拟AI回复, 后期可接入真实AI服务
  const replies = [
    "你好！很高兴和你聊天！",
    "这是一个很有趣的话题！",
    "我明白你的意思了。",
    "让我们继续聊下去吧！",
  ];

  const randomReply = replies[Math.floor(Math.random() * replies.length)];

  res.json({
    reply: randomReply,
    timestamp: new Date().toISOString(),
  });
});

// 获取用户的角色列表
app.get("/api/users/:userId/characters", async (req, res) => {
  try {
    const { userId } = req.params;

    const userCharacters = await prisma.userCharacter.findMany({
      where: { userId },
      include: { character: true },
      orderBy: { addedAt: "desc" },
    });

    const formattedCharacters = userCharacters.map((uc) => ({
      id: uc.character.id.toString(),
      name: uc.character.name,
      avatar: uc.character.avatar,
      category: uc.character.category,
      description: uc.character.description || "",
      tags: JSON.parse(uc.character.tags),
      popularity: uc.character.popularity,
      isDefault: uc.isDefault,
    }));

    res.json(formattedCharacters);
  } catch (error) {
    console.error("获取用户角色列表失败:", error);
    res.status(500).json({ error: "服务器错误" });
  }
});

// 获取用户的收藏列表
app.get("/api/users/:userId/favorites", async (req, res) => {
  try {
    const { userId } = req.params;

    const userFavorites = await prisma.userFavorite.findMany({
      where: { userId },
      include: { character: true },
      orderBy: { favoritedAt: "desc" },
    });

    const formattedCharacters = userFavorites.map((uf) => ({
      id: uf.character.id.toString(),
      name: uf.character.name,
      avatar: uf.character.avatar,
      category: uf.character.category,
      description: uf.character.description || "",
      tags: JSON.parse(uf.character.tags),
      popularity: uf.character.popularity,
    }));

    res.json(formattedCharacters);
  } catch (error) {
    console.error("获取用户收藏列表失败:", error);
    res.status(500).json({ error: "服务器错误" });
  }
});

// 添加角色到"我的角色"
app.post("/api/users/:userId/characters", async (req, res) => {
  try {
    const { userId } = req.params;
    const { characterId, setAsDefault } = req.body;

    // 检查是否已存在
    const existing = await prisma.userCharacter.findUnique({
      where: {
        userId_characterId: {
          userId,
          characterId: parseInt(characterId),
        },
      },
    });

    if (existing) {
      return res.status(400).json({ error: "角色已添加" });
    }

    // 如果设置为默认，先取消其他默认角色
    if (setAsDefault) {
      await prisma.userCharacter.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    // 添加角色
    const userCharacter = await prisma.userCharacter.create({
      data: {
        userId,
        characterId: parseInt(characterId),
        isDefault: setAsDefault || false,
      },
    });

    res.json({ success: true, data: userCharacter });
  } catch (error) {
    console.error("添加角色失败:", error);
    res.status(500).json({ error: "服务器错误" });
  }
});

// 从"我的角色"移除角色
app.delete("/api/users/:userId/characters/:characterId", async (req, res) => {
  try {
    const { userId, characterId } = req.params;

    await prisma.userCharacter.deleteMany({
      where: {
        userId,
        characterId: parseInt(characterId),
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error("移除角色失败:", error);
    res.status(500).json({ error: "服务器错误" });
  }
});

// 添加角色到收藏
app.post("/api/users/:userId/favorites", async (req, res) => {
  try {
    const { userId } = req.params;
    const { characterId } = req.body;

    // 检查是否已收藏
    const existing = await prisma.userFavorite.findUnique({
      where: {
        userId_characterId: {
          userId,
          characterId: parseInt(characterId),
        },
      },
    });

    if (existing) {
      return res.status(400).json({ error: "角色已收藏" });
    }

    // 添加收藏
    const userFavorite = await prisma.userFavorite.create({
      data: {
        userId,
        characterId: parseInt(characterId),
      },
    });

    res.json({ success: true, data: userFavorite });
  } catch (error) {
    console.error("收藏角色失败:", error);
    res.status(500).json({ error: "服务器错误" });
  }
});

// 从收藏移除角色
app.delete("/api/users/:userId/favorites/:characterId", async (req, res) => {
  try {
    const { userId, characterId } = req.params;

    await prisma.userFavorite.deleteMany({
      where: {
        userId,
        characterId: parseInt(characterId),
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error("取消收藏失败:", error);
    res.status(500).json({ error: "服务器错误" });
  }
});

// 设置默认角色（首页显示）
app.put(
  "/api/users/:userId/characters/:characterId/default",
  async (req, res) => {
    try {
      const { userId, characterId } = req.params;

      // 先取消所有默认角色
      await prisma.userCharacter.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });

      // 设置新的默认角色
      const updated = await prisma.userCharacter.updateMany({
        where: {
          userId,
          characterId: parseInt(characterId),
        },
        data: { isDefault: true },
      });

      if (updated.count === 0) {
        return res.status(404).json({ error: "角色未找到" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("设置默认角色失败:", error);
      res.status(500).json({ error: "服务器错误" });
    }
  },
);

// ========== 百度翻译 API 接口 ==========

// 百度翻译接口
app.post("/api/translate", async (req, res) => {
  try {
    const { q, from = "auto", to = "zh" } = req.body;

    // 验证参数
    if (!q) {
      return res.status(400).json({ error: "缺少翻译文本参数 q" });
    }

    if (to === "auto") {
      return res.status(400).json({ error: "目标语言不能设置为 auto" });
    }

    if (q.length > 6000) {
      return res
        .status(400)
        .json({ error: "文本长度超过限制（最多6000字符）" });
    }

    // 从环境变量获取百度翻译配置
    // 尝试使用 BAIDU_APPID 作为 APPID
    const BAIDU_APPID = process.env.BAIDU_APPID || process.env.BAIDU_API_KEY;
    const BAIDU_SECRET_KEY = process.env.BAIDU_SECRET_KEY;

    if (!BAIDU_APPID || !BAIDU_SECRET_KEY) {
      return res.status(500).json({ error: "百度翻译 API 配置缺失" });
    }

    console.log(`\n=== 百度翻译请求 ===`);
    console.log(`APPID: ${BAIDU_APPID}`);
    console.log(`Secret Key: ${BAIDU_SECRET_KEY}`);
    console.log(`文本: ${q.substring(0, 50)}${q.length > 50 ? "..." : ""}`);
    console.log(`源语言: ${from}, 目标语言: ${to}`);

    // 生成随机数 salt
    const salt = Date.now().toString();

    // 生成签名：appid+q+salt+密钥 的 MD5 值
    const crypto = require("crypto");
    const signStr = BAIDU_APPID + q + salt + BAIDU_SECRET_KEY;
    const sign = crypto.createHash("md5").update(signStr).digest("hex");

    console.log(`Salt: ${salt}`);
    console.log(`Sign: ${sign}`);

    // 调用百度翻译 API（通用翻译API）
    // 使用 GET 或 POST 方式，参数需要 URL encode
    const params = new URLSearchParams({
      q: q,
      from: from,
      to: to,
      appid: BAIDU_APPID,
      salt: salt,
      sign: sign,
    });

    const response = await axios.get(
      `https://fanyi-api.baidu.com/api/trans/vip/translate?${params.toString()}`,
    );

    const data = response.data;
    console.log("百度翻译响应:", JSON.stringify(data, null, 2));

    // 检查是否有错误
    if (data.error_code) {
      return res.status(400).json({
        error: "翻译失败",
        message: data.error_msg || `错误码：${data.error_code}`,
        error_code: data.error_code,
      });
    }

    // 返回翻译结果
    res.json(data);
  } catch (error) {
    console.error("百度翻译失败:", error.message);
    if (error.response) {
      console.error("API 响应错误:", error.response.data);
      res.status(error.response.status).json({
        error: "翻译失败",
        message: error.response.data?.error_msg || error.message,
        error_code: error.response.data?.error_code,
      });
    } else {
      res.status(500).json({
        error: "翻译服务异常",
        message: error.message,
      });
    }
  }
});

// ========== 词典 API 接口 ==========

const {
  getWordFromLocal,
  initializeLocalDictionary,
  getWordsByTag,
} = require("./localDictionary");

// 获取单词列表（根据标签/单词本类型）
app.get("/api/vocabulary/words", async (req, res) => {
  try {
    const { bookType, limit = 100 } = req.query;
    const parsedLimit = parseInt(limit);
    console.log(
      `\n=== 获取单词列表: bookType=${bookType}, limit=${parsedLimit === 0 ? "不限制" : parsedLimit} ===`,
    );

    // 根据单词本类型映射到标签
    const tagMap = {
      初一: "zk",
      初二: "zk",
      初三: "zk",
      高一: "gk",
      高二: "gk",
      高三: "gk",
      四级: "cet4",
      六级: "cet6",
      雅思: "ielts",
      托福: "toefl",
    };

    const tag = tagMap[bookType] || "zk";
    console.log(`映射标签: ${bookType} -> ${tag}`);

    // 从数据库获取单词列表（limit为0时获取所有单词）
    const words = await getWordsByTag(tag, parsedLimit);
    console.log(`找到 ${words.length} 个单词`);

    // 格式化返回数据
    const formattedWords = words.map((word, index) => ({
      id: (index + 1).toString(),
      word: word.word,
      phonetic: word.phonetic || `/${word.word}/`,
      translation: word.translation || "暂无翻译",
      example: word.detail
        ? JSON.parse(word.detail).example
        : `Example sentence with ${word.word}.`,
      definition: word.definition,
      pos: word.pos,
      collins: word.collins,
      oxford: word.oxford,
      tag: word.tag,
    }));

    res.json(formattedWords);
  } catch (error) {
    console.error("获取单词列表失败:", error);
    res.status(500).json({ error: "获取单词列表失败" });
  }
});

// 获取每日一词（从少儿单词库随机选择）
app.get("/api/dictionary/daily-word", async (req, res) => {
  try {
    console.log("\n=== 获取每日一词（少儿版） ===");

    // 从少儿单词库随机选择一个单词
    // 优先选择幼儿和小学低年级单词（grade 0-3）
    const childWordCount = await prisma.childWord.count({
      where: {
        grade: {
          lte: 3, // 幼儿到小学三年级
        },
      },
    });

    if (childWordCount === 0) {
      // 如果没有低年级单词，从所有少儿单词中选择
      const totalCount = await prisma.childWord.count();
      if (totalCount === 0) {
        console.log("少儿单词库为空，返回默认单词");
        return res.json({
          word: "cat",
          phonetic: "/kæt/",
          translation: "猫",
          example: "I have a cat.",
          source: "fallback",
        });
      }

      const randomIndex = Math.floor(Math.random() * totalCount);
      const randomWord = await prisma.childWord.findMany({
        skip: randomIndex,
        take: 1,
      });

      if (randomWord.length > 0) {
        console.log("每日一词:", randomWord[0].word);
        return res.json({
          word: randomWord[0].word,
          phonetic: randomWord[0].phonetic,
          translation: randomWord[0].translation,
          example: `This is ${randomWord[0].word}.`,
          pos: randomWord[0].pos,
          grade: randomWord[0].grade,
          source: "child-local",
        });
      }
    }

    // 从低年级单词中随机选择
    const randomIndex = Math.floor(Math.random() * childWordCount);
    const randomWord = await prisma.childWord.findMany({
      where: {
        grade: {
          lte: 3,
        },
      },
      skip: randomIndex,
      take: 1,
    });

    if (randomWord.length > 0) {
      console.log("每日一词:", randomWord[0].word, `(${randomWord[0].grade === 0 ? '幼儿' : '小学' + randomWord[0].grade + '年级'})`);
      return res.json({
        word: randomWord[0].word,
        phonetic: randomWord[0].phonetic,
        translation: randomWord[0].translation,
        example: `This is ${randomWord[0].word}.`,
        pos: randomWord[0].pos,
        grade: randomWord[0].grade,
        source: "child-local",
      });
    }

    // 如果都失败，返回默认单词
    res.json({
      word: "cat",
      phonetic: "/kæt/",
      translation: "猫",
      example: "I have a cat.",
      source: "fallback",
    });
  } catch (error) {
    console.error("获取每日一词失败:", error.message);
    res.status(500).json({ error: "获取每日一词失败" });
  }
});

// 获取单词详细信息（优先使用本地词典，失败时使用有道API）
app.get("/api/dictionary/:word", async (req, res) => {
  try {
    const { word } = req.params;
    console.log(`\n=== 查询单词: ${word} ===`);

    // 1. 优先从本地词典查询
    console.log("尝试从本地词典查询...");
    const localResult = await getWordFromLocal(word);

    if (localResult) {
      console.log("本地词典查询成功:", localResult);
      const result = {
        word: localResult.word,
        phonetic: localResult.phonetic || `/${word}/`,
        translation: localResult.translation || "暂无翻译",
        example: localResult.example || `Example sentence with ${word}.`,
        definition: localResult.definition,
        pos: localResult.pos,
        collins: localResult.collins,
        oxford: localResult.oxford,
        tag: localResult.tag,
        source: "local", // 标记数据来源
      };
      return res.json(result);
    }

    console.log("本地词典未找到，尝试使用有道API...");
  } catch (error) {
    console.error("获取单词详情失败:", error.message);
    res.status(500).json({ error: "获取单词详情失败" });
  }
});

// 数据库初始化函数
async function initializeDatabase() {
  try {
    const count = await prisma.character.count();

    // 如果数据库为空，插入默认数据
    if (count === 0) {
      console.log("数据库为空，正在插入默认角色数据...");

      for (const char of characters) {
        await prisma.character.create({
          data: {
            name: char.name,
            avatar: char.avatar,
            category: char.category,
            description: char.description,
            tags: JSON.stringify(char.tags),
            popularity: char.popularity,
          },
        });
      }

      console.log("默认角色数据已插入");
    } else {
      console.log(`数据库中已有 ${count} 个角色`);
    }

    // 初始化本地词典
    const wordCount = await prisma.word.count();
    if (wordCount === 0) {
      console.log("本地词典为空，正在初始化示例数据...");
      await initializeLocalDictionary();
    } else {
      console.log(`本地词典中已有 ${wordCount} 个单词`);
    }
  } catch (error) {
    console.error("数据库初始化失败:", error);
  }
}

// 启动服务器
app.listen(PORT, async () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  await initializeDatabase();
});
