import { Command } from '@nestjs/cqrs';
import { FeedbackFormFieldDto } from '../../dto/request/feedback/feedback-form-field.dto';

export interface CreateFeedbackFormParams {
  eventId: string;
  title?: string;
  fields: FeedbackFormFieldDto[];
}

export class CreateFeedbackFormCommand extends Command<any> {
  constructor(public readonly params: CreateFeedbackFormParams) {
    super();
  }
}
