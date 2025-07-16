import { Command } from '@nestjs/cqrs';

export interface SendApplicationRejectedParams {
  email: string;
  firstName: string;
  projectName: string;
  roleName: string;
  reviewMessage?: string;
}

export class SendApplicationRejectedCommand extends Command<void> {
  constructor(public readonly params: SendApplicationRejectedParams) {
    super();
  }
}
