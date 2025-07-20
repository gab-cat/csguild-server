-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "organizedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_sessions" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "checkInTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkOutTime" TIMESTAMP(3),
    "duration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_attendees" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalDuration" INTEGER NOT NULL DEFAULT 0,
    "isEligible" BOOLEAN NOT NULL DEFAULT false,
    "notifiedFeedback" BOOLEAN NOT NULL DEFAULT false,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_attendees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_feedback_forms" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Event Feedback',
    "fields" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_feedback_forms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_feedback_responses" (
    "id" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "attendeeId" TEXT NOT NULL,
    "responses" JSONB NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_feedback_responses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "events_startDate_idx" ON "events"("startDate");

-- CreateIndex
CREATE INDEX "events_endDate_idx" ON "events"("endDate");

-- CreateIndex
CREATE INDEX "events_isPinned_idx" ON "events"("isPinned");

-- CreateIndex
CREATE INDEX "events_organizedBy_idx" ON "events"("organizedBy");

-- CreateIndex
CREATE INDEX "events_tags_idx" ON "events"("tags");

-- CreateIndex
CREATE INDEX "event_sessions_eventId_idx" ON "event_sessions"("eventId");

-- CreateIndex
CREATE INDEX "event_sessions_userId_idx" ON "event_sessions"("userId");

-- CreateIndex
CREATE INDEX "event_sessions_checkInTime_idx" ON "event_sessions"("checkInTime");

-- CreateIndex
CREATE INDEX "event_sessions_eventId_userId_idx" ON "event_sessions"("eventId", "userId");

-- CreateIndex
CREATE INDEX "event_attendees_eventId_idx" ON "event_attendees"("eventId");

-- CreateIndex
CREATE INDEX "event_attendees_userId_idx" ON "event_attendees"("userId");

-- CreateIndex
CREATE INDEX "event_attendees_isEligible_idx" ON "event_attendees"("isEligible");

-- CreateIndex
CREATE INDEX "event_attendees_notifiedFeedback_idx" ON "event_attendees"("notifiedFeedback");

-- CreateIndex
CREATE UNIQUE INDEX "event_attendees_eventId_userId_key" ON "event_attendees"("eventId", "userId");

-- CreateIndex
CREATE INDEX "event_feedback_forms_eventId_idx" ON "event_feedback_forms"("eventId");

-- CreateIndex
CREATE INDEX "event_feedback_forms_isActive_idx" ON "event_feedback_forms"("isActive");

-- CreateIndex
CREATE INDEX "event_feedback_responses_formId_idx" ON "event_feedback_responses"("formId");

-- CreateIndex
CREATE INDEX "event_feedback_responses_userId_idx" ON "event_feedback_responses"("userId");

-- CreateIndex
CREATE INDEX "event_feedback_responses_attendeeId_idx" ON "event_feedback_responses"("attendeeId");

-- CreateIndex
CREATE INDEX "event_feedback_responses_submittedAt_idx" ON "event_feedback_responses"("submittedAt");

-- CreateIndex
CREATE UNIQUE INDEX "event_feedback_responses_formId_userId_key" ON "event_feedback_responses"("formId", "userId");

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_organizedBy_fkey" FOREIGN KEY ("organizedBy") REFERENCES "users"("username") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_sessions" ADD CONSTRAINT "event_sessions_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_sessions" ADD CONSTRAINT "event_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("username") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_attendees" ADD CONSTRAINT "event_attendees_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_attendees" ADD CONSTRAINT "event_attendees_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("username") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_feedback_forms" ADD CONSTRAINT "event_feedback_forms_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_feedback_responses" ADD CONSTRAINT "event_feedback_responses_formId_fkey" FOREIGN KEY ("formId") REFERENCES "event_feedback_forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_feedback_responses" ADD CONSTRAINT "event_feedback_responses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("username") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_feedback_responses" ADD CONSTRAINT "event_feedback_responses_attendeeId_fkey" FOREIGN KEY ("attendeeId") REFERENCES "event_attendees"("id") ON DELETE CASCADE ON UPDATE CASCADE;
