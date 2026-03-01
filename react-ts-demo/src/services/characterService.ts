// 自定义角色管理服务

const API_BASE_URL = "http://localhost:3001/api";

export interface CustomCharacter {
  id: number;
  userId: string;
  name: string;
  avatar?: string;
  gender: "male" | "female" | "other";
  age?: string;
  personality: string;
  background?: string;
  speakingStyle?: string;
  hobbies: string[];
  traits: string[];
  systemPrompt: string;
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CharacterConversation {
  id: number;
  characterId: number;
  userId: string;
  userMessage: string;
  characterReply: string;
  emotion?: string;
  createdAt: string;
}

export interface CharacterMemory {
  id: number;
  characterId: number;
  userId: string;
  memoryType: "fact" | "preference" | "event";
  content: string;
  importance: number;
  createdAt: string;
  lastAccessedAt: string;
}

// 获取用户的所有自定义角色
export async function getUserCharacters(
  userId: string
): Promise<CustomCharacter[]> {
  const response = await fetch(`${API_BASE_URL}/characters/custom/${userId}`);
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || "获取角色列表失败");
  }
  return data.characters.map((char: any) => ({
    ...char,
    hobbies: JSON.parse(char.hobbies || "[]"),
    traits: JSON.parse(char.traits || "[]"),
  }));
}

// 创建新角色
export async function createCharacter(
  characterData: Omit<
    CustomCharacter,
    "id" | "systemPrompt" | "isActive" | "isDefault" | "createdAt" | "updatedAt"
  >
): Promise<CustomCharacter> {
  const response = await fetch(`${API_BASE_URL}/characters/custom`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(characterData),
  });
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || "创建角色失败");
  }
  return {
    ...data.character,
    hobbies: JSON.parse(data.character.hobbies || "[]"),
    traits: JSON.parse(data.character.traits || "[]"),
  };
}

// 更新角色
export async function updateCharacter(
  id: number,
  characterData: Partial<CustomCharacter>
): Promise<CustomCharacter> {
  const response = await fetch(`${API_BASE_URL}/characters/custom/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(characterData),
  });
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || "更新角色失败");
  }
  return {
    ...data.character,
    hobbies: JSON.parse(data.character.hobbies || "[]"),
    traits: JSON.parse(data.character.traits || "[]"),
  };
}

// 删除角色
export async function deleteCharacter(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/characters/custom/${id}`, {
    method: "DELETE",
  });
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || "删除角色失败");
  }
}

// 设置默认角色
export async function setDefaultCharacter(
  id: number,
  userId: string
): Promise<CustomCharacter> {
  const response = await fetch(
    `${API_BASE_URL}/characters/custom/${id}/set-default`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    }
  );
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || "设置默认角色失败");
  }
  return {
    ...data.character,
    hobbies: JSON.parse(data.character.hobbies || "[]"),
    traits: JSON.parse(data.character.traits || "[]"),
  };
}

// 保存对话记录
export async function saveConversation(
  characterId: number,
  userId: string,
  userMessage: string,
  characterReply: string,
  emotion?: string
): Promise<CharacterConversation> {
  const response = await fetch(`${API_BASE_URL}/characters/conversation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      characterId,
      userId,
      userMessage,
      characterReply,
      emotion,
    }),
  });
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || "保存对话记录失败");
  }
  return data.conversation;
}

// 获取对话历史
export async function getConversationHistory(
  characterId: number,
  userId: string,
  limit: number = 20
): Promise<CharacterConversation[]> {
  const response = await fetch(
    `${API_BASE_URL}/characters/${characterId}/conversations?userId=${userId}&limit=${limit}`
  );
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || "获取对话历史失败");
  }
  return data.conversations;
}

// 保存角色记忆
export async function saveMemory(
  characterId: number,
  userId: string,
  memoryType: "fact" | "preference" | "event",
  content: string,
  importance: number = 5
): Promise<CharacterMemory> {
  const response = await fetch(`${API_BASE_URL}/characters/memory`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      characterId,
      userId,
      memoryType,
      content,
      importance,
    }),
  });
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || "保存记忆失败");
  }
  return data.memory;
}

// 获取角色记忆
export async function getCharacterMemories(
  characterId: number,
  userId: string
): Promise<CharacterMemory[]> {
  const response = await fetch(
    `${API_BASE_URL}/characters/${characterId}/memories?userId=${userId}`
  );
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || "获取记忆失败");
  }
  return data.memories;
}
