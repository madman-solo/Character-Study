/**
 * 少儿单词数据库导入脚本
 * 将筛选清洗后的单词导入 SQLite 数据库（Prisma ORM）
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
const INPUT_PATH = path.join(__dirname, 'childWords.json');

/**
 * 导入单词到数据库
 */
async function importChildWords() {
  console.log('开始导入少儿单词到数据库...');

  // 检查文件是否存在
  if (!fs.existsSync(INPUT_PATH)) {
    console.error('错误: 找不到 childWords.json 文件');
    console.error('请先运行: node processChildWords.js');
    process.exit(1);
  }

  // 读取数据
  const data = JSON.parse(fs.readFileSync(INPUT_PATH, 'utf8'));
  const { kindergarten, primary, stats } = data;

  console.log('\n数据统计:');
  console.log(`幼儿单词: ${kindergarten.length}`);
  console.log(`小学一年级: ${primary.grade1.length}`);
  console.log(`小学二年级: ${primary.grade2.length}`);
  console.log(`小学三年级: ${primary.grade3.length}`);
  console.log(`小学四年级: ${primary.grade4.length}`);
  console.log(`小学五年级: ${primary.grade5.length}`);
  console.log(`小学六年级: ${primary.grade6.length}`);

  // 合并所有单词
  const allWords = [
    ...kindergarten,
    ...primary.grade1,
    ...primary.grade2,
    ...primary.grade3,
    ...primary.grade4,
    ...primary.grade5,
    ...primary.grade6
  ];

  console.log(`\n总计: ${allWords.length} 个单词`);

  // 清空现有数据（可选）
  console.log('\n清空现有少儿单词数据...');
  await prisma.childWord.deleteMany({});

  // 批量导入（SQLite 不支持 createMany，使用逐个插入）
  console.log('开始批量导入...');
  let imported = 0;
  let failed = 0;

  for (let i = 0; i < allWords.length; i++) {
    const w = allWords[i];

    try {
      await prisma.childWord.create({
        data: {
          word: w.word,
          phonetic: w.phonetic,
          translation: w.translation,
          pos: w.pos,
          grade: w.grade,
          bnc: w.bnc || null,
          frq: w.frq || null
        }
      });

      imported++;

      // 每100个单词显示一次进度
      if (imported % 100 === 0 || imported === allWords.length) {
        console.log(`已导入 ${imported}/${allWords.length} (${Math.round(imported / allWords.length * 100)}%)`);
      }
    } catch (error) {
      // 跳过重复的单词
      if (error.code === 'P2002') {
        console.log(`跳过重复单词: ${w.word}`);
      } else {
        console.error(`导入单词 "${w.word}" 失败:`, error.message);
        failed++;
      }
    }
  }

  console.log('\n导入完成！');
  console.log('='.repeat(50));
  console.log(`成功导入: ${imported}`);
  console.log(`失败: ${failed}`);
  console.log('='.repeat(50));
}

/**
 * 验证导入结果
 */
async function verifyImport() {
  console.log('\n验证导入结果...');

  const total = await prisma.childWord.count();
  const byGrade = await prisma.childWord.groupBy({
    by: ['grade'],
    _count: true
  });

  console.log(`\n数据库中共有 ${total} 个少儿单词`);
  console.log('\n按年级分布:');
  byGrade.sort((a, b) => a.grade - b.grade).forEach(g => {
    const gradeName = g.grade === 0 ? '幼儿' : `小学${g.grade}年级`;
    console.log(`${gradeName}: ${g._count} 个单词`);
  });

  // 显示示例单词
  console.log('\n示例单词（幼儿）:');
  const kindergartenSamples = await prisma.childWord.findMany({
    where: { grade: 0 },
    take: 5
  });
  kindergartenSamples.forEach(w => {
    console.log(`  ${w.word} ${w.phonetic} - ${w.translation} (${w.pos})`);
  });

  console.log('\n示例单词（小学一年级）:');
  const grade1Samples = await prisma.childWord.findMany({
    where: { grade: 1 },
    take: 5
  });
  grade1Samples.forEach(w => {
    console.log(`  ${w.word} ${w.phonetic} - ${w.translation} (${w.pos})`);
  });
}

/**
 * 主函数
 */
async function main() {
  try {
    await importChildWords();
    await verifyImport();
  } catch (error) {
    console.error('导入过程出错:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// 运行
if (require.main === module) {
  main();
}

module.exports = { importChildWords, verifyImport };
