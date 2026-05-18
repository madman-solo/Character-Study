export default function HelpPage() {
  return (
    <div
      style={{
        maxWidth: 560,
        margin: "5rem auto",
        padding: "0 1.5rem",
        lineHeight: 1.8,
      }}
    >
      <h2 style={{ fontWeight: 600, marginBottom: "2rem" }}>帮助与反馈</h2>

      <section style={{ marginBottom: "2rem" }}>
        <h3 style={{ fontSize: 15, color: "#555", marginBottom: "0.75rem" }}>
          常见问题
        </h3>
        {[
          [
            "如何切换学习模式？",
            "点击顶部导航栏的场景按钮，选择你想要的学习模式。",
          ],
          ["学习记录会保存吗？", "登录账号后，所有学习进度自动同步到云端。"],
          [
            "护眼模式有什么效果？",
            "开启后降低屏幕亮度和蓝光，并每20分钟提醒你休息。",
          ],
          [
            "如何添加喜欢的角色？",
            "在角色详情页点击“添加该角色”按钮，即可将其加入你的角色列表。",
          ],
          [
            "如何收藏角色？",
            "在角色详情页点击“收藏”按钮，即可将其加入你的收藏列表。",
          ],
          [
            "如何重置少儿英语学习进度？",
            "进入少儿学习 → 家长面板 → 设置管理 → 重置进度。",
          ],
        ].map(([q, a]) => (
          <div key={q} style={{ marginBottom: "1.25rem" }}>
            <div style={{ fontWeight: 500 }}>{q}</div>
            <div style={{ color: "#666", fontSize: 14, marginTop: 4 }}>{a}</div>
          </div>
        ))}
      </section>

      <section style={{ borderTop: "1px solid #eee", paddingTop: "1.5rem" }}>
        <h3 style={{ fontSize: 15, color: "#555", marginBottom: "0.75rem" }}>
          联系我们
        </h3>
        <p style={{ color: "#666", fontSize: 14 }}>
          如有问题或建议，欢迎发送邮件至{" "}
          <a
            href="mailto:3873434439@qq.com?subject=反馈&body=请在这里描述你的问题或建议，我们会尽快回复你！"
            style={{ color: "#4ECDC4" }}
          >
            3873434439@qq.com
          </a>
        </p>
        <p style={{ color: "#aaa", fontSize: 12, marginTop: "2rem" }}>
          我们通常在 1-2 个工作日内回复。
        </p>
      </section>
    </div>
  );
}
