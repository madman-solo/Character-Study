-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN "scene" TEXT;

-- CreateIndex
CREATE INDEX "Conversation_userId_scene_idx" ON "Conversation"("userId", "scene");
