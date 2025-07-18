import { Command } from '@nestjs/cqrs';

export interface SubmitFeedbackResponseParams {
  formId: string;
  userId: string;
  responses: Record<string, any>;
}

export class SubmitFeedbackResponseCommand extends Command<any> {
  constructor(public readonly params: SubmitFeedbackResponseParams) {
    super();
  }
}
