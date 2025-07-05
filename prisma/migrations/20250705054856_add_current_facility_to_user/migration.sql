-- AlterTable
ALTER TABLE "users" ADD COLUMN     "currentFacilityId" TEXT;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_currentFacilityId_fkey" FOREIGN KEY ("currentFacilityId") REFERENCES "facilities"("id") ON DELETE SET NULL ON UPDATE CASCADE;
