export class SendApplicationNotificationCommand {
  constructor(
    public readonly ownerEmail: string,
    public readonly ownerFirstName: string,
    public readonly projects: {
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
    }[],
    public readonly totalApplications: number,
    public readonly timeWindow: string,
    public readonly schedule: string,
  ) {}
}
