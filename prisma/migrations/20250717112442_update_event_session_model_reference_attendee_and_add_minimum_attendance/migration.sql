/*
  Warnings:

  - You are about to drop the column `checkInTime` on the `event_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `checkOutTime` on the `event_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `eventId` on the `event_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `event_sessions` table. All the data in the column will be lost.
  - Added the required column `attendeeId` to the `event_sessions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "event_sessions" DROP CONSTRAINT "event_sessions_eventId_fkey";

-- DropForeignKey
ALTER TABLE "event_sessions" DROP CONSTRAINT "event_sessions_userId_fkey";

-- DropIndex
DROP INDEX "event_sessions_checkInTime_idx";

-- DropIndex
DROP INDEX "event_sessions_eventId_idx";

-- DropIndex
DROP INDEX "event_sessions_eventId_userId_idx";

-- DropIndex
DROP INDEX "event_sessions_userId_idx";

-- AlterTable
ALTER TABLE "event_sessions" DROP COLUMN "checkInTime",
DROP COLUMN "checkOutTime",
DROP COLUMN "eventId",
DROP COLUMN "userId",
ADD COLUMN     "attendeeId" TEXT NOT NULL,
ADD COLUMN     "endedAt" TIMESTAMP(3),
ADD COLUMN     "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "minimumAttendanceMinutes" INTEGER;

-- CreateIndex
CREATE INDEX "event_sessions_attendeeId_idx" ON "event_sessions"("attendeeId");

-- CreateIndex
CREATE INDEX "event_sessions_startedAt_idx" ON "event_sessions"("startedAt");

-- CreateIndex
CREATE INDEX "event_sessions_endedAt_idx" ON "event_sessions"("endedAt");

-- AddForeignKey
ALTER TABLE "event_sessions" ADD CONSTRAINT "event_sessions_attendeeId_fkey" FOREIGN KEY ("attendeeId") REFERENCES "event_attendees"("id") ON DELETE CASCADE ON UPDATE CASCADE;
