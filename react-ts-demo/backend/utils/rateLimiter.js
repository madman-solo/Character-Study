/**
 * 请求限流器 - 用于控制 API 请求频率
 * 解决千帆 API 的 RPM (Requests Per Minute) 限制问题
 */

class RateLimiter {
  constructor(maxRequests = 5, timeWindow = 60000, minInterval = 8000) {
    this.maxRequests = maxRequests; // 时间窗口内最大请求数（降低到5）
    this.timeWindow = timeWindow; // 时间窗口（毫秒）
    this.minInterval = minInterval; // 请求之间的最小间隔（8秒）
    this.queue = []; // 请求队列
    this.requestTimestamps = []; // 请求时间戳记录
    this.processing = false; // 是否正在处理队列
    this.lastRequestTime = 0; // 上次请求时间
  }

  /**
   * 添加请求到队列
   * @param {Function} requestFn - 要执行的请求函数
   * @returns {Promise} 请求结果
   */
  async enqueue(requestFn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ requestFn, resolve, reject });
      this.processQueue();
    });
  }

  /**
   * 处理请求队列
   */
  async processQueue() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const now = Date.now();

      // 清理过期的时间戳
      this.requestTimestamps = this.requestTimestamps.filter(
        (timestamp) => now - timestamp < this.timeWindow
      );

      // 检查是否达到限流阈值
      if (this.requestTimestamps.length >= this.maxRequests) {
        const oldestTimestamp = this.requestTimestamps[0];
        const waitTime = this.timeWindow - (now - oldestTimestamp);

        console.log(`[限流] 已达到请求上限 (${this.requestTimestamps.length}/${this.maxRequests})，等待 ${Math.ceil(waitTime / 1000)} 秒...`);
        await this.sleep(waitTime);
        continue;
      }

      // 检查距离上次请求的时间间隔
      const timeSinceLastRequest = now - this.lastRequestTime;
      if (this.lastRequestTime > 0 && timeSinceLastRequest < this.minInterval) {
        const intervalWait = this.minInterval - timeSinceLastRequest;
        console.log(`[限流] 请求间隔保护，等待 ${Math.ceil(intervalWait / 1000)} 秒...`);
        await this.sleep(intervalWait);
      }

      // 执行队列中的下一个请求
      const { requestFn, resolve, reject } = this.queue.shift();
      this.lastRequestTime = Date.now();
      this.requestTimestamps.push(this.lastRequestTime);

      try {
        const result = await requestFn();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }

    this.processing = false;
  }

  /**
   * 延迟函数
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * 获取当前队列状态
   */
  getStatus() {
    return {
      queueLength: this.queue.length,
      recentRequests: this.requestTimestamps.length,
      maxRequests: this.maxRequests,
      timeWindow: this.timeWindow,
    };
  }
}

module.exports = RateLimiter;
