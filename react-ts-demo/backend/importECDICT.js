// 从ECDICT CSV文件导入单词数据到数据库
// 使用方法: node importECDICT.js [csv文件路径]
//
// ECDICT下载地址: https://github.com/skywind3000/ECDICT
// 推荐下载 stardict.csv 文件

const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const readline = require("readline");

const prisma = new PrismaClient();

// 标签映射（ECDICT标签 -> 我们的标签）
const tagMapping = {
  zk: "中考",
  gk: "高考",
  cet4: "四级",
  cet6: "六级",
  ky: "考研",
  ielts: "雅思",
  toefl: "托福",
  gre: "GRE",
};

/**
 * 解析CSV行（处理引号内的逗号）
 */
function parseCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

/**
 * 从ECDICT CSV导入单词
 * CSV格式: word, phonetic, definition, translation, pos, collins, oxford, tag, bnc, frq, exchange, detail, audio
 */
async function importFromECDICT(csvFilePath, options = {}) {
  const {
    batchSize = 1000, // 批量插入大小
    maxWords = null, // 最大导入数量（null表示全部）
    filterTags = null, // 只导入特定标签的单词（如：['zk', 'gk', 'cet4']）
  } = options;

  if (!fs.existsSync(csvFilePath)) {
    throw new Error(`文件不存在: ${csvFilePath}`);
  }

  console.log(`开始从 ${csvFilePath} 导入单词数据...`);
  console.log(`批量大小: ${batchSize}, 最大数量: ${maxWords || "无限制"}`);

  const fileStream = fs.createReadStream(csvFilePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let lineNumber = 0;
  let importedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  let batch = [];

  for await (const line of rl) {
    lineNumber++;

    // 跳过空行和注释
    if (!line.trim() || line.startsWith("#")) {
      continue;
    }

    // 跳过表头
    if (lineNumber === 1 && line.toLowerCase().includes("word")) {
      continue;
    }

    try {
      const fields = parseCSVLine(line);

      if (fields.length < 4) {
        console.warn(`第 ${lineNumber} 行格式错误，跳过`);
        skippedCount++;
        continue;
      }

      const [
        word,
        phonetic,
        definition,
        translation,
        pos,
        collins,
        oxford,
        tag,
        bnc,
        frq,
        exchange,
        detail,
        audio,
      ] = fields;

      // 过滤标签
      if (filterTags && filterTags.length > 0) {
        const wordTags = (tag || "").split(" ");
        const hasMatchingTag = filterTags.some((t) => wordTags.includes(t));
        if (!hasMatchingTag) {
          skippedCount++;
          continue;
        }
      }

      // 构建单词数据
      const wordData = {
        word: word.toLowerCase().trim(),
        phonetic: phonetic || null,
        translation: translation || null,
        definition: definition || null,
        pos: pos || null,
        collins: collins ? parseInt(collins) : 0,
        oxford: oxford === "1" || oxford === "true",
        tag: tag || null,
        bnc: bnc ? parseInt(bnc) : null,
        frq: frq ? parseInt(frq) : null,
        exchange: exchange || null,
        detail: detail || null,
        audio: audio || null,
      };

      batch.push(wordData);

      // 批量插入
      if (batch.length >= batchSize) {
        await insertBatch(batch);
        importedCount += batch.length;
        batch = [];

        console.log(`已导入 ${importedCount} 个单词...`);

        // 检查是否达到最大数量
        if (maxWords && importedCount >= maxWords) {
          console.log(`已达到最大导入数量 ${maxWords}，停止导入`);
          break;
        }
      }
    } catch (error) {
      console.error(`第 ${lineNumber} 行处理失败:`, error.message);
      errorCount++;
    }
  }

  // 插入剩余的批次
  if (batch.length > 0) {
    await insertBatch(batch);
    importedCount += batch.length;
  }

  console.log("\n导入完成!");
  console.log(`总计: ${importedCount} 个单词`);
  console.log(`跳过: ${skippedCount} 个`);
  console.log(`错误: ${errorCount} 个`);

  return { importedCount, skippedCount, errorCount };
}

/**
 * 批量插入单词到数据库
 */
async function insertBatch(words) {
  try {
    // 使用 createMany 批量插入，跳过重复的单词
    await prisma.word.createMany({
      data: words,
      skipDuplicates: true,
    });
  } catch (error) {
    console.error("批量插入失败:", error.message);
    // 如果批量插入失败，尝试逐个插入
    for (const word of words) {
      try {
        await prisma.word.upsert({
          where: { word: word.word },
          update: word,
          create: word,
        });
      } catch (err) {
        console.error(`插入单词 ${word.word} 失败:`, err.message);
      }
    }
  }
}

/**
 * 导入特定年级/考试的单词
 */
async function importByGrade(csvFilePath, grade) {
  const gradeTagMap = {
    初一: ["zk"],
    初二: ["zk"],
    初三: ["zk"],
    高一: ["gk"],
    高二: ["gk"],
    高三: ["gk"],
    四级: ["cet4"],
    六级: ["cet6"],
    考研: ["ky"],
    雅思: ["ielts"],
    托福: ["toefl"],
    GRE: ["gre"],
  };

  const tags = gradeTagMap[grade];
  if (!tags) {
    throw new Error(`不支持的年级: ${grade}`);
  }

  console.log(`导入 ${grade} 单词，标签: ${tags.join(", ")}`);

  return importFromECDICT(csvFilePath, {
    filterTags: tags,
    batchSize: 500,
  });
}

// 命令行执行
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("使用方法:");
    console.log("  node importECDICT.js <csv文件路径> [选项]");
    console.log("\n选项:");
    console.log("  --max <数量>        最大导入数量");
    console.log("  --grade <年级>      只导入特定年级（初一/初二/高一/四级等）");
    console.log("  --tags <标签>       只导入特定标签（用逗号分隔，如：zk,gk,cet4）");
    console.log("\n示例:");
    console.log("  node importECDICT.js stardict.csv");
    console.log("  node importECDICT.js stardict.csv --max 10000");
    console.log("  node importECDICT.js stardict.csv --grade 初一");
    console.log("  node importECDICT.js stardict.csv --tags zk,gk,cet4");
    process.exit(1);
  }

  const csvFilePath = args[0];
  const options = {};

  // 解析命令行参数
  for (let i = 1; i < args.length; i++) {
    if (args[i] === "--max" && args[i + 1]) {
      options.maxWords = parseInt(args[i + 1]);
      i++;
    } else if (args[i] === "--grade" && args[i + 1]) {
      const grade = args[i + 1];
      importByGrade(csvFilePath, grade)
        .then(() => {
          console.log("导入完成!");
          process.exit(0);
        })
        .catch((error) => {
          console.error("导入失败:", error);
          process.exit(1);
        });
      return;
    } else if (args[i] === "--tags" && args[i + 1]) {
      options.filterTags = args[i + 1].split(",");
      i++;
    }
  }

  // 执行导入
  importFromECDICT(csvFilePath, options)
    .then(() => {
      console.log("导入完成!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("导入失败:", error);
      process.exit(1);
    })
    .finally(() => {
      prisma.$disconnect();
    });
}

module.exports = {
  importFromECDICT,
  importByGrade,
};
