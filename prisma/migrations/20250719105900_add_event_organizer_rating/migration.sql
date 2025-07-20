-- CreateTable
CREATE TABLE "event_organizer_ratings" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_organizer_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "event_organizer_ratings_eventId_idx" ON "event_organizer_ratings"("eventId");

-- CreateIndex
CREATE INDEX "event_organizer_ratings_userId_idx" ON "event_organizer_ratings"("userId");

-- CreateIndex
CREATE INDEX "event_organizer_ratings_rating_idx" ON "event_organizer_ratings"("rating");

-- CreateIndex
CREATE INDEX "event_organizer_ratings_submittedAt_idx" ON "event_organizer_ratings"("submittedAt");

-- CreateIndex
CREATE UNIQUE INDEX "event_organizer_ratings_eventId_userId_key" ON "event_organizer_ratings"("eventId", "userId");

-- AddForeignKey
ALTER TABLE "event_organizer_ratings" ADD CONSTRAINT "event_organizer_ratings_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_organizer_ratings" ADD CONSTRAINT "event_organizer_ratings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("username") ON DELETE CASCADE ON UPDATE CASCADE;
