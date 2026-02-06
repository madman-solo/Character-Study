/**
 * 少儿英语单词筛选和清洗脚本
 * 从 ecdict.csv 中筛选适合幼儿（3-6岁）和小学（1-6年级）的单词
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// 小学核心800词列表（新课标）- 扩展版本
const PRIMARY_CORE_WORDS = new Set([
  // 基础词汇（1-2年级）
  'a', 'about', 'after', 'all', 'am', 'an', 'and', 'animal', 'apple', 'are', 'art', 'at',
  'baby', 'back', 'bad', 'bag', 'ball', 'banana', 'bear', 'bed', 'bee', 'big', 'bike', 'bird',
  'black', 'blue', 'boat', 'book', 'box', 'boy', 'bread', 'brother', 'brown', 'bus', 'but', 'buy',
  'cake', 'can', 'car', 'cat', 'chair', 'chicken', 'child', 'city', 'class', 'clean', 'clock',
  'close', 'coat', 'cold', 'color', 'come', 'cook', 'cool', 'cow', 'cup', 'cut',
  'dad', 'dance', 'day', 'desk', 'do', 'doctor', 'dog', 'doll', 'door', 'down', 'draw', 'dress',
  'drink', 'drive', 'duck', 'ear', 'eat', 'egg', 'eight', 'eleven', 'eye',
  'face', 'family', 'farm', 'fast', 'fat', 'father', 'fine', 'fish', 'five', 'fly', 'food',
  'foot', 'for', 'four', 'friend', 'frog', 'from', 'fruit', 'fun', 'game', 'get', 'girl',
  'give', 'go', 'good', 'green', 'hair', 'hand', 'happy', 'has', 'hat', 'have', 'he', 'head',
  'hello', 'help', 'her', 'here', 'hi', 'home', 'horse', 'hot', 'house', 'how',
  'ice', 'in', 'is', 'it', 'jump', 'kite', 'know', 'leg', 'let', 'like', 'lion', 'little',
  'long', 'look', 'love', 'make', 'man', 'many', 'milk', 'mom', 'monkey', 'moon', 'mother',
  'mouth', 'my', 'name', 'new', 'nice', 'nine', 'no', 'nose', 'not', 'now', 'old', 'on',
  'one', 'open', 'orange', 'our', 'out', 'panda', 'park', 'pen', 'pig', 'pink', 'play',
  'please', 'rabbit', 'rain', 'read', 'red', 'rice', 'ride', 'run', 'sad', 'say', 'school',
  'see', 'seven', 'she', 'ship', 'shoe', 'short', 'sing', 'sister', 'sit', 'six', 'sleep',
  'small', 'snow', 'some', 'son', 'song', 'star', 'stop', 'sun', 'swim', 'table', 'tail',
  'take', 'tall', 'tea', 'teacher', 'ten', 'thank', 'that', 'the', 'they', 'thin', 'this',
  'three', 'tiger', 'time', 'to', 'today', 'toy', 'tree', 'twelve', 'two', 'under', 'up',
  'use', 'very', 'walk', 'want', 'warm', 'wash', 'watch', 'water', 'we', 'what', 'white',
  'who', 'window', 'with', 'wolf', 'write', 'yellow', 'yes', 'you', 'zoo',
  // 扩展词汇（3-6年级）
  'able', 'above', 'add', 'afraid', 'again', 'age', 'ago', 'air', 'also', 'always', 'angry',
  'any', 'arm', 'around', 'ask', 'away', 'bad', 'beach', 'bean', 'beautiful', 'because', 'become',
  'before', 'begin', 'behind', 'best', 'better', 'between', 'body', 'both', 'bottle', 'bowl',
  'bring', 'busy', 'call', 'candy', 'cap', 'card', 'care', 'carry', 'catch', 'change', 'cheap',
  'cheese', 'china', 'choose', 'circle', 'climb', 'clothes', 'cloud', 'cloudy', 'coat', 'coffee',
  'collect', 'colour', 'computer', 'could', 'count', 'country', 'cousin', 'cry', 'dark', 'date',
  'dear', 'delicious', 'did', 'die', 'different', 'difficult', 'dinner', 'dirty', 'does', 'dollar',
  'draw', 'dream', 'during', 'each', 'early', 'earth', 'easy', 'elephant', 'else', 'end', 'enjoy',
  'enough', 'evening', 'every', 'everyone', 'everything', 'excited', 'expensive', 'fall', 'famous',
  'far', 'farmer', 'feel', 'few', 'field', 'fight', 'find', 'finger', 'finish', 'fire', 'first',
  'floor', 'flower', 'follow', 'forget', 'fox', 'free', 'fresh', 'friday', 'full', 'funny',
  'garden', 'gift', 'glad', 'glass', 'glove', 'goat', 'gold', 'grade', 'grandfather', 'grandmother',
  'grass', 'great', 'group', 'grow', 'guess', 'gym', 'half', 'hard', 'hate', 'hear', 'heart',
  'heavy', 'high', 'hill', 'him', 'his', 'hobby', 'hold', 'holiday', 'hope', 'hour', 'hundred',
  'hungry', 'hurry', 'hurt', 'idea', 'if', 'ill', 'important', 'inside', 'into', 'invite',
  'jacket', 'job', 'join', 'juice', 'just', 'keep', 'key', 'kid', 'kind', 'king', 'kitchen',
  'knee', 'knife', 'lake', 'lamp', 'land', 'language', 'large', 'last', 'late', 'laugh', 'lazy',
  'learn', 'leave', 'left', 'lemon', 'lesson', 'letter', 'library', 'life', 'light', 'line',
  'listen', 'live', 'lonely', 'lose', 'lot', 'loud', 'low', 'luck', 'lunch', 'map', 'match',
  'may', 'maybe', 'me', 'meal', 'mean', 'meat', 'meet', 'melon', 'member', 'menu', 'middle',
  'mind', 'minute', 'miss', 'model', 'moment', 'monday', 'money', 'month', 'more', 'morning',
  'most', 'mountain', 'mouse', 'move', 'movie', 'much', 'museum', 'music', 'must', 'near',
  'neck', 'need', 'never', 'next', 'night', 'noise', 'noodle', 'noon', 'north', 'note',
  'nothing', 'notice', 'number', 'nurse', 'off', 'office', 'often', 'only', 'or', 'other',
  'outside', 'over', 'own', 'page', 'paint', 'pair', 'paper', 'parent', 'part', 'party',
  'pass', 'past', 'pay', 'peach', 'pear', 'people', 'person', 'phone', 'photo', 'piano',
  'pick', 'picture', 'piece', 'place', 'plan', 'plane', 'plant', 'plate', 'pocket', 'point',
  'police', 'pool', 'poor', 'popular', 'post', 'potato', 'practice', 'present', 'pretty',
  'price', 'problem', 'pull', 'purple', 'push', 'put', 'quarter', 'queen', 'question', 'quick',
  'quiet', 'quite', 'radio', 'rainy', 'ready', 'really', 'reason', 'remember', 'rest', 'rich',
  'right', 'ring', 'river', 'road', 'robot', 'rock', 'room', 'round', 'rule', 'safe', 'sale',
  'salt', 'same', 'sand', 'saturday', 'save', 'season', 'seat', 'second', 'sell', 'send',
  'sentence', 'set', 'shall', 'shape', 'share', 'sheep', 'shelf', 'shine', 'shirt', 'shop',
  'should', 'shout', 'show', 'sick', 'side', 'sign', 'simple', 'since', 'size', 'skirt', 'sky',
  'slow', 'smile', 'snowy', 'so', 'sock', 'soft', 'sometimes', 'sorry', 'sound', 'south',
  'space', 'speak', 'special', 'spend', 'spoon', 'sport', 'spring', 'square', 'stamp', 'stand',
  'start', 'station', 'stay', 'still', 'story', 'street', 'strong', 'student', 'study', 'subject',
  'such', 'sugar', 'summer', 'sunday', 'sunny', 'sure', 'surprise', 'sweet', 'table', 'talk',
  'taste', 'taxi', 'tell', 'test', 'than', 'their', 'them', 'then', 'there', 'these', 'thick',
  'thing', 'think', 'thirsty', 'those', 'through', 'throw', 'thursday', 'ticket', 'tidy', 'tired',
  'together', 'tomato', 'tomorrow', 'tonight', 'too', 'tooth', 'top', 'topic', 'touch', 'town',
  'train', 'travel', 'trip', 'trouble', 'trousers', 'true', 'try', 'tuesday', 'turn', 'tv',
  'umbrella', 'uncle', 'understand', 'until', 'us', 'usually', 'vegetable', 'village', 'visit',
  'voice', 'wait', 'wake', 'wall', 'way', 'weak', 'wear', 'weather', 'wednesday', 'week',
  'weekend', 'welcome', 'well', 'west', 'wet', 'when', 'where', 'which', 'while', 'why',
  'wide', 'wife', 'will', 'win', 'wind', 'windy', 'winter', 'wish', 'without', 'woman',
  'wonderful', 'word', 'work', 'world', 'worry', 'would', 'year', 'young', 'zero'
]);

// 幼儿阶段常见具象名词和动词
const KINDERGARTEN_WORDS = new Set([
  'mom', 'dad', 'cat', 'dog', 'pig', 'cow', 'bee', 'ant', 'egg', 'sun', 'moon', 'star',
  'eye', 'ear', 'nose', 'hand', 'foot', 'leg', 'arm', 'head', 'hat', 'cap', 'bag', 'box',
  'cup', 'pen', 'book', 'toy', 'ball', 'car', 'bus', 'bike', 'bed', 'door', 'tree', 'fish',
  'bird', 'duck', 'bear', 'lion', 'tiger', 'fox', 'wolf', 'frog', 'red', 'blue', 'big',
  'hot', 'cold', 'run', 'jump', 'sit', 'eat', 'go', 'see', 'look', 'come', 'play', 'sing',
  'dance', 'walk', 'stop', 'open', 'close', 'up', 'down', 'in', 'out', 'on', 'yes', 'no',
  'hi', 'bye', 'one', 'two', 'ten', 'boy', 'girl', 'baby', 'man', 'ice', 'cake', 'milk',
  'tea', 'rice', 'meat', 'soup', 'apple', 'pear', 'peach', 'grape', 'melon', 'lemon'
]);

// 词性映射
const POS_MAP = {
  'n.': 'n.',
  'v.': 'v.',
  'adj.': 'adj.',
  'noun': 'n.',
  'verb': 'v.',
  'adjective': 'adj.'
};

// 需要排除的词性
const EXCLUDED_POS = ['adv.', 'prep.', 'conj.', 'pron.', 'int.', 'art.', 'aux.'];

/**
 * 清洗音标格式
 */
