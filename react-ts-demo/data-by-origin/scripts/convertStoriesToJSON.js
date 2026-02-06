/**
 * 将 CSV 格式的童话故事数据转换为 JSON 格式
 * 包含故事文本、问题和难度分类
 */

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// 故事集合配置
const COLLECTIONS = [
  'andersen-fairybook',
  'beatrix-potter-fairybook',
  'blue-fairybook',
  'chinese-fairybook',
  'first-round',
  'green-fairybook',
  'grimm-fairybook',
  'irish-fairybook',
  'japanese-fairybook',
  'lilac-fairybook',
  'native-american-fairybook',
  'norwegian-fairybook',
  'scottish-fairybook',
  'swedish-fairybook',
  'wonderclock-fairybook'
];

// 集合的中文名称映射
const COLLECTION_NAMES = {
  'andersen-fairybook': '安徒生童话',
  'beatrix-potter-fairybook': '彼得兔系列',
  'blue-fairybook': '蓝色童话集',
  'chinese-fairybook': '中国童话',
  'first-round': '经典故事',
  'green-fairybook': '绿色童话集',
  'grimm-fairybook': '格林童话',
  'irish-fairybook': '爱尔兰童话',
  'japanese-fairybook': '日本童话',
  'lilac-fairybook': '紫丁香童话集',
  'native-american-fairybook': '美洲原住民童话',
  'norwegian-fairybook': '挪威童话',
  'scottish-fairybook': '苏格兰童话',
  'swedish-fairybook': '瑞典童话',
  'wonderclock-fairybook': '奇妙时钟童话'
};

// 读取 CSV 文件
function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    if (!fs.existsSync(filePath)) {
      resolve(results);
      return;
    }

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

// 计算故事难度
function calculateDifficulty(sections, questions, collection) {
  // 根据集合设置基础难度偏向
  const easyCollections = [
    'beatrix-potter-fairybook',  // 彼得兔系列 - 幼儿故事
    'first-round'                 // 基础故事集
  ];

  const mediumCollections = [
    'andersen-fairybook',         // 安徒生童话
    'grimm-fairybook',            // 格林童话
    'blue-fairybook',
    'green-fairybook'
  ];

  let score = 0;

  // 1. 基于故事长度（30%权重）
  const totalWords = sections.reduce((sum, section) => {
    return sum + (section.text ? section.text.split(' ').length : 0);
  }, 0);

  if (totalWords < 500) score += 10;
  else if (totalWords < 900) score += 25;
  else if (totalWords < 1300) score += 35;
  else score += 45;

  // 2. 基于问题复杂度（40%权重）
  const implicitQuestions = questions.filter(q => q['ex-or-im1'] === 'implicit').length;
  const totalQuestions = questions.length;
  const implicitRatio = totalQuestions > 0 ? implicitQuestions / totalQuestions : 0;

  if (implicitRatio < 0.45) score += 15;
  else if (implicitRatio < 0.65) score += 30;
  else score += 45;

  // 3. 基于问题数量（30%权重）
  if (totalQuestions < 18) score += 10;
  else if (totalQuestions < 28) score += 25;
  else score += 35;

  // 4. 根据集合调整分数
  if (easyCollections.includes(collection)) {
    score -= 20; // 降低20分，更容易被归为简单
  } else if (mediumCollections.includes(collection)) {
    score -= 10; // 降低10分，更容易被归为中等
  }

  // 根据总分确定难度等级
  if (score <= 45) return 'easy';
  if (score <= 75) return 'medium';
  return 'hard';
}

