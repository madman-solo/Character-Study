// 单词服务 - 从本地数据库获取单词信息

interface WordDetail {
  id: string;
  word: string;
  phonetic: string;
  translation: string;
  example: string;
  definition?: string;
  pos?: string;
  collins?: number;
  oxford?: boolean;
  tag?: string;
}

// 从本地数据库获取单词列表（根据单词本类型）
// limit 参数：0 表示获取所有单词，大于 0 表示限制数量
export const fetchWordsByBookType = async (
  bookType: string,
  limit: number = 100,
): Promise<WordDetail[]> => {
  console.log(`Fetching words for book type: ${bookType}, limit: ${limit === 0 ? 'unlimited' : limit}`);

  try {
    const url = `http://localhost:3001/api/vocabulary/words?bookType=${encodeURIComponent(bookType)}&limit=${limit}`;
    console.log(`Fetching from URL: ${url}`);

    const response = await fetch(url);
    console.log(`Response status: ${response.status}`);

    if (response.ok) {
      const data = await response.json();
      console.log(`Received ${data.length} words for ${bookType}`);
      return data;
    }
  } catch (error) {
    console.error(`Failed to fetch words for ${bookType}:`, error);
  }

  // 如果 API 失败，返回空数组
  console.log(`Returning empty array for ${bookType}`);
  return [];
};

// 获取单个单词的详细信息（保留此函数以备需要）
export const fetchWordDetail = async (
  word: string,
  index: number,
): Promise<WordDetail> => {
  console.log(`Fetching word detail for: ${word}`);

  try {
    // 调用后端 API 获取单词详细信息
    const url = `http://localhost:3001/api/dictionary/${encodeURIComponent(word)}`;
    console.log(`Fetching from URL: ${url}`);

    const response = await fetch(url);
    console.log(`Response status: ${response.status}`);

    if (response.ok) {
      const data = await response.json();
      console.log(`Received data for ${word}:`, data);

      return {
        id: index.toString(),
        word: word,
        phonetic: data.phonetic || `/${word}/`,
        translation: data.translation || "暂无翻译",
        example: data.example || `Example sentence with ${word}.`,
        definition: data.definition,
        pos: data.pos,
        collins: data.collins,
        oxford: data.oxford,
        tag: data.tag,
      };
    }
  } catch (error) {
    console.error(`Failed to fetch word detail for ${word}:`, error);
  }

  // 如果 API 失败，返回基本信息
  console.log(`Returning fallback data for ${word}`);
  return {
    id: index.toString(),
    word: word,
    phonetic: `/${word}/`,
    translation: "暂无翻译（请配置词典API）",
    example: `Example sentence with ${word}.`,
  };
};

// 批量获取单词详细信息（保留此函数以备需要）
export const fetchWordsDetails = async (
  words: string[],
): Promise<WordDetail[]> => {
  const promises = words.map((word, index) => fetchWordDetail(word, index + 1));
  return Promise.all(promises);
};
