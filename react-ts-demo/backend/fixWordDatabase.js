// 修复单词数据库：清空旧数据并从ECDICT导入新数据
const { PrismaClient } = require("@prisma/client");
const { importFromECDICT } = require("./importECDICT");
const path = require("path");

const prisma = new PrismaClient();

async function fixWordDatabase() {
  try {
    console.log("=== 开始修复单词数据库 ===\n");

    // 1. 清空现有单词数据
    console.log("步骤 1: 清空现有单词数据...");
    const deleteResult = await prisma.word.deleteMany({});
    console.log(`已删除 ${deleteResult.count} 个单词\n`);

    // 2. 从ECDICT导入新数据
    console.log("步骤 2: 从ECDICT导入新数据...");
    const csvPath = path.join(__dirname, "..", "ecdict.csv");

    // 导入所有带标签的单词（zk, gk, cet4, cet6, ielts, toefl）
    console.log("导入所有考试相关单词（zk, gk, cet4, cet6, ielts, toefl）...\n");

    const result = await importFromECDICT(csvPath, {
      filterTags: ["zk", "gk", "cet4", "cet6", "ielts", "toefl"],
      batchSize: 1000,
      maxWords: null, // 导入所有匹配的单词
    });

    console.log("\n=== 修复完成 ===");
    console.log(`成功导入: ${result.importedCount} 个单词`);
    console.log(`跳过: ${result.skippedCount} 个`);
    console.log(`错误: ${result.errorCount} 个`);

    // 3. 验证导入结果
    console.log("\n步骤 3: 验证导入结果...");
    const tags = ["zk", "gk", "cet4", "cet6", "ielts", "toefl"];

    for (const tag of tags) {
      const count = await prisma.word.count({
        where: {
          tag: {
            contains: tag,
          },
        },
      });
      console.log(`  ${tag}: ${count} 个单词`);
    }

    console.log("\n✅ 数据库修复成功！");
  } catch (error) {
    console.error("\n❌ 修复失败:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 执行修复
if (require.main === module) {
  fixWordDatabase()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { fixWordDatabase };