// 生成故事标题的中文翻译（简单映射）
function generateChineseTitle(englishTitle) {
  const titleMap = {
    'brave-tin-soldier': '勇敢的锡兵',
    'little-mermaid': '小美人鱼',
    'ugly-duckling': '丑小鸭',
    'emperor-new-clothes': '皇帝的新装',
    'thumbelina': '拇指姑娘',
    'little-match-girl': '卖火柴的小女孩',
    'snow-queen': '冰雪女王',
    'peter-rabbit': '彼得兔',
    'three-little-pigs': '三只小猪',
    'goldilocks': '金发姑娘',
    'cinderella': '灰姑娘',
    'snow-white': '白雪公主',
    'red-riding-hood': '小红帽',
    'hansel-gretel': '糖果屋',
    'rapunzel': '长发公主'
  };

  // 如果有映射就用映射，否则用英文标题
  return titleMap[englishTitle] || englishTitle
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// 处理单个故事
async function processStory(collection, storyName) {
  const basePath = path.join(__dirname, '..');

  // 读取三个文件
  const sectionsPath = path.join(basePath, 'section-stories', collection, `${storyName}-story.csv`);
  const sentencesPath = path.join(basePath, 'sentence-stories', collection, `${storyName}-story.csv`);
  const questionsPath = path.join(basePath, 'questions', collection, `${storyName}-questions.csv`);

  const [sections, sentences, questions] = await Promise.all([
    readCSV(sectionsPath),
    readCSV(sentencesPath),
    readCSV(questionsPath)
  ]);

  if (sections.length === 0) {
    return null; // 跳过没有内容的故事
  }

  // 计算难度（传入collection参数）
  const difficulty = calculateDifficulty(sections, questions, collection);

  // 处理问题数据
  const processedQuestions = questions.map(q => ({
    id: q.question_id,
    type: q['local-or-sum'],
    section: q.cor_section,
    category: q.attribute1,
    question: q.question,
    answerType: q['ex-or-im1'],
    answers: [q.answer1, q.answer2, q.answer3, q.answer4, q.answer5, q.answer6]
      .filter(Boolean)
      .filter(a => a.trim() !== '')
  }));

  // 构建故事对象
  return {
    id: `${collection}-${storyName}`,
    slug: storyName,
    title: storyName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    titleCn: generateChineseTitle(storyName),
    collection: collection,
    collectionName: COLLECTION_NAMES[collection],
    difficulty: difficulty,
    sections: sections.map(s => ({
      number: parseInt(s.section),
      text: s.text
    })),
    sentences: sentences.map((s, idx) => ({
      id: idx + 1,
      text: s.text
    })),
    questions: processedQuestions,
    stats: {
      totalSections: sections.length,
      totalSentences: sentences.length,
      totalQuestions: questions.length,
      totalWords: sections.reduce((sum, s) => sum + (s.text ? s.text.split(' ').length : 0), 0)
    }
  };
}

// 获取集合中的所有故事
function getStoriesInCollection(collection) {
  const sectionsPath = path.join(__dirname, '..', 'section-stories', collection);

  if (!fs.existsSync(sectionsPath)) {
    return [];
  }

  const files = fs.readdirSync(sectionsPath);
  return files
    .filter(f => f.endsWith('-story.csv'))
    .map(f => f.replace('-story.csv', ''));
}

// 主函数
async function main() {
  console.log('开始转换故事数据...\n');

  const allStories = [];
  let processedCount = 0;
  let skippedCount = 0;

  for (const collection of COLLECTIONS) {
    console.log(`处理集合: ${COLLECTION_NAMES[collection]} (${collection})`);
    const stories = getStoriesInCollection(collection);

    for (const storyName of stories) {
      try {
        const story = await processStory(collection, storyName);
        if (story) {
          allStories.push(story);
          processedCount++;
          process.stdout.write(`  ✓ ${story.title} [${story.difficulty}]\n`);
        } else {
          skippedCount++;
        }
      } catch (error) {
        console.error(`  ✗ 处理失败: ${storyName}`, error.message);
        skippedCount++;
      }
    }
    console.log('');
  }

  // 按难度分组
  const storiesByDifficulty = {
    easy: allStories.filter(s => s.difficulty === 'easy'),
    medium: allStories.filter(s => s.difficulty === 'medium'),
    hard: allStories.filter(s => s.difficulty === 'hard')
  };

  // 生成统计信息
  const metadata = {
    totalStories: allStories.length,
    byDifficulty: {
      easy: storiesByDifficulty.easy.length,
      medium: storiesByDifficulty.medium.length,
      hard: storiesByDifficulty.hard.length
    },
    byCollection: COLLECTIONS.reduce((acc, col) => {
      acc[col] = allStories.filter(s => s.collection === col).length;
      return acc;
    }, {}),
    generatedAt: new Date().toISOString()
  };

  // 保存文件
  const outputDir = path.join(__dirname, '..', '..', 'public', 'stories-data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 保存完整数据
  fs.writeFileSync(
    path.join(outputDir, 'all-stories.json'),
    JSON.stringify(allStories, null, 2)
  );

  // 保存元数据
  fs.writeFileSync(
    path.join(outputDir, 'metadata.json'),
    JSON.stringify(metadata, null, 2)
  );

  // 保存按难度分类的索引（只包含基本信息，减小文件大小）
  const storyIndex = allStories.map(s => ({
    id: s.id,
    slug: s.slug,
    title: s.title,
    titleCn: s.titleCn,
    collection: s.collection,
    collectionName: s.collectionName,
    difficulty: s.difficulty,
    stats: s.stats
  }));

  fs.writeFileSync(
    path.join(outputDir, 'story-index.json'),
    JSON.stringify(storyIndex, null, 2)
  );

  console.log('\n=== 转换完成 ===');
  console.log(`✓ 成功处理: ${processedCount} 个故事`);
  console.log(`✗ 跳过: ${skippedCount} 个故事`);
  console.log(`\n难度分布:`);
  console.log(`  简单: ${storiesByDifficulty.easy.length} 个`);
  console.log(`  中等: ${storiesByDifficulty.medium.length} 个`);
  console.log(`  困难: ${storiesByDifficulty.hard.length} 个`);
  console.log(`\n输出文件:`);
  console.log(`  - all-stories.json (完整数据)`);
  console.log(`  - story-index.json (索引数据)`);
  console.log(`  - metadata.json (元数据)`);
}

main().catch(console.error);
