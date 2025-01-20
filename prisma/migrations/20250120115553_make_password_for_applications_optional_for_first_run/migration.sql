-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_EmailApplication" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT,
    "recoveryEmail" TEXT NOT NULL,
    "recoveryEmailDescription" TEXT NOT NULL,
    "recoveryPhone" TEXT,
    "recoveryPhoneDescription" TEXT,
    "approved" BOOLEAN NOT NULL,
    CONSTRAINT "EmailApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_EmailApplication" ("approved", "id", "password", "recoveryEmail", "recoveryEmailDescription", "recoveryPhone", "recoveryPhoneDescription", "userId", "username") SELECT "approved", "id", "password", "recoveryEmail", "recoveryEmailDescription", "recoveryPhone", "recoveryPhoneDescription", "userId", "username" FROM "EmailApplication";
DROP TABLE "EmailApplication";
ALTER TABLE "new_EmailApplication" RENAME TO "EmailApplication";
CREATE UNIQUE INDEX "EmailApplication_userId_key" ON "EmailApplication"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
