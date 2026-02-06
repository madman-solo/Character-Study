-- CreateTable
CREATE TABLE "Word" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "word" TEXT NOT NULL,
    "phonetic" TEXT,
    "translation" TEXT,
    "definition" TEXT,
    "pos" TEXT,
    "collins" INTEGER DEFAULT 0,
    "oxford" BOOLEAN DEFAULT false,
    "tag" TEXT,
    "bnc" INTEGER,
    "frq" INTEGER,
    "exchange" TEXT,
    "detail" TEXT,
    "audio" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "WordProgress" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
    "wordId" INTEGER NOT NULL,
    "bookType" TEXT NOT NULL,
    "correctCount" INTEGER NOT NULL DEFAULT 0,
    "wrongCount" INTEGER NOT NULL DEFAULT 0,
    "lastStudied" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mastered" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "WordProgress_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Word_word_key" ON "Word"("word");

-- CreateIndex
CREATE INDEX "Word_word_idx" ON "Word"("word");

-- CreateIndex
CREATE INDEX "Word_tag_idx" ON "Word"("tag");

-- CreateIndex
CREATE INDEX "WordProgress_userId_bookType_idx" ON "WordProgress"("userId", "bookType");

-- CreateIndex
CREATE UNIQUE INDEX "WordProgress_userId_wordId_bookType_key" ON "WordProgress"("userId", "wordId", "bookType");
