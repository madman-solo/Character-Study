const express = require("express");
const axios = require("axios");
const router = express.Router();

const API_KEY = process.env.BAIDU_YUYIN_API_KEY;
const SECRET_KEY = process.env.BAIDU_YUYIN_SECRET_KEY;
const APP_ID = process.env.BAIDU_YUYIN_ID;

let cachedToken = null;
let tokenExpireTime = 0;
//使用Ouath获取Access_token:
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
//使用Access_token调用TTS接口
// GET /api/speaking-tts/speak?text=xxx
router.get("/speak", async (req, res) => {
  const { text } = req.query;
  if (!text) return res.status(400).json({ error: "缺少 text 参数" });

  try {
    const token = await getAccessToken();
    const response = await axios.get("https://tsn.baidu.com/text2audio", {
      params: {
        tex: text,
        tok: token,
        cuid: APP_ID,
        ctp: 1,
        lan: "en",
        spd: 5,
        pit: 5,
        vol: 5,
        per: 3, // 3=英文女声，4=英文男声
        aue: 3, // 3=mp3
      },
      responseType: "arraybuffer",
      timeout: 15000,
    });

    const contentType = response.headers["content-type"];
    if (contentType && contentType.includes("application/json")) {
      const err = JSON.parse(response.data.toString());
      return res.status(500).json({ error: err });
    }

    res.set({
      "Content-Type": "audio/mp3",
      "Content-Length": response.data.length,
    });
    res.send(response.data);
  } catch (err) {
    console.error("[SpeakingTTS] 错误:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
