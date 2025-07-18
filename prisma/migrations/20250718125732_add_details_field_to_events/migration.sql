/*
  Warnings:

  - You are about to alter the column `description` on the `events` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(250)`.

*/
-- AlterTable
ALTER TABLE "events" ADD COLUMN     "details" TEXT,
ALTER COLUMN "description" SET DATA TYPE VARCHAR(250);
