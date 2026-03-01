/**
 * 统一的聊天服务层
 * 封装所有 AI 模型调用，支持不同场景使用不同模型
 */

export type ChatScene = 'home' | 'treehole' | 'custom' | 'daily' | 'english';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatOptions {
  scene: ChatScene;
  messages: ChatMessage[];
  systemPrompt?: string;
  characterName?: string;
  characterDescription?: string;
  onStream?: (chunk: string) => void;
}

export interface ChatResponse {
  content: string;
  error?: string;
}

/**
 * 根据场景获取对应的模型
 * 目前统一使用 ernie-speed-pro-128k，后续可以根据场景切换不同模型
 */
function getModelForScene(scene: ChatScene): string {
  const modelMap: Record<ChatScene, string> = {
    home: 'ernie-speed-pro-128k',
    treehole: 'ernie-speed-pro-128k',
    custom: 'ernie-speed-pro-128k',
    daily: 'ernie-speed-pro-128k',
    english: 'ernie-speed-pro-128k',
  };

  return modelMap[scene] || 'ernie-speed-pro-128k';
}

/**
 * 构建系统提示词
 */
function buildSystemPrompt(options: ChatOptions): string {
  if (options.systemPrompt) {
    return options.systemPrompt;
  }

  // 根据场景生成默认的系统提示词
  switch (options.scene) {
    case 'treehole':
      return `你是一个温暖、善解人意的倾听者。你的角色是：
1. 提供一个安全、无评判的倾诉空间
2. 用温柔、理解的语气回应用户
3. 适时给予情感支持和鼓励
4. 不要给出具体建议，而是引导用户自己思考
5. 保持同理心，让用户感到被理解和接纳`;

    case 'custom':
      return `你是用户自定义的陪伴角色。请根据对话背景和角色设定，提供温暖、真诚的陪伴。`;

    case 'english':
      return `You are a friendly English conversation partner and teacher. Your role is to help users practice English through natural daily conversations.

Core Rules:
1. Always respond in English (you may provide Chinese explanations in parentheses for difficult words if needed)
2. Act as a supportive language partner - be encouraging and patient
3. Correct grammar mistakes gently by rephrasing the correct form naturally in your response
4. Use simple, clear language appropriate for language learners
5. Ask follow-up questions to keep the conversation flowing
6. Simulate real-life conversation scenarios (greetings, daily activities, hobbies, etc.)
7. If the user makes a significant error, acknowledge it kindly: "I understand you mean... A better way to say this would be..."

Your goal: Make English learning natural, fun, and confidence-building through authentic conversation practice.`;

    case 'home':
    case 'daily':
    default:
      if (options.characterName && options.characterDescription) {
        return `你是${options.characterName}，${options.characterDescription}`;
      }
      return '你是一个友好的AI助手';
  }
}

/**
 * 调用千帆 API 进行对话
 */
export async function chat(options: ChatOptions): Promise<ChatResponse> {
  try {
    const model = getModelForScene(options.scene);
    const systemPrompt = buildSystemPrompt(options);

    // 构建完整的消息列表
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: systemPrompt,
      },
      ...options.messages,
    ];

    // 调用后端 API
    const response = await fetch('http://localhost:3001/api/qianfan/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages,
      }),
    });

    if (!response.ok) {
      throw new Error('API 请求失败');
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '抱歉，我现在无法回复。';

    return { content };
  } catch (error) {
    console.error('聊天服务错误:', error);
    return {
      content: '抱歉，消息发送失败。请检查网络连接。',
      error: error instanceof Error ? error.message : '未知错误',
    };
  }
}

/**
 * 流式对话（预留接口，后续实现）
 */
export async function chatStream(options: ChatOptions): Promise<ChatResponse> {
  // TODO: 实现流式响应
  // 目前先使用普通对话，后续可以升级为 SSE 或 WebSocket
  return chat(options);
}

/**
 * 保存对话消息到数据库
 */
export async function saveMessage(
  userId: string,
  message: string,
  sender: 'user' | 'character',
  scene?: ChatScene,
  characterId?: number
): Promise<void> {
  try {
    await fetch(`http://localhost:3001/api/users/${userId}/conversations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        sender,
        scene,
        characterId,
      }),
    });
  } catch (error) {
    console.error('保存消息失败:', error);
  }
}

/**
 * 获取对话历史
 */
export async function getConversationHistory(
  userId: string,
  limit: number = 50,
  scene?: ChatScene
): Promise<any[]> {
  try {
    const sceneParam = scene ? `&scene=${scene}` : '';
    const response = await fetch(
      `http://localhost:3001/api/users/${userId}/conversations?limit=${limit}${sceneParam}`
    );
    if (response.ok) {
      return await response.json();
    }
    return [];
  } catch (error) {
    console.error('获取对话历史失败:', error);
    return [];
  }
}

/**
 * 删除对话历史
 */
export async function deleteConversationHistory(userId: string, scene?: ChatScene): Promise<boolean> {
  try {
    const sceneParam = scene ? `?scene=${scene}` : '';
    const response = await fetch(
      `http://localhost:3001/api/users/${userId}/conversations${sceneParam}`,
      {
        method: 'DELETE',
      }
    );
    return response.ok;
  } catch (error) {
    console.error('删除对话历史失败:', error);
    return false;
  }
}

/**
 * 构建上下文消息（保留最近 N 轮对话）
 */
export function buildContextMessages(
  messages: Array<{ sender: string; content: string }>,
  maxRounds: number = 10
): ChatMessage[] {
  // 每轮对话包含用户消息和助手回复，所以取最后 maxRounds * 2 条消息
  const recentMessages = messages.slice(-maxRounds * 2);

  return recentMessages.map((msg) => ({
    role: msg.sender === 'user' ? 'user' : 'assistant',
    content: msg.content,
  }));
}
