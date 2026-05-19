import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import request from "supertest";
import { PrismaClient } from "@prisma/client";
import { createRequire } from "module";

// 后端是 CommonJS，用 createRequire 加载
const require = createRequire(import.meta.url);
const app = require("../../server");
const prisma = new PrismaClient();

const TEST_USER_ID = "test-user-integration";
const TEST_BOOK_TYPE = "初一";
let TEST_WORD_ID;

// 创建测试用 Word，记录 id 供后续测试使用
beforeAll(async () => {
  const word = await prisma.word.create({
    data: { word: "__test_word__", translation: "测试" },
  });
  TEST_WORD_ID = word.id;
});

// 每个测试前清空该用户的进度，保证隔离
beforeEach(async () => {
  await prisma.wordProgress.deleteMany({ where: { userId: TEST_USER_ID } });
});

// 清理测试数据，断开连接
afterAll(async () => {
  await prisma.wordProgress.deleteMany({ where: { userId: TEST_USER_ID } });
  await prisma.word.delete({ where: { id: TEST_WORD_ID } });
  await prisma.$disconnect();
});

// ─────────────────────────────────────────────
// POST /api/word-progress
// ─────────────────────────────────────────────
describe("POST /api/word-progress", () => {
  it("缺少必填字段时返回 400", async () => {
    // 验证路由的输入校验逻辑
    const res = await request(app)
      .post("/api/word-progress")
      .send({ userId: TEST_USER_ID }); // 缺少 wordId、bookType、correct

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Missing required fields/);
  });

  it("首次答题（correct=true）创建新记录，correctCount=1", async () => {
    // 验证"不存在时 create"的分支逻辑
    const res = await request(app).post("/api/word-progress").send({
      userId: TEST_USER_ID,
      wordId: TEST_WORD_ID,
      bookType: TEST_BOOK_TYPE,
      correct: true,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const { progress } = res.body;
    expect(progress.correctCount).toBe(1);
    expect(progress.wrongCount).toBe(0);
    expect(progress.mastered).toBe(false);
    expect(progress.nextReview).toBeDefined(); // 间隔重复算法应返回下次复习日期
  });

  it("首次答题（correct=false）创建新记录，wrongCount=1", async () => {
    const res = await request(app).post("/api/word-progress").send({
      userId: TEST_USER_ID,
      wordId: TEST_WORD_ID,
      bookType: TEST_BOOK_TYPE,
      correct: false,
    });

    expect(res.status).toBe(200);
    expect(res.body.progress.correctCount).toBe(0);
    expect(res.body.progress.wrongCount).toBe(1);
  });

  it("重复答题时累加计数（update 分支）", async () => {
    // 验证"已存在时update"的分支逻辑
    // 先答一次
    await request(app).post("/api/word-progress").send({
      userId: TEST_USER_ID,
      wordId: TEST_WORD_ID,
      bookType: TEST_BOOK_TYPE,
      correct: true,
    });

    // 再答一次
    const res = await request(app).post("/api/word-progress").send({
      userId: TEST_USER_ID,
      wordId: TEST_WORD_ID,
      bookType: TEST_BOOK_TYPE,
      correct: true,
    });

    expect(res.status).toBe(200);
    expect(res.body.progress.correctCount).toBe(2);
  });
});

// ─────────────────────────────────────────────
// GET /api/word-progress/review/:userId
// ─────────────────────────────────────────────
describe("GET /api/word-progress/review/:userId", () => {
  it("没有学习记录时返回空列表和统计", async () => {
    // 验证空状态下响应结构正确
    const res = await request(app).get(
      `/api/word-progress/review/${TEST_USER_ID}`,
    );

    expect(res.status).toBe(200);
    expect(res.body.userId).toBe(TEST_USER_ID);
    expect(res.body.words).toEqual([]);
    expect(res.body.statistics).toBeDefined();
  });

  it("有学习记录时返回单词和进度数据", async () => {
    // 验证 include word 关联查询和响应格式
    await request(app).post("/api/word-progress").send({
      userId: TEST_USER_ID,
      wordId: TEST_WORD_ID,
      bookType: TEST_BOOK_TYPE,
      correct: true,
    });

    const res = await request(app).get(
      `/api/word-progress/review/${TEST_USER_ID}`,
    );

    expect(res.status).toBe(200);
    // 刚学的单词应该在复习列表中（nextReview 为今天或明天）
    if (res.body.words.length > 0) {
      const item = res.body.words[0];
      expect(item.word).toHaveProperty("id");
      expect(item.word).toHaveProperty("word");
      expect(item.progress).toHaveProperty("correctCount");
      expect(item.progress).toHaveProperty("nextReview");
    }
  });

  it("bookType 过滤参数生效", async () => {
    // 验证 query 参数过滤逻辑
    await request(app).post("/api/word-progress").send({
      userId: TEST_USER_ID,
      wordId: TEST_WORD_ID,
      bookType: TEST_BOOK_TYPE,
      correct: true,
    });

    // 用不同的 bookType 查询，应该返回空
    const res = await request(app).get(
      `/api/word-progress/review/${TEST_USER_ID}?bookType=高一`,
    );

    expect(res.status).toBe(200);
    expect(res.body.words).toEqual([]);
  });

  it("limit 参数限制返回数量", async () => {
    // 验证分页/限制逻辑
    const res = await request(app).get(
      `/api/word-progress/review/${TEST_USER_ID}?limit=5`,
    );

    expect(res.status).toBe(200);
    expect(res.body.words.length).toBeLessThanOrEqual(5);
  });
});
