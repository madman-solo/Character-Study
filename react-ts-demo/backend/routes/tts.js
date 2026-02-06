/**
 * TTS（文本转语音）API路由
 * 支持多个TTS服务提供商：百度翻译、有道词典
 */

const express = require("express");
const crypto = require("crypto");
const axios = require("axios");
const router = express.Router();

// API配置
const YOUDAO_APP_KEY = process.env.YOUDAO_APP_KEY;
const YOUDAO_APP_SECRET = process.env.YOUDAO_APP_SECRET;
const BAIDU_APPID = process.env.BAIDU_APPID;
const BAIDU_SECRET_KEY = process.env.BAIDU_SECRET_KEY;

// API URLs
const YOUDAO_TTS_URL = "https://openapi.youdao.com/ttsapi";
const BAIDU_TTS_URL = "https://tsn.baidu.com/text2audio";

/**
 * 生成有道API签名
 */
function generateYoudaoSign(appKey, q, salt, appSecret) {
  const signStr = appKey + q + salt + appSecret;
  return crypto.createHash("md5").update(signStr).digest("hex");
}

/**
 * 生成百度API签名
 */
function generateBaiduSign(text, appid, salt, secretKey) {
  const signStr = appid + text + salt + secretKey;
  return crypto.createHash("md5").update(signStr).digest("hex");
}

/**
 * GET /api/tts/speak
 * 获取单词发音音频
 *
 * Query参数:
 * - word: 要发音的单词（必需）
 * - lang: 语言类型，默认'en'（可选：en=英文, zh=中文）
 * - provider: TTS提供商，默认'baidu'（可选：baidu, youdao）
 */
router.get("/speak", async (req, res) => {
  try {
    const { word, lang = "en", provider = "baidu" } = req.query;

    // 参数验证
    if (!word) {
      return res.status(400).json({
        success: false,
        error: "缺少必需参数: word",
      });
    }

    let audioData;

    // 根据提供商选择API
    if (provider === "baidu" && BAIDU_APPID && BAIDU_SECRET_KEY) {
      audioData = await getBaiduTTS(word, lang);
    } else if (provider === "youdao" && YOUDAO_APP_KEY && YOUDAO_APP_SECRET) {
      audioData = await getYoudaoTTS(word, lang);
    } else {
      // 默认尝试百度
      if (BAIDU_APPID && BAIDU_SECRET_KEY) {
        audioData = await getBaiduTTS(word, lang);
      } else if (YOUDAO_APP_KEY && YOUDAO_APP_SECRET) {
        audioData = await getYoudaoTTS(word, lang);
      } else {
        return res.status(500).json({
          success: false,
          error: "未配置TTS API密钥",
        });
      }
    }

    // 返回音频数据
    res.set({
      "Content-Type": "audio/mp3",
      "Content-Length": audioData.length,
      "Cache-Control": "public, max-age=86400", // 缓存24小时
    });
    res.send(audioData);
  } catch (error) {
    console.error("TTS API错误:", error.message);

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

/**
 * 获取百度TTS音频
 */
async function getBaiduTTS(text, lang) {
  const salt = Date.now().toString();
  const sign = generateBaiduSign(text, BAIDU_APPID, salt, BAIDU_SECRET_KEY);

  // 百度TTS参数
  const params = {
    tex: text, // 要合成的文本
    tok: sign, // 签名
    cuid: BAIDU_APPID, // 用户唯一标识
    ctp: 1, // 客户端类型
    lan: lang === "zh" ? "zh" : "en", // 语言
    spd: 5, // 语速（0-15，5为正常）
    pit: 5, // 音调（0-15，5为正常）
    vol: 5, // 音量（0-15，5为正常）
    per: lang === "zh" ? 0 : 3, // 发音人（0=女声，1=男声，3=英文女声，4=英文男声）
    aue: 3, // 音频格式（3=mp3）
  };

  const response = await axios.get(BAIDU_TTS_URL, {
    params: params,
    responseType: "arraybuffer",
    timeout: 30000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // 检查是否返回了错误（百度API错误时返回JSON）
  const contentType = response.headers["content-type"];
  if (contentType && contentType.includes("application/json")) {
    const errorData = JSON.parse(response.data.toString());
    throw new Error(`百度TTS错误: ${JSON.stringify(errorData)}`);
  }

  return response.data;
}

/**
 * 获取有道TTS音频
 */
async function getYoudaoTTS(text, lang) {
  const salt = Date.now().toString();
  const sign = generateYoudaoSign(YOUDAO_APP_KEY, text, salt, YOUDAO_APP_SECRET);

  const params = {
    q: text,
    langType: lang === "zh" ? "zh-CHS" : "en",
    appKey: YOUDAO_APP_KEY,
    salt: salt,
    sign: sign,
    voice: 0,
    format: "mp3",
    speed: 0,
  };

  const response = await axios.get(YOUDAO_TTS_URL, {
    params: params,
    responseType: "arraybuffer",
    timeout: 30000,
  });

  // 检查是否返回了错误
  const contentType = response.headers["content-type"];
  if (contentType && contentType.includes("application/json")) {
    const errorData = JSON.parse(response.data.toString());
    throw new Error(`有道TTS错误: ${JSON.stringify(errorData)}`);
  }

  return response.data;
}

/**
 * GET /api/tts/url
 * 获取音频URL（用于前端直接播放）
 */
router.get("/url", (req, res) => {
  try {
    const { word, lang = "en", provider = "baidu" } = req.query;

    if (!word) {
      return res.status(400).json({
        success: false,
        error: "缺少必需参数: word",
      });
    }

    // 返回代理URL
    const audioUrl = `http://localhost:3001/api/tts/speak?word=${encodeURIComponent(word)}&lang=${lang}&provider=${provider}`;

    res.json({
      success: true,
      audioUrl: audioUrl,
      word: word,
      lang: lang,
      provider: provider,
    });
  } catch (error) {
    console.error("生成音频URL错误:", error.message);
    res.status(500).json({
      success: false,
      error: "生成音频URL失败",
      message: error.message,
    });
  }
});

module.exports = router;
