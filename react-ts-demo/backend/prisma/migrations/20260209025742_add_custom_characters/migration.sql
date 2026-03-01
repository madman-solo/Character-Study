-- CreateTable
CREATE TABLE "CustomCharacter" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatar" TEXT,
    "gender" TEXT NOT NULL DEFAULT 'female',
    "age" TEXT,
    "personality" TEXT NOT NULL,
    "background" TEXT,
    "speakingStyle" TEXT,
    "hobbies" TEXT NOT NULL DEFAULT '[]',
    "traits" TEXT NOT NULL DEFAULT '[]',
    "systemPrompt" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CharacterConversation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "characterId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "userMessage" TEXT NOT NULL,
    "characterReply" TEXT NOT NULL,
    "emotion" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CharacterConversation_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "CustomCharacter" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CharacterMemory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "characterId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "memoryType" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "importance" INTEGER NOT NULL DEFAULT 5,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastAccessedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CharacterMemory_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "CustomCharacter" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "CustomCharacter_userId_isActive_idx" ON "CustomCharacter"("userId", "isActive");

-- CreateIndex
CREATE INDEX "CustomCharacter_userId_isDefault_idx" ON "CustomCharacter"("userId", "isDefault");

-- CreateIndex
CREATE INDEX "CharacterConversation_characterId_createdAt_idx" ON "CharacterConversation"("characterId", "createdAt");

-- CreateIndex
CREATE INDEX "CharacterConversation_userId_createdAt_idx" ON "CharacterConversation"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "CharacterMemory_characterId_importance_idx" ON "CharacterMemory"("characterId", "importance");

-- CreateIndex
CREATE INDEX "CharacterMemory_userId_characterId_idx" ON "CharacterMemory"("userId", "characterId");
