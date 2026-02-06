-- CreateTable
CREATE TABLE "ChildWord" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "word" TEXT NOT NULL,
    "phonetic" TEXT NOT NULL,
    "translation" TEXT NOT NULL,
    "pos" TEXT NOT NULL,
    "grade" INTEGER NOT NULL,
    "bnc" INTEGER,
    "frq" INTEGER,
    "audio" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ChildWordProgress" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
    "wordId" INTEGER NOT NULL,
    "correctCount" INTEGER NOT NULL DEFAULT 0,
    "wrongCount" INTEGER NOT NULL DEFAULT 0,
    "lastStudied" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mastered" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "ChildWordProgress_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "ChildWord" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ChildWord_word_key" ON "ChildWord"("word");

-- CreateIndex
CREATE INDEX "ChildWord_grade_idx" ON "ChildWord"("grade");

-- CreateIndex
CREATE INDEX "ChildWord_word_idx" ON "ChildWord"("word");

-- CreateIndex
CREATE INDEX "ChildWordProgress_userId_idx" ON "ChildWordProgress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ChildWordProgress_userId_wordId_key" ON "ChildWordProgress"("userId", "wordId");
