// spacedRepetitionService.test.ts
// 测试策略：
// 1. 纯函数（calculateAccuracy/isDueToday/formatNextReview/getMasteryLevel）直接测，无需 mock
// 2. 异步函数依赖 fetch，用 vi.stubGlobal mock 全局 fetch，测成功和失败两条路径
import { describe, it, expect, vi, afterEach } from "vitest";
import {
  calculateAccuracy,
  isDueToday,
  formatNextReview,
  getMasteryLevel,
  trackWordProgress,
  getReviewWords,
} from "../../services/spacedRepetitionService";

// ─── 辅助：构造 fetch mock 响应 ───────────────────────────────────────────────
function mockFetch(body: unknown, ok = true, status = 200) {
  return vi.fn().mockResolvedValue({
    ok,
    status,
    statusText: ok ? "OK" : "Internal Server Error",
    json: () => Promise.resolve(body),
  });
}

afterEach(() => {
  vi.unstubAllGlobals(); // 每个测试后还原 fetch，避免污染
});

// ─── 纯函数测试 ───────────────────────────────────────────────────────────────

describe("calculateAccuracy", () => {
  // 为什么测这些：覆盖除零、整除、四舍五入三种边界
  it("全部答对返回 100", () => {
    expect(calculateAccuracy(10, 0)).toBe(100);
  });

  it("全部答错返回 0", () => {
    expect(calculateAccuracy(0, 10)).toBe(0);
  });

  it("从未答题（0,0）返回 0，避免除零", () => {
    expect(calculateAccuracy(0, 0)).toBe(0);
  });

  it("正确率四舍五入到整数", () => {
    // 1/3 = 33.33... → 33
    expect(calculateAccuracy(1, 2)).toBe(33);
  });
});

describe("isDueToday", () => {
  // 为什么测这些：今天/昨天/明天是三个关键边界，时间部分不应影响结果
  it("今天的日期应返回 true", () => {
    expect(isDueToday(new Date())).toBe(true);
  });

  it("昨天的日期应返回 true（已过期）", () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    expect(isDueToday(yesterday)).toBe(true);
  });

  it("明天的日期应返回 false", () => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    expect(isDueToday(tomorrow)).toBe(false);
  });

  it("支持字符串格式的日期", () => {
    // 后端返回的 nextReview 通常是 ISO 字符串
    expect(isDueToday(new Date().toISOString())).toBe(true);
  });
});

describe("formatNextReview", () => {
  // 为什么测这些：每个分支对应不同的用户提示文案，文案错误会直接影响用户体验
  function daysFromNow(days: number): Date {
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  }

  it("过期返回[需要复习]", () => {
    expect(formatNextReview(daysFromNow(-1))).toBe("需要复习");
  });

  it("今天返回[今天]", () => {
    expect(formatNextReview(new Date())).toBe("今天");
  });

  it("明天返回[明天]", () => {
    expect(formatNextReview(daysFromNow(1))).toBe("明天");
  });

  it("3天后返回[3天后]", () => {
    expect(formatNextReview(daysFromNow(3))).toBe("3天后");
  });

  it("14天后返回[2周后]", () => {
    expect(formatNextReview(daysFromNow(14))).toBe("2周后");
  });

  it("60天后返回[2个月后]", () => {
    expect(formatNextReview(daysFromNow(60))).toBe("2个月后");
  });
});

describe("getMasteryLevel", () => {
  // 为什么测这些：每个 level 对应不同颜色和标签，分支逻辑有优先级，需验证边界不越界
  it("5次正确且错误少于2次 → mastered", () => {
    const result = getMasteryLevel(5, 1);
    expect(result.level).toBe("mastered");
    expect(result.label).toBe("已掌握");
  });

  it("正确率>=70% 且 3次以上 → good", () => {
    // 7对3错 = 70%，correctCount=7 >= 3
    const result = getMasteryLevel(7, 3);
    expect(result.level).toBe("good");
  });

  it("正确率>=50% 且 至少2次 → learning", () => {
    // 1对1错 = 50%，total=2
    const result = getMasteryLevel(1, 1);
    expect(result.level).toBe("learning");
  });

  it("从未答题 → weak", () => {
    const result = getMasteryLevel(0, 0);
    expect(result.level).toBe("weak");
    expect(result.label).toBe("需加强");
  });

  it("返回值包含 level/color/label 三个字段", () => {
    const result = getMasteryLevel(5, 0);
    expect(result).toHaveProperty("level");
    expect(result).toHaveProperty("color");
    expect(result).toHaveProperty("label");
  });
});

// ─── 异步函数测试（mock fetch）────────────────────────────────────────────────

describe("trackWordProgress", () => {
  // 为什么 mock fetch：函数依赖网络请求，单元测试不应真正发请求
  // 为什么用 vi.stubGlobal：fetch 是全局变量，这是 vitest 推荐的 mock 方式

  it("成功时返回 progress 数据", async () => {
    const mockProgress = { id: 1, wordId: 42, correctCount: 3, wrongCount: 1 };
    vi.stubGlobal("fetch", mockFetch({ progress: mockProgress }));

    const result = await trackWordProgress("user1", 42, "cet4", true);

    expect(result).toEqual(mockProgress);
  });

  it("发送正确的请求体", async () => {
    const fetchMock = mockFetch({ progress: {} });
    vi.stubGlobal("fetch", fetchMock);

    await trackWordProgress("user1", 42, "cet4", true);

    // 验证请求参数是否正确传递
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain("/word-progress");
    expect(options.method).toBe("POST");
    expect(JSON.parse(options.body)).toMatchObject({
      userId: "user1",
      wordId: 42,
      bookType: "cet4",
      correct: true,
    });
  });

  it("HTTP 错误时抛出异常", async () => {
    vi.stubGlobal("fetch", mockFetch({}, false, 500));

    await expect(trackWordProgress("user1", 42, "cet4", true)).rejects.toThrow(
      "Failed to track progress",
    );
  });

  it("网络异常时抛出异常", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("Network Error")),
    );

    await expect(trackWordProgress("user1", 42, "cet4", true)).rejects.toThrow(
      "Network Error",
    );
  });
});

describe("getReviewWords", () => {
  it("成功时返回复习单词列表", async () => {
    const mockData = { words: [{ id: 1 }, { id: 2 }], total: 2 };
    vi.stubGlobal("fetch", mockFetch(mockData));

    const result = await getReviewWords("user1");
    expect(result).toEqual(mockData);
  });

  it("bookType 参数正确拼接到 URL", async () => {
    const fetchMock = mockFetch({ words: [], total: 0 });
    vi.stubGlobal("fetch", fetchMock);

    await getReviewWords("user1", "cet4", 10);

    const [url] = fetchMock.mock.calls[0];
    expect(url).toContain("bookType=cet4");
    expect(url).toContain("limit=10");
  });

  it("不传 bookType 时 URL 不含 bookType 参数", async () => {
    const fetchMock = mockFetch({ words: [], total: 0 });
    vi.stubGlobal("fetch", fetchMock);

    await getReviewWords("user1");

    const [url] = fetchMock.mock.calls[0];
    expect(url).not.toContain("bookType");
  });

  it("HTTP 错误时抛出异常", async () => {
    vi.stubGlobal("fetch", mockFetch({}, false, 404));

    await expect(getReviewWords("user1")).rejects.toThrow(
      "Failed to fetch review words",
    );
  });
});
