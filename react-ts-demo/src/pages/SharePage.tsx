import { useState } from "react";

const SHARE_URL = window.location.origin;
const SHARE_TEXT =
  "强烈推荐使用这个AI辅助英语学习应用，紧跟时代步伐，来一起感受它的好用吧！";

export default function SharePage() {
  const [copied, setCopied] = useState(false);

  const shareQQ = () => {
    const url = `https://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(SHARE_URL)}&title=${encodeURIComponent(SHARE_TEXT)}`;
    window.open(url, "_blank");
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${SHARE_TEXT} ${SHARE_URL}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "8rem auto",
        padding: "0 1.5rem",
        textAlign: "center",
      }}
    >
      <h2 style={{ marginBottom: "1rem" }}>分享给好友</h2>
      <p style={{ color: "#888", fontSize: 14, marginBottom: "2rem" }}>
        邀请好友一起学英语
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        <button
          onClick={shareQQ}
          style={{
            padding: "14px",
            borderRadius: 12,
            background: "#12B7F5",
            color: "#fff",
            border: "none",
            fontSize: 16,
            cursor: "pointer",
          }}
        >
          分享到 QQ
        </button>

        <button
          onClick={copyLink}
          style={{
            padding: "14px",
            borderRadius: 12,
            background: "#07C160",
            color: "#fff",
            border: "none",
            fontSize: 16,
            cursor: "pointer",
          }}
        >
          {copied ? "已复制！粘贴到微信发送" : "复制链接（发送到微信）"}
        </button>
      </div>

      <p style={{ color: "#bbb", fontSize: 12, marginTop: "2rem" }}>
        微信不支持网页直接跳转，复制链接后在微信聊天框粘贴发送即可
      </p>
    </div>
  );
}
