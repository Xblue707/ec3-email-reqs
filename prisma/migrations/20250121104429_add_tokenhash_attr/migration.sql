/*
  Warnings:

  - Added the required column `tokenHash` to the `ResetToken` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ResetToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    CONSTRAINT "ResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ResetToken" ("expiresAt", "id", "userId") SELECT "expiresAt", "id", "userId" FROM "ResetToken";
DROP TABLE "ResetToken";
ALTER TABLE "new_ResetToken" RENAME TO "ResetToken";
CREATE UNIQUE INDEX "ResetToken_userId_key" ON "ResetToken"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