function cleanPhonetic(phonetic) {
  if (!phonetic) return '';

  // 移除多余符号
  let cleaned = phonetic
    .replace(/[「」『』]/g, '')  // 移除中文引号
    .replace(/\s+/g, ' ')        // 统一空格
    .trim();

  // 确保格式为 /xxx/
  if (!cleaned.startsWith('/') && !cleaned.startsWith('[')) {
    cleaned = '/' + cleaned;
  }
  if (!cleaned.endsWith('/') && !cleaned.endsWith(']')) {
    cleaned = cleaned + '/';
  }

  // 统一使用 / /
  cleaned = cleaned.replace(/\[/g, '/').replace(/\]/g, '/');

  return cleaned;
}

/**
 * 简化中文释义
 */
function simplifyTranslation(translation, maxLength) {
  if (!translation) return '';

  // 移除词性标记和换行符
  let simplified = translation
    .replace(/\n/g, '; ')
    .replace(/[nvadjadvprepconjpronintartaux]\./g, '')
    .trim();

  // 提取第一个释义
  const parts = simplified.split(/[;；、]/);
  let firstMeaning = parts[0].trim();

  // 移除括号内容（通常是补充说明）
  firstMeaning = firstMeaning.replace(/[（(].*?[)）]/g, '').trim();

  // 移除"的"结尾（形容词常见）
  firstMeaning = firstMeaning.replace(/的$/, '');

  // 限制长度
  if (firstMeaning.length > maxLength) {
    firstMeaning = firstMeaning.substring(0, maxLength);
  }

  return firstMeaning;
}

