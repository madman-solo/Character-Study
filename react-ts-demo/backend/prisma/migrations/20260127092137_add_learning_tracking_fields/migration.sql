-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UserLearningData" (
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
    "lastCheckInDate" TEXT NOT NULL DEFAULT '',
    "checkInHistory" TEXT NOT NULL DEFAULT '[]',
    "dailyMinStudyTime" INTEGER NOT NULL DEFAULT 5,
    "validCheckIns" INTEGER NOT NULL DEFAULT 0,
    "dailyAccuracy" TEXT NOT NULL DEFAULT '{}',
    "weeklyReport" TEXT NOT NULL DEFAULT '{}',
    "monthlyReport" TEXT NOT NULL DEFAULT '{}',
    "learningStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastSyncAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserLearningData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_UserLearningData" ("answerHistory", "consecutiveDays", "createdAt", "currentBookProgress", "dailyStudyTime", "id", "interactionCount", "lastSyncAt", "masteredWords", "totalStudyTime", "updatedAt", "userId", "weakWords") SELECT "answerHistory", "consecutiveDays", "createdAt", "currentBookProgress", "dailyStudyTime", "id", "interactionCount", "lastSyncAt", "masteredWords", "totalStudyTime", "updatedAt", "userId", "weakWords" FROM "UserLearningData";
DROP TABLE "UserLearningData";
ALTER TABLE "new_UserLearningData" RENAME TO "UserLearningData";
CREATE INDEX "UserLearningData_userId_idx" ON "UserLearningData"("userId");
CREATE UNIQUE INDEX "UserLearningData_userId_key" ON "UserLearningData"("userId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
