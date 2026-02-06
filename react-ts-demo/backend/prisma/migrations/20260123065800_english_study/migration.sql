-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "email" TEXT,
    "password" TEXT NOT NULL,
    "nickname" TEXT,
    "avatar" TEXT,
    "ageGroup" TEXT,
    "bio" TEXT,
    "isGuest" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lastLoginAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "UserLearningData" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
    "totalStudyTime" INTEGER NOT NULL DEFAULT 0,
    "consecutiveDays" INTEGER NOT NULL DEFAULT 0,
    "interactionCount" INTEGER NOT NULL DEFAULT 0,
    "dailyStudyTime" TEXT NOT NULL DEFAULT '{}',
    "currentBookProgress" TEXT NOT NULL DEFAULT '{}',
    "masteredWords" TEXT NOT NULL DEFAULT '[]',
    "weakWords" TEXT NOT NULL DEFAULT '[]',
    "answerHistory" TEXT NOT NULL DEFAULT '{}',
    "lastSyncAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserLearningData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserRewardData" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "badges" TEXT NOT NULL DEFAULT '[]',
    "recentPoints" TEXT NOT NULL DEFAULT '[]',
    "lastSyncAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserRewardData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "UserLearningData_userId_idx" ON "UserLearningData"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserLearningData_userId_key" ON "UserLearningData"("userId");

-- CreateIndex
CREATE INDEX "UserRewardData_userId_idx" ON "UserRewardData"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserRewardData_userId_key" ON "UserRewardData"("userId");
