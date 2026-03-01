/**
 * 情感分析服务
 * 使用百度千帆 API 进行情感分析
 */

export type SentimentType = 'positive' | 'negative' | 'neutral';

export type EmotionType =
  | 'happy'      // 开心
  | 'sad'        // 悲伤
  | 'angry'      // 愤怒
  | 'anxious'    // 焦虑
  | 'calm'       // 平静
  | 'excited'    // 兴奋
  | 'frustrated' // 沮丧
  | 'lonely'     // 孤独
  | 'confused'   // 困惑
  | 'hopeful';   // 充满希望

export interface EmotionAnalysis {
  sentiment: SentimentType;
  emotion: EmotionType;
  confidence: number;
  keywords: string[];
}

/**
 * 分析文本情感
 * 使用百度千帆 API 进行情感分析
 */
export async function analyzeEmotion(text: string): Promise<EmotionAnalysis> {
  console.log('\n=== 前端：开始情感分析 ===');
  console.log('分析文本:', text);

  try {
    console.log('发送请求到:', 'http://localhost:3001/api/qianfan/emotion');

    const response = await fetch('http://localhost:3001/api/qianfan/emotion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    console.log('响应状态:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('请求失败，响应内容:', errorText);
      throw new Error('情感分析请求失败');
    }

    const data = await response.json();
    console.log('情感分析结果:', data);
    return data;
  } catch (error) {
    console.error('情感分析错误:', error);
    // 返回默认值
    const defaultEmotion = {
      sentiment: 'neutral' as SentimentType,
      emotion: 'calm' as EmotionType,
      confidence: 0.5,
      keywords: [],
    };
    console.log('使用默认情感:', defaultEmotion);
    return defaultEmotion;
  }
}

/**
 * 根据情感分析结果生成个性化的系统提示词
 */
export function buildEmotionalPrompt(emotion: EmotionAnalysis): string {
  const basePrompt = `你是一个温暖、善解人意的倾听者。`;

  // 根据不同情绪调整回复策略
  const emotionStrategies: Record<EmotionType, string> = {
    happy: `用户现在心情不错。你应该：
- 分享用户的喜悦，给予真诚的祝贺
- 鼓励用户珍惜这份快乐
- 可以适当引导用户思考快乐的来源
- 保持轻松愉快的对话氛围`,

    sad: `用户现在感到悲伤。你应该：
- 给予温柔的安慰和理解
- 不要急于让用户"振作起来"，允许情绪的存在
- 用同理心倾听，让用户感到被理解
- 适时提醒用户：悲伤是正常的情绪，会慢慢好起来的`,

    angry: `用户现在感到愤怒。你应该：
- 首先认可用户的情绪："你有权利感到生气"
- 帮助用户表达和释放情绪
- 不要评判或试图说服用户"不要生气"
- 在用户情绪稍微平复后，可以引导理性思考`,

    anxious: `用户现在感到焦虑。你应该：
- 给予安抚和支持，让用户感到安全
- 帮助用户识别焦虑的具体来源
- 提醒用户：焦虑是对未知的正常反应
- 可以建议一些简单的放松方法（深呼吸、专注当下等）`,

    calm: `用户现在心态平和。你应该：
- 保持温和、平静的对话氛围
- 可以进行深入的交流和探讨
- 鼓励用户分享想法和感受
- 给予理性、客观的回应`,

    excited: `用户现在很兴奋。你应该：
- 分享用户的兴奋和热情
- 给予积极的回应和鼓励
- 可以帮助用户理清思路，将兴奋转化为行动
- 保持活跃、积极的对话节奏`,

    frustrated: `用户现在感到沮丧。你应该：
- 理解和认可用户的挫败感
- 帮助用户看到已经付出的努力
- 不要急于给建议，先倾听和理解
- 适时给予鼓励，但不要显得空洞`,

    lonely: `用户现在感到孤独。你应该：
- 给予温暖的陪伴，让用户感到"我在这里"
- 认可孤独感的真实性
- 帮助用户理解：孤独是人类共同的体验
- 用真诚的关心填补用户的情感空缺`,

    confused: `用户现在感到困惑。你应该：
- 帮助用户理清思路
- 通过提问引导用户自己找到答案
- 不要直接给出答案，而是陪伴用户探索
- 让用户感到：困惑是成长的一部分`,

    hopeful: `用户现在充满希望。你应该：
- 肯定用户的积极心态
- 鼓励用户保持这份希望
- 可以帮助用户将希望转化为具体的计划
- 给予支持和信心`,
  };

  const strategy = emotionStrategies[emotion.emotion] || emotionStrategies.calm;

  return `${basePrompt}

【当前用户情绪状态】
- 情感倾向：${emotion.sentiment === 'positive' ? '积极' : emotion.sentiment === 'negative' ? '消极' : '中性'}
- 具体情绪：${getEmotionLabel(emotion.emotion)}
- 置信度：${(emotion.confidence * 100).toFixed(0)}%

【回复策略】
${strategy}

【核心原则】
1. 提供一个安全、无评判的倾诉空间
2. 用温柔、理解的语气回应用户
3. 适时给予情感支持和鼓励
4. 不要给出具体建议，而是引导用户自己思考
5. 保持同理心，让用户感到被理解和接纳
6. 根据用户的情绪状态调整你的回应方式

请用自然、温暖的语气回应，不要让用户感觉到你在"分析"他们。`;
}

/**
 * 获取情绪的中文标签
 */
function getEmotionLabel(emotion: EmotionType): string {
  const labels: Record<EmotionType, string> = {
    happy: '开心',
    sad: '悲伤',
    angry: '愤怒',
    anxious: '焦虑',
    calm: '平静',
    excited: '兴奋',
    frustrated: '沮丧',
    lonely: '孤独',
    confused: '困惑',
    hopeful: '充满希望',
  };
  return labels[emotion];
}

/**
 * 保存情绪记录到数据库
 */
export async function saveEmotionRecord(
  userId: string,
  messageContent: string,
  emotion: EmotionAnalysis
): Promise<void> {
  try {
    await fetch('http://localhost:3001/api/emotion/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        messageContent,
        emotion: emotion.emotion,
        sentiment: emotion.sentiment,
        confidence: emotion.confidence,
        keywords: emotion.keywords,
      }),
    });
  } catch (error) {
    console.error('保存情绪记录失败:', error);
  }
}
