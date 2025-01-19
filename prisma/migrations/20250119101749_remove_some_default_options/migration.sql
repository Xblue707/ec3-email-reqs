/*
  Warnings:

  - You are about to drop the column `enableSearchIndexing` on the `EmailApplication` table. All the data in the column will be lost.
  - You are about to drop the column `sendWelcomeEmail` on the `EmailApplication` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_EmailApplication" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "recoveryEmail" TEXT NOT NULL,
    "recoveryEmailDescription" TEXT NOT NULL,
    "recoveryPhone" TEXT,
    "recoveryPhoneDescription" TEXT,
    CONSTRAINT "EmailApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_EmailApplication" ("id", "password", "recoveryEmail", "recoveryEmailDescription", "recoveryPhone", "recoveryPhoneDescription", "userId", "username") SELECT "id", "password", "recoveryEmail", "recoveryEmailDescription", "recoveryPhone", "recoveryPhoneDescription", "userId", "username" FROM "EmailApplication";
DROP TABLE "EmailApplication";
ALTER TABLE "new_EmailApplication" RENAME TO "EmailApplication";
CREATE UNIQUE INDEX "EmailApplication_userId_key" ON "EmailApplication"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
