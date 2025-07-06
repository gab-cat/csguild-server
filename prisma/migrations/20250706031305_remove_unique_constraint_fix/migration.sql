-- DropIndex
DROP INDEX "facility_usages_userId_facilityId_isActive_key";

-- CreateIndex
CREATE INDEX "facility_usages_userId_facilityId_isActive_idx" ON "facility_usages"("userId", "facilityId", "isActive");
