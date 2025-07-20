import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { EventsQueryController } from './events-query.controller';
import { EventsCommandController } from './events-command.controller';
import { EventsAdminController } from './events-admin.controller';
import { FeedbackController } from './feedback.controller';
import { PrismaModule } from '../common/prisma/prisma.module';
import { LoggerModule } from '../common/logger/logger.module';
import { UtilsModule } from '../common/utils/utils.module';
import { EmailModule } from '../common/email/email.module';
import { FeedbackTokenService } from './utils';

// Command Handlers
import {
  CreateEventHandler,
  UpdateEventHandler,
  DeleteEventHandler,
  PinEventHandler,
  UnpinEventHandler,
  ToggleSessionHandler,
  RegisterToEventHandler,
  CreateFeedbackFormHandler,
  UpdateFeedbackFormHandler,
  SubmitFeedbackResponseHandler,
  SubmitOrganizerRatingHandler,
} from './commands';

// Query Handlers
import {
  FindAllEventsHandler,
  FindEventBySlugHandler,
  GetMyAttendedEventsHandler,
  GetMyCreatedEventsHandler,
  GetPinnedEventsHandler,
  GetEventSessionsHandler,
  GetFeedbackFormHandler,
  GetEventAttendeesHandler,
  CheckFeedbackResponseHandler,
  GetEventFeedbackResponsesHandler,
  GetOrganizerStatisticsHandler,
} from './queries';

const CommandHandlers = [
  CreateEventHandler,
  UpdateEventHandler,
  DeleteEventHandler,
  PinEventHandler,
  UnpinEventHandler,
  ToggleSessionHandler,
  RegisterToEventHandler,
  CreateFeedbackFormHandler,
  UpdateFeedbackFormHandler,
  SubmitFeedbackResponseHandler,
  SubmitOrganizerRatingHandler,
];

const QueryHandlers = [
  FindAllEventsHandler,
  FindEventBySlugHandler,
  GetMyAttendedEventsHandler,
  GetMyCreatedEventsHandler,
  GetPinnedEventsHandler,
  GetEventSessionsHandler,
  GetFeedbackFormHandler,
  GetEventAttendeesHandler,
  CheckFeedbackResponseHandler,
  GetEventFeedbackResponsesHandler,
  GetOrganizerStatisticsHandler,
];

@Module({
  imports: [PrismaModule, LoggerModule, UtilsModule, EmailModule, CqrsModule],
  controllers: [
    EventsQueryController,
    EventsCommandController,
    EventsAdminController,
    FeedbackController,
  ],
  providers: [...CommandHandlers, ...QueryHandlers, FeedbackTokenService],
})
export class EventsModule {}
