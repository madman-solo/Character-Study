const { PrismaClient } = require("@prisma/client");
const express = require("express");
const cors = require("cors");

const prisma = new PrismaClient();
const app = express();
const PORT = 3001;

// 中间件
app.use(cors());
app.use(express.json());

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
      orderBy: { popularity: 'desc' }
    });

    // 如果数据库为空，使用默认数据
    if (dbCharacters.length === 0) {
      const filtered = category
        ? characters.filter((char) => char.category === category)
        : characters;
      return res.json(filtered);
    }

    // 将数据库数据转换为前端格式
    const formattedCharacters = dbCharacters.map(char => ({
      id: char.id.toString(),
      name: char.name,
      avatar: char.avatar,
      category: char.category,
      description: char.description || "",
      tags: JSON.parse(char.tags),
      popularity: char.popularity
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
      const defaultCharacter = characters.find((char) => char.id === req.params.id);
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
      popularity: character.popularity
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
      orderBy: { addedAt: 'desc' }
    });

    const formattedCharacters = userCharacters.map(uc => ({
      id: uc.character.id.toString(),
      name: uc.character.name,
      avatar: uc.character.avatar,
      category: uc.character.category,
      description: uc.character.description || "",
      tags: JSON.parse(uc.character.tags),
      popularity: uc.character.popularity,
      isDefault: uc.isDefault
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
      orderBy: { favoritedAt: 'desc' }
    });

    const formattedCharacters = userFavorites.map(uf => ({
      id: uf.character.id.toString(),
      name: uf.character.name,
      avatar: uf.character.avatar,
      category: uf.character.category,
      description: uf.character.description || "",
      tags: JSON.parse(uf.character.tags),
      popularity: uf.character.popularity
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
          characterId: parseInt(characterId)
        }
      }
    });

    if (existing) {
      return res.status(400).json({ error: "角色已添加" });
    }

    // 如果设置为默认，先取消其他默认角色
    if (setAsDefault) {
      await prisma.userCharacter.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false }
      });
    }

    // 添加角色
    const userCharacter = await prisma.userCharacter.create({
      data: {
        userId,
        characterId: parseInt(characterId),
        isDefault: setAsDefault || false
      }
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
        characterId: parseInt(characterId)
      }
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
          characterId: parseInt(characterId)
        }
      }
    });

    if (existing) {
      return res.status(400).json({ error: "角色已收藏" });
    }

    // 添加收藏
    const userFavorite = await prisma.userFavorite.create({
      data: {
        userId,
        characterId: parseInt(characterId)
      }
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
        characterId: parseInt(characterId)
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error("取消收藏失败:", error);
    res.status(500).json({ error: "服务器错误" });
  }
});

// 设置默认角色（首页显示）
app.put("/api/users/:userId/characters/:characterId/default", async (req, res) => {
  try {
    const { userId, characterId } = req.params;

    // 先取消所有默认角色
    await prisma.userCharacter.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false }
    });

    // 设置新的默认角色
    const updated = await prisma.userCharacter.updateMany({
      where: {
        userId,
        characterId: parseInt(characterId)
      },
      data: { isDefault: true }
    });

    if (updated.count === 0) {
      return res.status(404).json({ error: "角色未找到" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("设置默认角色失败:", error);
    res.status(500).json({ error: "服务器错误" });
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
  } catch (error) {
    console.error("数据库初始化失败:", error);
  }
}

// 启动服务器
app.listen(PORT, async () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  await initializeDatabase();
});
