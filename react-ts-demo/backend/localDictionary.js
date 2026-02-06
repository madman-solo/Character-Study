// 本地词典模块 - 基于开源词典数据
// 数据格式参考 ECDICT (https://github.com/skywind3000/ECDICT)

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// 简化的本地词典数据（先前示例数据，实际数据从ECDICT导入）
// 这里先提供一些常用单词作为示例
const localDictData = {
  // 初一常用词
  hello: {
    phonetic: "/həˈləʊ/",
    translation: "你好；喂",
    definition: "used as a greeting or to begin a phone conversation",
    pos: "int.",
    collins: 5,
    oxford: true,
    tag: "zk gk cet4",
    example: "Hello, how are you today?",
  },
  good: {
    phonetic: "/ɡʊd/",
    translation: "好的；优秀的",
    definition: "of high quality or level",
    pos: "adj.",
    collins: 5,
    oxford: true,
    tag: "zk gk cet4",
    example: "She is a good student.",
  },
  morning: {
    phonetic: "/ˈmɔːnɪŋ/",
    translation: "早晨；上午",
    definition: "the early part of the day",
    pos: "n.",
    collins: 5,
    oxford: true,
    tag: "zk gk cet4",
    example: "Good morning! Have a nice day.",
  },
  book: {
    phonetic: "/bʊk/",
    translation: "书；书籍",
    definition: "a written or printed work consisting of pages",
    pos: "n.",
    collins: 5,
    oxford: true,
    tag: "zk gk cet4",
    example: "I'm reading an interesting book.",
  },
  study: {
    phonetic: "/ˈstʌdi/",
    translation: "学习；研究",
    definition: "to learn about a subject",
    pos: "v.",
    collins: 5,
    oxford: true,
    tag: "zk gk cet4",
    example: "I study English every day.",
  },
  // 可以继续添加更多单词...
};

/**
 * 从本地词典获取单词信息
 * @param {string} word - 要查询的单词
 * @returns {Promise<Object|null>} 单词信息或null
 */
async function getWordFromLocal(word) {
  try {
    const lowerWord = word.toLowerCase();

    // 先从数据库查询
    const dbWord = await prisma.word.findUnique({
      where: { word: lowerWord },
    });

    if (dbWord) {
      return {
        word: dbWord.word,
        phonetic: dbWord.phonetic,
        translation: dbWord.translation,
        definition: dbWord.definition,
        pos: dbWord.pos,
        collins: dbWord.collins,
        oxford: dbWord.oxford,
        tag: dbWord.tag,
        example: dbWord.detail ? JSON.parse(dbWord.detail).example : null,
      };
    }

    // 如果数据库没有，从内存词典查询
    if (localDictData[lowerWord]) {
      return {
        word: lowerWord,
        ...localDictData[lowerWord],
      };
    }

    return null;
  } catch (error) {
    console.error("本地词典查询失败:", error);
    return null;
  }
}

/**
 * 批量导入单词到数据库
 * @param {Array} words - 单词数组
 */
async function importWordsToDatabase(words) {
  try {
    let successCount = 0;
    let skipCount = 0;

    for (const wordData of words) {
      try {
        // 检查单词是否已存在
        const existing = await prisma.word.findUnique({
          where: { word: wordData.word.toLowerCase() },
        });

        if (existing) {
          skipCount++;
          continue;
        }

        // 创建单词记录
        await prisma.word.create({
          data: {
            word: wordData.word.toLowerCase(),
            phonetic: wordData.phonetic || null,
            translation: wordData.translation || null,
            definition: wordData.definition || null,
            pos: wordData.pos || null,
            collins: wordData.collins || 0,
            oxford: wordData.oxford || false,
            tag: wordData.tag || null,
            bnc: wordData.bnc || null,
            frq: wordData.frq || null,
            exchange: wordData.exchange || null,
            detail: wordData.detail ? JSON.stringify(wordData.detail) : null,
            audio: wordData.audio || null,
          },
        });

        successCount++;
      } catch (error) {
        console.error(`导入单词 ${wordData.word} 失败:`, error.message);
      }
    }

    console.log(`导入完成: 成功 ${successCount} 个, 跳过 ${skipCount} 个`);
    return { successCount, skipCount };
  } catch (error) {
    console.error("批量导入失败:", error);
    throw error;
  }
}

/**
 * 初始化本地词典数据库
 * 将内存中的示例数据导入到数据库
 */
async function initializeLocalDictionary() {
  try {
    console.log("开始初始化本地词典...");

    const words = Object.entries(localDictData).map(([word, data]) => ({
      word,
      ...data,
      detail: { example: data.example },
    }));

    const result = await importWordsToDatabase(words);
    console.log("本地词典初始化完成:", result);

    return result;
  } catch (error) {
    console.error("初始化本地词典失败:", error);
    throw error;
  }
}

/**
 * 根据标签获取单词列表
 * @param {string} tag - 标签（如：zk, gk, cet4, cet6, ielts, toefl）
 * @param {number} limit - 限制数量（0表示不限制，获取所有单词）
 * @returns {Promise<Array>} 单词列表
 */
async function getWordsByTag(tag, limit = 100) {
  try {
    const queryOptions = {
      where: {
        tag: {
          contains: tag,
        },
      },
      orderBy: {
        frq: "desc", // 按词频排序
      },
    };

    // 如果 limit 为 0，则不限制数量，获取所有单词
    if (limit > 0) {
      queryOptions.take = limit;
    }

    const words = await prisma.word.findMany(queryOptions);

    return words;
  } catch (error) {
    console.error("按标签查询单词失败:", error);
    return [];
  }
}

module.exports = {
  getWordFromLocal,
  importWordsToDatabase,
  initializeLocalDictionary,
  getWordsByTag,
  localDictData,
};
