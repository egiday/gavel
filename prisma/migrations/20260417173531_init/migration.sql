-- CreateTable
CREATE TABLE "Case" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mode" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "plaintiffName" TEXT,
    "plaintiffSide" TEXT NOT NULL,
    "plaintiffLawyer" TEXT,
    "defendantName" TEXT,
    "defendantSide" TEXT,
    "defendantLawyer" TEXT,
    "isSolo" BOOLEAN NOT NULL DEFAULT false,
    "absentDefendant" BOOLEAN NOT NULL DEFAULT false,
    "shareCode" TEXT NOT NULL,
    "shareSlug" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "jurorIds" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "speakerType" TEXT NOT NULL,
    "speakerId" TEXT NOT NULL,
    "speakerName" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Message_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Verdict" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "ruling" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "topQuote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Verdict_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Vote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "verdictId" TEXT NOT NULL,
    "jurorId" TEXT NOT NULL,
    "jurorName" TEXT NOT NULL,
    "ruling" TEXT NOT NULL,
    "reasoning" TEXT NOT NULL,
    CONSTRAINT "Vote_verdictId_fkey" FOREIGN KEY ("verdictId") REFERENCES "Verdict" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Case_shareCode_key" ON "Case"("shareCode");

-- CreateIndex
CREATE UNIQUE INDEX "Case_shareSlug_key" ON "Case"("shareSlug");

-- CreateIndex
CREATE INDEX "Case_shareCode_idx" ON "Case"("shareCode");

-- CreateIndex
CREATE INDEX "Case_shareSlug_idx" ON "Case"("shareSlug");

-- CreateIndex
CREATE INDEX "Message_caseId_order_idx" ON "Message"("caseId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Verdict_caseId_key" ON "Verdict"("caseId");

-- CreateIndex
CREATE INDEX "Vote_verdictId_idx" ON "Vote"("verdictId");
