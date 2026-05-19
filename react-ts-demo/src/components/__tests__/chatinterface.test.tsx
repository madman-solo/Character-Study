// chatinterface.test.ts，聊天接口的组件测试
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ChatInterface from "../ChatInterface";

// mock 路径相对于被测文件（ChatInterface.tsx）所在位置
vi.mock("../../services/chatService", () => ({
  chat: vi.fn(),
  saveMessage: vi.fn().mockResolvedValue(undefined),
  getConversationHistory: vi.fn().mockResolvedValue([]),
  deleteConversationHistory: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: "test-user" } }),
}));

vi.mock("../../services/characterService", () => ({
  saveConversation: vi.fn().mockResolvedValue(undefined),
  getConversationHistory: vi.fn().mockResolvedValue([]),
}));

// 动态 import 以获取 mock 引用
const { chat } = await import("../../services/chatService");

const defaultProps = { scene: "general" as const };

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(chat).mockResolvedValue({ content: "AI的回复", error: null });
});

describe("ChatInterface", () => {
  it("初始状态显示[开始对话]空状态", async () => {
    render(<ChatInterface {...defaultProps} />);
    expect(screen.getByText("开始对话")).toBeInTheDocument();
  });

  it("输入为空时发送按钮禁用", () => {
    render(<ChatInterface {...defaultProps} />);
    expect(screen.getByRole("button", { name: "发送消息" })).toBeDisabled();
  });

  it("有输入内容时发送按钮可用", async () => {
    render(<ChatInterface {...defaultProps} />);
    await userEvent.type(screen.getByRole("textbox"), "你好");
    expect(screen.getByRole("button", { name: "发送消息" })).toBeEnabled();
  });

  it("发送消息后用户消息出现在列表中", async () => {
    render(<ChatInterface {...defaultProps} />);
    await userEvent.type(screen.getByRole("textbox"), "你好");
    await userEvent.click(screen.getByRole("button", { name: "发送消息" }));
    expect(screen.getByText("你好")).toBeInTheDocument();
  });

  it("发送中显示 loading 状态", async () => {
    // 让 chat 挂起，不立即 resolve
    vi.mocked(chat).mockReturnValue(new Promise(() => {}));
    render(<ChatInterface {...defaultProps} />);
    await userEvent.type(screen.getByRole("textbox"), "你好");
    await userEvent.click(screen.getByRole("button", { name: "发送消息" }));
    expect(
      screen.getByRole("status", { name: "AI正在回复" }),
    ).toBeInTheDocument();
  });

  it("AI 回复后显示在消息列表中", async () => {
    render(<ChatInterface {...defaultProps} enableTypewriter={false} />);
    await userEvent.type(screen.getByRole("textbox"), "你好");
    await userEvent.click(screen.getByRole("button", { name: "发送消息" }));
    await waitFor(() => {
      expect(screen.getByText("AI的回复")).toBeInTheDocument();
    });
  });

  it("API 失败时显示错误提示", async () => {
    vi.mocked(chat).mockRejectedValue(new Error("网络错误"));
    render(<ChatInterface {...defaultProps} />);
    await userEvent.type(screen.getByRole("textbox"), "你好");
    await userEvent.click(screen.getByRole("button", { name: "发送消息" }));
    await waitFor(() => {
      expect(
        screen.getByText("抱歉，消息发送失败。请稍后重试。"),
      ).toBeInTheDocument();
    });
  });

  it("Enter 键触发发送", async () => {
    render(<ChatInterface {...defaultProps} />);
    await userEvent.type(screen.getByRole("textbox"), "你好{Enter}");
    expect(vi.mocked(chat)).toHaveBeenCalledTimes(1);
  });

  it("Shift+Enter 不触发发送", async () => {
    render(<ChatInterface {...defaultProps} />);
    await userEvent.type(
      screen.getByRole("textbox"),
      "你好{Shift>}{Enter}{/Shift}",
    );
    expect(vi.mocked(chat)).not.toHaveBeenCalled();
  });

  it("点击[历史]按钮打开历史模态框", async () => {
    render(<ChatInterface {...defaultProps} />);
    await userEvent.click(screen.getByText(/历史/));
    expect(screen.getByText("历史对话")).toBeInTheDocument();
  });

  it("title prop 正确渲染", () => {
    render(<ChatInterface {...defaultProps} title="英语练习" />);
    expect(screen.getByText("英语练习")).toBeInTheDocument();
  });
});
