/**
 * 音频代理路由
 * 代理百度翻译的音频接口，避免前端CORS问题
 */

const express = require("express");
const axios = require("axios");
const router = express.Router();

/**
 * GET /api/audio/speak
 * 代理百度翻译音频接口
 *
 * Query参数:
 * - word: 要发音的单词（必需）
 * - lang: 语言类型，默认'en'（可选：en=英文, zh=中文）
 * - speed: 语速，默认4（可选：1-15）
 */
router.get("/speak", async (req, res) => {
  try {
    const { word, lang = "en", speed = 4 } = req.query;

    // 参数验证
    if (!word) {
      return res.status(400).json({
        success: false,
        error: "缺少必需参数: word",
      });
    }

    // 构建百度翻译音频URL
    const baiduUrl = `https://fanyi.baidu.com/gettts?lan=${lang}&text=${encodeURIComponent(word)}&spd=${speed}&source=web`;

    console.log(`[音频代理] 请求单词: ${word}, 语言: ${lang}, 语速: ${speed}`);
    console.log(`[音频代理] 百度URL: ${baiduUrl}`);

    // 请求百度翻译音频
    const response = await axios.get(baiduUrl, {
      responseType: "arraybuffer",
      timeout: 10000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    // 检查响应
    if (response.status === 200) {
      // 设置响应头
      res.set({
        "Content-Type": "audio/mpeg",
        "Content-Length": response.data.length,
        "Cache-Control": "public, max-age=86400", // 缓存24小时
        "Access-Control-Allow-Origin": "*", // 允许跨域
      });

      // 返回音频数据
      res.send(response.data);
      console.log(`[音频代理] 成功返回音频: ${word}`);
    } else {
      throw new Error(`百度API返回错误状态: ${response.status}`);
    }
  } catch (error) {
    console.error("[音频代理] 错误:", error.message);

    if (error.code === "ECONNABORTED") {
      return res.status(504).json({
        success: false,
        error: "请求超时，请稍后重试",
      });
    }

    res.status(500).json({
      success: false,
      error: "获取发音失败",
      message: error.message,
    });
  }
});

module.exports = router;
