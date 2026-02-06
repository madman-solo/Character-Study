const API_BASE_URL = 'http://localhost:3001';

export interface TranslationResult {
  from: string;
  to: string;
  trans_result: Array<{
    src: string;
    dst: string;
  }>;
}

export interface TranslationError {
  error_code?: string;
  error_msg?: string;
}

/**
 * 调用百度翻译API进行文本翻译
 * @param query 要翻译的文本
 * @param from 源语言（可设置为'auto'自动检测）
 * @param to 目标语言（不可设置为'auto'）
 * @returns 翻译结果
 */
export async function translateText(
  query: string,
  from: string = 'auto',
  to: string = 'zh'
): Promise<TranslationResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: query,
        from,
        to,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '翻译请求失败');
    }

    const data = await response.json();

    // 检查是否有错误码
    if (data.error_code) {
      throw new Error(data.error_msg || `翻译失败，错误码：${data.error_code}`);
    }

    return data as TranslationResult;
  } catch (error) {
    console.error('Translation service error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('翻译服务异常，请稍后重试');
  }
}
