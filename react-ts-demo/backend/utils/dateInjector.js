/**
 * 日期注入工具函数（后端版本）
 * 用于在 AI 对话中注入当前日期时间信息，避免 AI 回答错误的时间
 */

/**
 * 获取当前日期时间信息
 */
function getCurrentDateInfo() {
  const now = new Date();
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
    weekday: weekdays[now.getDay()],
    hour: now.getHours(),
    minute: now.getMinutes(),
    second: now.getSeconds(),
    timestamp: now.getTime(),
    formatted: now.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }),
    dateOnly: `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`,
    timeOnly: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
  };
}

/**
 * 生成系统提示词中的日期时间信息
 */
function generateDatePrompt() {
  const dateInfo = getCurrentDateInfo();

  return `当前时间信息：
- 日期：${dateInfo.dateOnly}（${dateInfo.weekday}）
- 时间：${dateInfo.timeOnly}
- 完整时间：${dateInfo.formatted}

请注意：在回答问题时，如果涉及到时间相关的内容，请使用上述提供的当前时间信息。`;
}

/**
 * 为 AI 消息添加日期上下文
 * @param {string} systemPrompt 原始系统提示词
 * @returns {string} 添加了日期信息的系统提示词
 */
function injectDateContext(systemPrompt) {
  const datePrompt = generateDatePrompt();
  return `${systemPrompt}\n\n${datePrompt}`;
}

module.exports = {
  getCurrentDateInfo,
  generateDatePrompt,
  injectDateContext
};
