/*
  Warnings:

  - Added the required column `category` to the `AgentMemory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `key` to the `AgentMemory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `AgentMemory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `value` to the `AgentMemory` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AgentMemory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "context" JSONB NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "importance" INTEGER NOT NULL DEFAULT 5,
    "source" TEXT NOT NULL DEFAULT 'inferred_from_chat',
    "lastAccessedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accessCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AgentMemory_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AgentMemory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_AgentMemory" ("agentId", "context", "createdAt", "expiresAt", "id", "type", "userId") SELECT "agentId", "context", "createdAt", "expiresAt", "id", "type", "userId" FROM "AgentMemory";
DROP TABLE "AgentMemory";
ALTER TABLE "new_AgentMemory" RENAME TO "AgentMemory";
CREATE INDEX "AgentMemory_agentId_userId_idx" ON "AgentMemory"("agentId", "userId");
CREATE INDEX "AgentMemory_expiresAt_idx" ON "AgentMemory"("expiresAt");
CREATE INDEX "AgentMemory_importance_idx" ON "AgentMemory"("importance");
CREATE INDEX "AgentMemory_lastAccessedAt_idx" ON "AgentMemory"("lastAccessedAt");
CREATE INDEX "AgentMemory_category_idx" ON "AgentMemory"("category");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
