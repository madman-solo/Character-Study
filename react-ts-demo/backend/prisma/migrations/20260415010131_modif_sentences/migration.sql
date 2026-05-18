/*
  Warnings:

  - You are about to drop the column `sentences` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ListeningMaterial" ADD COLUMN "sentences" TEXT;

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
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
INSERT INTO "new_User" ("ageGroup", "avatar", "bio", "createdAt", "email", "id", "isGuest", "lastLoginAt", "nickname", "password", "updatedAt", "username") SELECT "ageGroup", "avatar", "bio", "createdAt", "email", "id", "isGuest", "lastLoginAt", "nickname", "password", "updatedAt", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
