-- CreateTable
CREATE TABLE "project_pinned" (
    "id" TEXT NOT NULL,
    "projectSlug" TEXT NOT NULL,
    "pinnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pinnedBy" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "project_pinned_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_saved" (
    "id" TEXT NOT NULL,
    "userSlug" TEXT NOT NULL,
    "projectSlug" TEXT NOT NULL,
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_saved_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "project_pinned_projectSlug_key" ON "project_pinned"("projectSlug");

-- CreateIndex
CREATE INDEX "project_pinned_order_idx" ON "project_pinned"("order");

-- CreateIndex
CREATE INDEX "project_pinned_pinnedAt_idx" ON "project_pinned"("pinnedAt");

-- CreateIndex
CREATE INDEX "project_saved_userSlug_idx" ON "project_saved"("userSlug");

-- CreateIndex
CREATE INDEX "project_saved_savedAt_idx" ON "project_saved"("savedAt");

-- CreateIndex
CREATE UNIQUE INDEX "project_saved_userSlug_projectSlug_key" ON "project_saved"("userSlug", "projectSlug");

-- AddForeignKey
ALTER TABLE "project_pinned" ADD CONSTRAINT "project_pinned_projectSlug_fkey" FOREIGN KEY ("projectSlug") REFERENCES "projects"("slug") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_pinned" ADD CONSTRAINT "project_pinned_pinnedBy_fkey" FOREIGN KEY ("pinnedBy") REFERENCES "users"("username") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_saved" ADD CONSTRAINT "project_saved_userSlug_fkey" FOREIGN KEY ("userSlug") REFERENCES "users"("username") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_saved" ADD CONSTRAINT "project_saved_projectSlug_fkey" FOREIGN KEY ("projectSlug") REFERENCES "projects"("slug") ON DELETE CASCADE ON UPDATE CASCADE;
