import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { EmailService } from '../../../common/email/email.service';
import { ReviewApplicationCommand } from './review-application.command';
import { ApplicationStatus, MemberStatus } from '../../../../generated/prisma';

@Injectable()
@CommandHandler(ReviewApplicationCommand)
export class ReviewApplicationHandler
  implements ICommandHandler<ReviewApplicationCommand>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async execute(command: ReviewApplicationCommand) {
    const { reviewDto, reviewerSlug } = command;
    const { applicationId, decision, reviewMessage } = reviewDto;

    const application = await this.getApplicationWithDetails(applicationId);
    this.validateApplicationExists(application, applicationId);
    this.validateReviewerIsProjectOwner(application!, reviewerSlug);
    this.validateApplicationIsPending(application!);

    const newStatus = this.determineNewStatus(decision);

    // Use transaction for approval to ensure consistency
    return this.prisma.$transaction(async (tx) => {
      // Update application status
      const updatedApplication = await tx.projectApplication.update({
        where: { id: applicationId },
        data: {
          status: newStatus,
          reviewedAt: new Date(),
          reviewedBySlug: reviewerSlug,
          reviewMessage: reviewMessage,
        },
        include: {
          user: {
            select: {
              username: true,
              firstName: true,
              lastName: true,
              imageUrl: true,
              email: true,
            },
          },
          project: {
            select: {
              title: true,
              slug: true,
            },
          },
          projectRole: {
            include: {
              role: true,
            },
          },
          reviewer: {
            select: {
              username: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      // If approved, create project member
      if (decision === 'APPROVED') {
        await tx.projectMember.create({
          data: {
            projectSlug: application!.projectSlug,
            userSlug: application!.userSlug,
            roleSlug: application!.roleSlug,
            status: MemberStatus.ACTIVE,
          },
        });
      }

      // Send email notification after successful database update
      try {
        if (decision === 'APPROVED') {
          await this.emailService.sendApplicationAccepted({
            email: updatedApplication.user.email,
            firstName: updatedApplication.user.firstName,
            projectName: updatedApplication.project.title,
            roleName: updatedApplication.projectRole.role.name,
            reviewMessage: reviewMessage,
          });
        } else {
          await this.emailService.sendApplicationRejected({
            email: updatedApplication.user.email,
            firstName: updatedApplication.user.firstName,
            projectName: updatedApplication.project.title,
            roleName: updatedApplication.projectRole.role.name,
            reviewMessage: reviewMessage,
          });
        }
      } catch (emailError) {
        // Log email error but don't fail the transaction
        console.error('Failed to send application review email:', emailError);
      }

      return updatedApplication;
    });
  }

  private async getApplicationWithDetails(applicationId: string) {
    return this.prisma.projectApplication.findUnique({
      where: { id: applicationId },
      include: {
        project: {
          include: {
            owner: true,
          },
        },
        projectRole: {
          include: {
            members: true,
          },
        },
        user: true,
      },
    });
  }

  private validateApplicationExists(
    application: any,
    applicationId: string,
  ): void {
    if (!application) {
      throw new NotFoundException(
        `Application with ID ${applicationId} not found`,
      );
    }
  }

  private validateReviewerIsProjectOwner(
    application: any,
    reviewerSlug: string,
  ): void {
    if (application.project.ownerSlug !== reviewerSlug) {
      throw new ForbiddenException(
        'Only the project owner can review applications',
      );
    }
  }

  private validateApplicationIsPending(application: any): void {
    if (application.status !== ApplicationStatus.PENDING) {
      throw new BadRequestException(
        'This application has already been reviewed',
      );
    }
  }

  private determineNewStatus(decision: string): ApplicationStatus {
    return decision === 'APPROVED'
      ? ApplicationStatus.APPROVED
      : ApplicationStatus.REJECTED;
  }
}
