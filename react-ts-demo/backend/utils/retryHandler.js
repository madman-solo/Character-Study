/**
 * 重试处理器 - 实现指数退避重试策略
 * 用于处理 API 请求失败的重试逻辑
 */

class RetryHandler {
  constructor(options = {}) {
    this.maxRetries = options.maxRetries || 5; // 最大重试次数（增加到5次）
    this.baseDelay = options.baseDelay || 3000; // 基础延迟（增加到3秒）
    this.maxDelay = options.maxDelay || 60000; // 最大延迟（增加到60秒）
    this.retryableErrors = options.retryableErrors || [
      'rpm_rate_limit_exceeded',
      'tpm_rate_limit_exceeded',
      'rate_limit_exceeded',
      'Rate limit reached for RPM',
      'Rate limit reached for TPM',
      'ECONNRESET',
      'ETIMEDOUT',
      'ENOTFOUND'
    ];
  }

  /**
   * 执行带重试的请求
   * @param {Function} requestFn - 要执行的请求函数
   * @param {Object} context - 请求上下文信息（用于日志）
   * @returns {Promise} 请求结果
   */
  async executeWithRetry(requestFn, context = {}) {
    let lastError;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const result = await requestFn();

        if (attempt > 0) {
          console.log(`[重试成功] ${context.name || '请求'} 在第 ${attempt} 次重试后成功`);
        }

        return result;
      } catch (error) {
        lastError = error;

        // 检查是否是可重试的错误
        const errorCode = error.response?.data?.error?.code || error.code;
        const errorMessage = error.response?.data?.error?.message || error.message || '';

        // 检查错误代码或错误消息是否匹配可重试错误
        const isRetryable = this.retryableErrors.some(retryableError => {
          return errorCode?.includes(retryableError) ||
                 errorMessage?.includes(retryableError);
        });

        // 如果不是可重试错误，或已达到最大重试次数，直接抛出
        if (!isRetryable || attempt === this.maxRetries) {
          if (attempt > 0) {
            console.error(`[重试失败] ${context.name || '请求'} 在 ${attempt} 次重试后仍然失败`);
            console.error(`错误详情: ${errorMessage || errorCode}`);
          }
          throw error;
        }

        // 计算延迟时间（指数退避）
        const delay = this.calculateDelay(attempt);

        console.log(
          `[重试] ${context.name || '请求'} 失败 (${errorMessage || errorCode}), ` +
          `${Math.ceil(delay / 1000)} 秒后进行第 ${attempt + 1} 次重试...`
        );

        await this.sleep(delay);
      }
    }

    throw lastError;
  }

  /**
   * 计算指数退避延迟时间
   */
  calculateDelay(attempt) {
    const exponentialDelay = this.baseDelay * Math.pow(2, attempt);
    const jitter = Math.random() * 1000; // 添加随机抖动
    return Math.min(exponentialDelay + jitter, this.maxDelay);
  }

  /**
   * 延迟函数
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = RetryHandler;
