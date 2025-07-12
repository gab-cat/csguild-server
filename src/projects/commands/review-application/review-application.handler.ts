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

    // Get application with project details
    const application = await this.prisma.projectApplication.findUnique({
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

    if (!application) {
      throw new NotFoundException(
        `Application with ID ${applicationId} not found`,
      );
    }

    // Check if reviewer is the project owner
    if (application.project.ownerId !== reviewerId) {
      throw new ForbiddenException(
        'Only the project owner can review applications',
      );
    }

    // Check if application is still pending
    if (application.status !== ApplicationStatus.PENDING) {
      throw new BadRequestException(
        'This application has already been reviewed',
      );
    }

    const newStatus =
      decision === 'APPROVED'
        ? ApplicationStatus.APPROVED
        : ApplicationStatus.REJECTED;

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
            projectId: application.projectId,
            userId: application.userId,
            projectRoleId: application.projectRoleId,
            status: MemberStatus.ACTIVE,
          },
        });
      }

      return updatedApplication;
    });
  }
}
