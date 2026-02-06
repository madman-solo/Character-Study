/**
 * 少儿单词处理主脚本
 * 从 ecdict.csv 筛选并清洗适合幼儿和小学的单词
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const {
  PRIMARY_CORE_WORDS,
  KINDERGARTEN_WORDS,
  cleanPhonetic,
  simplifyTranslation,
  extractPOS,
  isPureEnglish,
  isConcrete
} = require('./filterChildWords');

// 配置
const CSV_PATH = path.join(__dirname, '../ecdict.csv');
const OUTPUT_PATH = path.join(__dirname, 'childWords.json');

// 统计信息
const stats = {
  total: 0,
  kindergarten: 0,
  primary: [0, 0, 0, 0, 0, 0], // 小学1-6年级
  skipped: 0
};

// 存储筛选后的单词
const kindergartenWords = [];
const primaryWords = [[], [], [], [], [], []]; // 小学1-6年级

/**
 * 判断单词适合的年级（严格控制，确保高质量）
 */
function determineGrade(word, bnc, frq) {
  const len = word.length;
  const frequency = (bnc || 0) + (frq || 0);

  // 幼儿单词（2-4字母，必须在幼儿词表中）
  if (len >= 2 && len <= 4 && KINDERGARTEN_WORDS.has(word)) {
    return 0;
  }

  // 小学单词 - 严格要求：必须在核心词表中
  if (PRIMARY_CORE_WORDS.has(word) && len >= 2 && len <= 6) {
    // 根据单词长度和词频分配年级
    if (len <= 3) {
      if (frequency > 20000) return 1;      // 一年级：超高频短词
      if (frequency > 10000) return 2;      // 二年级：高频短词
      return 3;                             // 三年级：其他短词
    }

    if (len === 4) {
      if (frequency > 15000) return 2;      // 二年级：超高频4字母
      if (frequency > 8000) return 3;       // 三年级：高频4字母
      if (frequency > 3000) return 4;       // 四年级：中频4字母
      return 5;                             // 五年级：低频4字母
    }

    if (len === 5) {
      if (frequency > 10000) return 4;      // 四年级：高频5字母
      if (frequency > 5000) return 5;       // 五年级：中频5字母
      return 6;                             // 六年级：低频5字母
    }

    if (len === 6) {
      if (frequency > 8000) return 5;       // 五年级：高频6字母
      return 6;                             // 六年级：中频6字母
    }
  }

  return -1; // 不适合
}

/**
 * 简单CSV解析（处理引号）
 */
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);

  return result;
}

/**
 * 处理单行CSV数据
 */
function processLine(line) {
  stats.total++;

  // 跳过表头
  if (line.startsWith('word,')) return;

  // 解析CSV
  const parts = parseCSVLine(line);
  if (parts.length < 4) {
    stats.skipped++;
    return;
  }

  const word = parts[0].trim().toLowerCase().replace(/'/g, '');
  const phonetic = parts[1] || '';
  const definition = parts[2] || '';
  const translation = parts[3] || '';
  const pos = parts[4] || '';
  const bnc = parseInt(parts[8]) || 0;
  const frq = parseInt(parts[9]) || 0;

  // 基本过滤
  if (!word || !isPureEnglish(word)) {
    stats.skipped++;
    return;
  }

  // 判断年级（先判断，因为这是主要筛选条件）
  const grade = determineGrade(word, bnc, frq);
  if (grade === -1) {
    stats.skipped++;
    return;
  }

  // 提取词性（放宽条件：如果没有词性也尝试继续）
  let wordPOS = extractPOS(pos, translation);
  if (!wordPOS) {
    // 如果无法提取词性，根据单词特征猜测
    if (translation && translation.length > 0) {
      wordPOS = 'n.'; // 默认为名词
    } else {
      stats.skipped++;
      return;
    }
  }

  // 清洗数据
  const cleanedPhonetic = cleanPhonetic(phonetic);
  const maxLength = grade === 0 ? 5 : 10;
  const cleanedTranslation = simplifyTranslation(translation, maxLength);

  if (!cleanedTranslation) {
    stats.skipped++;
    return;
  }

  // 幼儿单词额外检查：必须具象
  if (grade === 0 && !isConcrete(cleanedTranslation)) {
    stats.skipped++;
    return;
  }

  // 构建单词对象
  const wordObj = {
    word,
    phonetic: cleanedPhonetic,
    translation: cleanedTranslation,
    pos: wordPOS,
    grade,
    bnc,
    frq
  };

  // 分类存储
  if (grade === 0) {
    kindergartenWords.push(wordObj);
    stats.kindergarten++;
  } else {
    primaryWords[grade - 1].push(wordObj);
    stats.primary[grade - 1]++;
  }
}

/**
 * 主处理函数
 */
async function processCSV() {
  console.log('开始处理 ecdict.csv...');
  console.log('CSV路径:', CSV_PATH);

  if (!fs.existsSync(CSV_PATH)) {
    console.error('错误: 找不到 ecdict.csv 文件');
    console.error('请确保文件位于:', CSV_PATH);
    process.exit(1);
  }

  const fileStream = fs.createReadStream(CSV_PATH, { encoding: 'utf8' });
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    processLine(line);

    // 每处理10000行显示进度
    if (stats.total % 10000 === 0) {
      console.log(`已处理 ${stats.total} 行...`);
    }
  }

  console.log('\n处理完成！');
  console.log('='.repeat(50));
  console.log('统计信息:');
  console.log(`总行数: ${stats.total}`);
  console.log(`跳过: ${stats.skipped}`);
  console.log(`幼儿单词 (3-6岁): ${stats.kindergarten}`);
  console.log(`小学一年级: ${stats.primary[0]}`);
  console.log(`小学二年级: ${stats.primary[1]}`);
  console.log(`小学三年级: ${stats.primary[2]}`);
  console.log(`小学四年级: ${stats.primary[3]}`);
  console.log(`小学五年级: ${stats.primary[4]}`);
  console.log(`小学六年级: ${stats.primary[5]}`);
  console.log(`总计筛选: ${stats.kindergarten + stats.primary.reduce((a, b) => a + b, 0)}`);
  console.log('='.repeat(50));

  // 保存结果
  const result = {
    kindergarten: kindergartenWords,
    primary: {
      grade1: primaryWords[0],
      grade2: primaryWords[1],
      grade3: primaryWords[2],
      grade4: primaryWords[3],
      grade5: primaryWords[4],
      grade6: primaryWords[5]
    },
    stats
  };

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(result, null, 2), 'utf8');
  console.log(`\n结果已保存到: ${OUTPUT_PATH}`);
}

// 运行
if (require.main === module) {
  processCSV().catch(console.error);
}

module.exports = { processCSV };
