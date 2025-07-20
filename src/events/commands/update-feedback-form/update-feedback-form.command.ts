import { Command } from '@nestjs/cqrs';
import { FeedbackFormFieldDto } from '../../dto/request/feedback/feedback-form-field.dto';

export interface UpdateFeedbackFormParams {
  formId: string;
  title?: string;
  fields?: FeedbackFormFieldDto[];
  isActive?: boolean;
}

export class UpdateFeedbackFormCommand extends Command<any> {
  constructor(public readonly params: UpdateFeedbackFormParams) {
    super();
  }
}
