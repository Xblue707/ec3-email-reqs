/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `EmailApplication` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `emailApplicationId` to the `ResetToken` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ResetToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "emailApplicationId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    CONSTRAINT "ResetToken_emailApplicationId_fkey" FOREIGN KEY ("emailApplicationId") REFERENCES "EmailApplication" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ResetToken" ("expiresAt", "id", "tokenHash", "userId") SELECT "expiresAt", "id", "tokenHash", "userId" FROM "ResetToken";
DROP TABLE "ResetToken";
ALTER TABLE "new_ResetToken" RENAME TO "ResetToken";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "EmailApplication_username_key" ON "EmailApplication"("username");
