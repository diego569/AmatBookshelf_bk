-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('SCHEDULED', 'LIVE', 'ENDED');

-- AlterTable
ALTER TABLE "sessions"
ADD COLUMN "status" "SessionStatus" NOT NULL DEFAULT 'SCHEDULED',
ADD COLUMN "started_at" TIMESTAMP(3),
ADD COLUMN "ended_at" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "sessions_club_id_status_idx" ON "sessions"("club_id", "status");

