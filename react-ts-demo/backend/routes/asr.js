const express = require("express");
const axios = require("axios");
const router = express.Router();

const API_KEY = process.env.BAIDU_YUYIN_API_KEY;
const SECRET_KEY = process.env.BAIDU_YUYIN_SECRET_KEY;
const APP_ID = process.env.BAIDU_YUYIN_ID;

let cachedToken = null;
let tokenExpireTime = 0;

async function getAccessToken() {
  if (cachedToken && Date.now() < tokenExpireTime) return cachedToken;
  const res = await axios.get("https://aip.baidubce.com/oauth/2.0/token", {
    params: {
      grant_type: "client_credentials",
      client_id: API_KEY,
      client_secret: SECRET_KEY,
    },
  });
  cachedToken = res.data.access_token;
  tokenExpireTime = Date.now() + (res.data.expires_in - 60) * 1000;
  return cachedToken;
}

// 直接接收前端发来的 16-bit PCM，不需要 ffmpeg
router.post("/recognize", async (req, res) => {
  console.log("[ASR] ========== 收到请求 ==========");
  try {
    const pcmBuffer = req.body; // 已经是 Buffer，由 express.raw() 处理

    console.log("[ASR] PCM大小：", pcmBuffer.length, "bytes");
    console.log(
      "[ASR] 对应时长：",
      (pcmBuffer.length / 2 / 16000).toFixed(2),
      "秒",
    );

    if (!pcmBuffer || pcmBuffer.length === 0) {
      return res.status(400).json({ error: "未收到音频数据" });
    }
    if (pcmBuffer.length < 3200) {
      // 少于 0.1 秒
      return res.status(400).json({ error: "录音太短" });
    }
    if (!API_KEY || !SECRET_KEY || !APP_ID) {
      return res.status(500).json({ error: "未配置百度ASR密钥" });
    }

    const token = await getAccessToken();
    const response = await axios.post(
      "https://vop.baidu.com/server_api",
      {
        format: "pcm", // 直接是 PCM，不需要转换
        rate: 16000, // 前端录音就是 16000Hz
        channel: 1,
        dev_pid: 1737, // 英文识别（口语练习场景）
        cuid: APP_ID,
        token,
        speech: pcmBuffer.toString("base64"),
        len: pcmBuffer.length,
      },
      { headers: { "Content-Type": "application/json" } },
    );

    console.log("[ASR] 百度返回：", response.data);
    if (response.data.err_no !== 0) {
      return res.status(400).json({
        error: response.data.err_msg,
        code: response.data.err_no,
      });
    }

    res.json({ text: response.data.result[0] });
  } catch (err) {
    console.error("[ASR] 错误：", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
