-- DropIndex
DROP INDEX "EmailApplication_userId_key";

-- CreateTable
CREATE TABLE "ResetLink" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    CONSTRAINT "ResetLink_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ResetLink_userId_key" ON "ResetLink"("userId");
