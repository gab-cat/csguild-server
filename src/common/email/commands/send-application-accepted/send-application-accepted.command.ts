import { Command } from '@nestjs/cqrs';

export interface SendApplicationAcceptedParams {
  email: string;
  firstName: string;
  projectName: string;
  roleName: string;
  reviewMessage?: string;
}

export class SendApplicationAcceptedCommand extends Command<void> {
  constructor(public readonly params: SendApplicationAcceptedParams) {
    super();
  }
}
