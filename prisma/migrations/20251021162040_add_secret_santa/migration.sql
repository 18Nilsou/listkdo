-- CreateTable
CREATE TABLE "SecretSanta" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "deadline" DATETIME NOT NULL,
    "maxAmount" REAL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "creatorId" TEXT NOT NULL,
    CONSTRAINT "SecretSanta_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SecretSantaParticipant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedToId" TEXT,
    "secretSantaId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "SecretSantaParticipant_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "SecretSantaParticipant" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "SecretSantaParticipant_secretSantaId_fkey" FOREIGN KEY ("secretSantaId") REFERENCES "SecretSanta" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SecretSantaParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SecretSantaInvitation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "sentAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" DATETIME,
    "secretSantaId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT,
    CONSTRAINT "SecretSantaInvitation_secretSantaId_fkey" FOREIGN KEY ("secretSantaId") REFERENCES "SecretSanta" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SecretSantaInvitation_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SecretSantaInvitation_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "SecretSantaParticipant_secretSantaId_userId_key" ON "SecretSantaParticipant"("secretSantaId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "SecretSantaInvitation_token_key" ON "SecretSantaInvitation"("token");

-- CreateIndex
CREATE UNIQUE INDEX "SecretSantaInvitation_secretSantaId_email_key" ON "SecretSantaInvitation"("secretSantaId", "email");
