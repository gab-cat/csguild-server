-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('IN_PERSON', 'VIRTUAL', 'HYBRID', 'OTHERS');

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "type" "EventType" NOT NULL DEFAULT 'IN_PERSON',
ALTER COLUMN "description" SET DATA TYPE TEXT;
