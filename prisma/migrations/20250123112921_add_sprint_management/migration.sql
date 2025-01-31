-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'IN_REVIEW', 'APPROVED', 'CHANGES_REQUESTED');

-- AlterTable
ALTER TABLE "Sprint" ADD COLUMN     "burndownData" JSONB,
ADD COLUMN     "storyPoints" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "velocity" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "acceptanceCriteria" TEXT[],
ADD COLUMN     "documentationUrl" TEXT,
ADD COLUMN     "reviewStatus" "ReviewStatus",
ADD COLUMN     "reviewerId" TEXT,
ADD COLUMN     "storyPoints" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "SprintRetrospective" (
    "id" TEXT NOT NULL,
    "sprintId" TEXT NOT NULL,
    "whatWentWell" TEXT[],
    "whatWentWrong" TEXT[],
    "actionItems" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SprintRetrospective_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyStandup" (
    "id" TEXT NOT NULL,
    "sprintId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "yesterday" TEXT NOT NULL,
    "today" TEXT NOT NULL,
    "blockers" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyStandup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SprintMetrics" (
    "id" TEXT NOT NULL,
    "sprintId" TEXT NOT NULL,
    "plannedStoryPoints" INTEGER NOT NULL,
    "completedStoryPoints" INTEGER NOT NULL,
    "actualVelocity" DOUBLE PRECISION NOT NULL,
    "burndownData" JSONB NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SprintMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SprintRetrospective_sprintId_key" ON "SprintRetrospective"("sprintId");

-- CreateIndex
CREATE INDEX "SprintRetrospective_sprintId_idx" ON "SprintRetrospective"("sprintId");

-- CreateIndex
CREATE INDEX "DailyStandup_sprintId_idx" ON "DailyStandup"("sprintId");

-- CreateIndex
CREATE INDEX "DailyStandup_userId_idx" ON "DailyStandup"("userId");

-- CreateIndex
CREATE INDEX "DailyStandup_date_idx" ON "DailyStandup"("date");

-- CreateIndex
CREATE UNIQUE INDEX "DailyStandup_sprintId_userId_date_key" ON "DailyStandup"("sprintId", "userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "SprintMetrics_sprintId_key" ON "SprintMetrics"("sprintId");

-- CreateIndex
CREATE INDEX "SprintMetrics_sprintId_idx" ON "SprintMetrics"("sprintId");

-- CreateIndex
CREATE INDEX "Task_reviewerId_idx" ON "Task"("reviewerId");

-- AddForeignKey
ALTER TABLE "SprintRetrospective" ADD CONSTRAINT "SprintRetrospective_sprintId_fkey" FOREIGN KEY ("sprintId") REFERENCES "Sprint"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyStandup" ADD CONSTRAINT "DailyStandup_sprintId_fkey" FOREIGN KEY ("sprintId") REFERENCES "Sprint"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyStandup" ADD CONSTRAINT "DailyStandup_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SprintMetrics" ADD CONSTRAINT "SprintMetrics_sprintId_fkey" FOREIGN KEY ("sprintId") REFERENCES "Sprint"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