/**
 * 提取词性
 */
function extractPOS(posString, translation) {
  if (!posString && !translation) return null;

  // 从 pos 字段提取
  if (posString) {
    const normalized = posString.toLowerCase().trim();
    if (POS_MAP[normalized]) {
      return POS_MAP[normalized];
    }
    // 检查是否包含排除的词性
    for (const excluded of EXCLUDED_POS) {
      if (normalized.includes(excluded)) {
        return null;
      }
    }
  }

  // 从 translation 中提取词性
  if (translation) {
    if (translation.includes('n.')) return 'n.';
    if (translation.includes('v.')) return 'v.';
    if (translation.includes('adj.')) return 'adj.';
  }

  return null;
}

/**
 * 判断是否为纯英文单词（无数字、符号、连字符）
 */
function isPureEnglish(word) {
  return /^[a-z]+$/i.test(word);
}

/**
 * 判断释义是否具象（适合幼儿）
 */
function isConcrete(translation) {
  // 排除抽象概念
  const abstractKeywords = ['概念', '理论', '主义', '性', '化', '度', '感', '观', '论', '学', '法'];
  for (const keyword of abstractKeywords) {
    if (translation.includes(keyword)) {
      return false;
    }
  }
  return true;
}

module.exports = {
  PRIMARY_CORE_WORDS,
  KINDERGARTEN_WORDS,
  cleanPhonetic,
  simplifyTranslation,
  extractPOS,
  isPureEnglish,
  isConcrete
};
