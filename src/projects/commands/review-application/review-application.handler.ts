import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { ReviewApplicationCommand } from './review-application.command';
import { ApplicationStatus, MemberStatus } from '../../../../generated/prisma';

@Injectable()
@CommandHandler(ReviewApplicationCommand)
export class ReviewApplicationHandler
  implements ICommandHandler<ReviewApplicationCommand>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: ReviewApplicationCommand) {
    const { reviewDto, reviewerId } = command;
    const { applicationId, decision } = reviewDto;

    const application = await this.getApplicationWithDetails(applicationId);
    this.validateApplicationExists(application, applicationId);
    this.validateReviewerIsProjectOwner(application!, reviewerId);
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
          reviewedBy: reviewerId,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              imageUrl: true,
            },
          },
          projectRole: {
            include: {
              role: true,
            },
          },
          reviewer: {
            select: {
              id: true,
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
            projectId: application!.projectId,
            userId: application!.userId,
            projectRoleId: application!.projectRoleId,
            status: MemberStatus.ACTIVE,
          },
        });
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
    reviewerId: string,
  ): void {
    if (application.project.ownerId !== reviewerId) {
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
