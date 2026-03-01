-- CreateTable
CREATE TABLE "EmotionRecord" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
    "conversationId" INTEGER,
    "messageContent" TEXT NOT NULL,
    "emotion" TEXT NOT NULL,
    "sentiment" TEXT NOT NULL,
    "confidence" REAL NOT NULL,
    "keywords" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "EmotionRecord_userId_createdAt_idx" ON "EmotionRecord"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "EmotionRecord_emotion_idx" ON "EmotionRecord"("emotion");
