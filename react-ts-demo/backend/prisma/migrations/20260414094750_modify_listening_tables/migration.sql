/*
  Warnings:

  - You are about to drop the column `tittle` on the `ListeningMaterial` table. All the data in the column will be lost.
  - Added the required column `title` to the `ListeningMaterial` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ListeningMaterial" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "audioUrl" TEXT NOT NULL,
    "transcript" TEXT,
    "sentence" TEXT,
    "duration" TEXT,
    "source" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_ListeningMaterial" ("audioUrl", "createdAt", "duration", "id", "level", "source", "transcript", "type") SELECT "audioUrl", "createdAt", "duration", "id", "level", "source", "transcript", "type" FROM "ListeningMaterial";
DROP TABLE "ListeningMaterial";
ALTER TABLE "new_ListeningMaterial" RENAME TO "ListeningMaterial";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
