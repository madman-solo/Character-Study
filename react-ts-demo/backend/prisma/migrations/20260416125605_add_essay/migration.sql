-- CreateTable
CREATE TABLE "Essay" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT '无标题',
    "content" TEXT NOT NULL,
    "score" INTEGER,
    "feedback" TEXT,
    "corrected" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "Essay_userId_idx" ON "Essay"("userId");
