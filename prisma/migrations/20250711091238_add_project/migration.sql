-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'REMOVED');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "user_roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "dueDate" TIMESTAMP(3),
    "status" "ProjectStatus" NOT NULL DEFAULT 'OPEN',
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_roles" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "maxMembers" INTEGER DEFAULT 1,
    "requirements" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_members" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectRoleId" TEXT NOT NULL,
    "status" "MemberStatus" NOT NULL DEFAULT 'ACTIVE',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_applications" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectRoleId" TEXT NOT NULL,
    "message" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_UserToUserRole" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_UserToUserRole_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_slug_key" ON "user_roles"("slug");

-- CreateIndex
CREATE INDEX "user_roles_slug_idx" ON "user_roles"("slug");

-- CreateIndex
CREATE INDEX "projects_ownerId_idx" ON "projects"("ownerId");

-- CreateIndex
CREATE INDEX "projects_status_idx" ON "projects"("status");

-- CreateIndex
CREATE INDEX "projects_dueDate_idx" ON "projects"("dueDate");

-- CreateIndex
CREATE INDEX "project_roles_projectId_idx" ON "project_roles"("projectId");

-- CreateIndex
CREATE INDEX "project_roles_roleId_idx" ON "project_roles"("roleId");

-- CreateIndex
CREATE UNIQUE INDEX "project_roles_projectId_roleId_key" ON "project_roles"("projectId", "roleId");

-- CreateIndex
CREATE INDEX "project_members_projectId_idx" ON "project_members"("projectId");

-- CreateIndex
CREATE INDEX "project_members_userId_idx" ON "project_members"("userId");

-- CreateIndex
CREATE INDEX "project_members_projectRoleId_idx" ON "project_members"("projectRoleId");

-- CreateIndex
CREATE UNIQUE INDEX "project_members_projectId_userId_projectRoleId_key" ON "project_members"("projectId", "userId", "projectRoleId");

-- CreateIndex
CREATE INDEX "project_applications_projectId_idx" ON "project_applications"("projectId");

-- CreateIndex
CREATE INDEX "project_applications_userId_idx" ON "project_applications"("userId");

-- CreateIndex
CREATE INDEX "project_applications_projectRoleId_idx" ON "project_applications"("projectRoleId");

-- CreateIndex
CREATE INDEX "project_applications_status_idx" ON "project_applications"("status");

-- CreateIndex
CREATE UNIQUE INDEX "project_applications_projectId_userId_projectRoleId_key" ON "project_applications"("projectId", "userId", "projectRoleId");

-- CreateIndex
CREATE INDEX "_UserToUserRole_B_index" ON "_UserToUserRole"("B");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_roles" ADD CONSTRAINT "project_roles_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_roles" ADD CONSTRAINT "project_roles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "user_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_projectRoleId_fkey" FOREIGN KEY ("projectRoleId") REFERENCES "project_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_applications" ADD CONSTRAINT "project_applications_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_applications" ADD CONSTRAINT "project_applications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_applications" ADD CONSTRAINT "project_applications_projectRoleId_fkey" FOREIGN KEY ("projectRoleId") REFERENCES "project_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_applications" ADD CONSTRAINT "project_applications_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserToUserRole" ADD CONSTRAINT "_UserToUserRole_A_fkey" FOREIGN KEY ("A") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserToUserRole" ADD CONSTRAINT "_UserToUserRole_B_fkey" FOREIGN KEY ("B") REFERENCES "user_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
