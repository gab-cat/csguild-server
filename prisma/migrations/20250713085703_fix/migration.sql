/*
  Warnings:

  - You are about to drop the column `projectId` on the `project_applications` table. All the data in the column will be lost.
  - You are about to drop the column `projectRoleId` on the `project_applications` table. All the data in the column will be lost.
  - You are about to drop the column `reviewedBy` on the `project_applications` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `project_applications` table. All the data in the column will be lost.
  - You are about to drop the column `projectId` on the `project_members` table. All the data in the column will be lost.
  - You are about to drop the column `projectRoleId` on the `project_members` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `project_members` table. All the data in the column will be lost.
  - You are about to drop the column `projectId` on the `project_roles` table. All the data in the column will be lost.
  - You are about to drop the column `roleId` on the `project_roles` table. All the data in the column will be lost.
  - You are about to drop the column `ownerId` on the `projects` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[projectSlug,userSlug,roleSlug]` on the table `project_applications` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[projectSlug,userSlug,roleSlug]` on the table `project_members` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[projectSlug,roleSlug]` on the table `project_roles` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `projectSlug` to the `project_applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roleSlug` to the `project_applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userSlug` to the `project_applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `projectSlug` to the `project_members` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roleSlug` to the `project_members` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userSlug` to the `project_members` table without a default value. This is not possible if the table is not empty.
  - Added the required column `projectSlug` to the `project_roles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roleSlug` to the `project_roles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerSlug` to the `projects` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "project_applications" DROP CONSTRAINT "project_applications_projectId_fkey";

-- DropForeignKey
ALTER TABLE "project_applications" DROP CONSTRAINT "project_applications_projectRoleId_fkey";

-- DropForeignKey
ALTER TABLE "project_applications" DROP CONSTRAINT "project_applications_reviewedBy_fkey";

-- DropForeignKey
ALTER TABLE "project_applications" DROP CONSTRAINT "project_applications_userId_fkey";

-- DropForeignKey
ALTER TABLE "project_members" DROP CONSTRAINT "project_members_projectId_fkey";

-- DropForeignKey
ALTER TABLE "project_members" DROP CONSTRAINT "project_members_projectRoleId_fkey";

-- DropForeignKey
ALTER TABLE "project_members" DROP CONSTRAINT "project_members_userId_fkey";

-- DropForeignKey
ALTER TABLE "project_roles" DROP CONSTRAINT "project_roles_projectId_fkey";

-- DropForeignKey
ALTER TABLE "project_roles" DROP CONSTRAINT "project_roles_roleId_fkey";

-- DropForeignKey
ALTER TABLE "projects" DROP CONSTRAINT "projects_ownerId_fkey";

-- DropIndex
DROP INDEX "project_applications_projectId_idx";

-- DropIndex
DROP INDEX "project_applications_projectId_userId_projectRoleId_key";

-- DropIndex
DROP INDEX "project_applications_projectRoleId_idx";

-- DropIndex
DROP INDEX "project_applications_userId_idx";

-- DropIndex
DROP INDEX "project_members_projectId_idx";

-- DropIndex
DROP INDEX "project_members_projectId_userId_projectRoleId_key";

-- DropIndex
DROP INDEX "project_members_projectRoleId_idx";

-- DropIndex
DROP INDEX "project_members_userId_idx";

-- DropIndex
DROP INDEX "project_roles_projectId_idx";

-- DropIndex
DROP INDEX "project_roles_projectId_roleId_key";

-- DropIndex
DROP INDEX "project_roles_roleId_idx";

-- DropIndex
DROP INDEX "projects_ownerId_idx";

-- AlterTable
ALTER TABLE "project_applications" DROP COLUMN "projectId",
DROP COLUMN "projectRoleId",
DROP COLUMN "reviewedBy",
DROP COLUMN "userId",
ADD COLUMN     "projectSlug" TEXT NOT NULL,
ADD COLUMN     "reviewedBySlug" TEXT,
ADD COLUMN     "roleSlug" TEXT NOT NULL,
ADD COLUMN     "userSlug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "project_members" DROP COLUMN "projectId",
DROP COLUMN "projectRoleId",
DROP COLUMN "userId",
ADD COLUMN     "projectSlug" TEXT NOT NULL,
ADD COLUMN     "roleSlug" TEXT NOT NULL,
ADD COLUMN     "userSlug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "project_roles" DROP COLUMN "projectId",
DROP COLUMN "roleId",
ADD COLUMN     "projectSlug" TEXT NOT NULL,
ADD COLUMN     "roleSlug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "projects" DROP COLUMN "ownerId",
ADD COLUMN     "ownerSlug" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "project_applications_projectSlug_idx" ON "project_applications"("projectSlug");

-- CreateIndex
CREATE INDEX "project_applications_userSlug_idx" ON "project_applications"("userSlug");

-- CreateIndex
CREATE INDEX "project_applications_roleSlug_idx" ON "project_applications"("roleSlug");

-- CreateIndex
CREATE UNIQUE INDEX "project_applications_projectSlug_userSlug_roleSlug_key" ON "project_applications"("projectSlug", "userSlug", "roleSlug");

-- CreateIndex
CREATE INDEX "project_members_projectSlug_idx" ON "project_members"("projectSlug");

-- CreateIndex
CREATE INDEX "project_members_userSlug_idx" ON "project_members"("userSlug");

-- CreateIndex
CREATE INDEX "project_members_roleSlug_idx" ON "project_members"("roleSlug");

-- CreateIndex
CREATE UNIQUE INDEX "project_members_projectSlug_userSlug_roleSlug_key" ON "project_members"("projectSlug", "userSlug", "roleSlug");

-- CreateIndex
CREATE INDEX "project_roles_projectSlug_idx" ON "project_roles"("projectSlug");

-- CreateIndex
CREATE INDEX "project_roles_roleSlug_idx" ON "project_roles"("roleSlug");

-- CreateIndex
CREATE UNIQUE INDEX "project_roles_projectSlug_roleSlug_key" ON "project_roles"("projectSlug", "roleSlug");

-- CreateIndex
CREATE INDEX "projects_ownerSlug_idx" ON "projects"("ownerSlug");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_ownerSlug_fkey" FOREIGN KEY ("ownerSlug") REFERENCES "users"("username") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_roles" ADD CONSTRAINT "project_roles_projectSlug_fkey" FOREIGN KEY ("projectSlug") REFERENCES "projects"("slug") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_roles" ADD CONSTRAINT "project_roles_roleSlug_fkey" FOREIGN KEY ("roleSlug") REFERENCES "user_roles"("slug") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_projectSlug_fkey" FOREIGN KEY ("projectSlug") REFERENCES "projects"("slug") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_userSlug_fkey" FOREIGN KEY ("userSlug") REFERENCES "users"("username") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_projectSlug_roleSlug_fkey" FOREIGN KEY ("projectSlug", "roleSlug") REFERENCES "project_roles"("projectSlug", "roleSlug") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_applications" ADD CONSTRAINT "project_applications_projectSlug_fkey" FOREIGN KEY ("projectSlug") REFERENCES "projects"("slug") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_applications" ADD CONSTRAINT "project_applications_userSlug_fkey" FOREIGN KEY ("userSlug") REFERENCES "users"("username") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_applications" ADD CONSTRAINT "project_applications_projectSlug_roleSlug_fkey" FOREIGN KEY ("projectSlug", "roleSlug") REFERENCES "project_roles"("projectSlug", "roleSlug") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_applications" ADD CONSTRAINT "project_applications_reviewedBySlug_fkey" FOREIGN KEY ("reviewedBySlug") REFERENCES "users"("username") ON DELETE SET NULL ON UPDATE CASCADE;
