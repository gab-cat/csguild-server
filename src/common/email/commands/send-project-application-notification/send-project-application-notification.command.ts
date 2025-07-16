import { Command } from '@nestjs/cqrs';

export interface SendProjectApplicationNotificationParams {
  email: string;
  firstName: string;
  projects: {
    name: string;
    slug: string;
    applicationCount: number;
    applications: {
      applicantName: string;
      applicantEmail: string;
      roleName: string;
      message: string;
      appliedAt: Date;
    }[];
  }[];
  totalApplications: number;
  timeWindow: string;
  schedule: string;
}

export class SendProjectApplicationNotificationCommand extends Command<void> {
  constructor(
    public readonly params: SendProjectApplicationNotificationParams,
  ) {
    super();
  }
}
