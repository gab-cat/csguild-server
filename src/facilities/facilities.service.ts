import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import {
  CreateFacilityDto,
  UpdateFacilityDto,
} from './dto/create-facility.dto';
import { Facility, FacilityUsage, User } from 'generated/prisma/client';
import { LoggerService } from '../common/logger/logger.service';

@Injectable()
export class FacilitiesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Create a new facility
   */
  async createFacility(
    createFacilityDto: CreateFacilityDto,
  ): Promise<Facility> {
    const existingFacility = await this.prisma.facility.findUnique({
      where: { name: createFacilityDto.name },
    });

    if (existingFacility) {
      throw new ConflictException('Facility with this name already exists');
    }

    const facility = await this.prisma.facility.create({
      data: {
        name: createFacilityDto.name,
        description: createFacilityDto.description,
        location: createFacilityDto.location,
        capacity: createFacilityDto.capacity,
        isActive: createFacilityDto.isActive ?? true,
      },
    });

    this.logger.info(
      `Created facility: ${facility.name}`,
      null,
      'FacilitiesService',
    );
    return facility;
  }

  /**
   * Get all facilities
   */
  async getFacilities(): Promise<Facility[]> {
    return this.prisma.facility.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Get facility by ID with current occupancy
   */
  async getFacilityById(
    id: string,
  ): Promise<Facility & { currentOccupancy: number }> {
    const facility = await this.prisma.facility.findUnique({
      where: { id },
    });

    if (!facility) {
      throw new NotFoundException('Facility not found');
    }

    const currentOccupancy = await this.prisma.facilityUsage.count({
      where: {
        facilityId: id,
        isActive: true,
      },
    });

    return {
      ...facility,
      currentOccupancy,
    };
  }

  /**
   * Update facility
   */
  async updateFacility(
    id: string,
    updateFacilityDto: UpdateFacilityDto,
  ): Promise<Facility> {
    const facility = await this.prisma.facility.findUnique({
      where: { id },
    });

    if (!facility) {
      throw new NotFoundException('Facility not found');
    }

    // Check if name is being updated and if it conflicts
    if (updateFacilityDto.name && updateFacilityDto.name !== facility.name) {
      const existingFacility = await this.prisma.facility.findUnique({
        where: { name: updateFacilityDto.name },
      });

      if (existingFacility) {
        throw new ConflictException('Facility with this name already exists');
      }
    }

    const updatedFacility = await this.prisma.facility.update({
      where: { id },
      data: updateFacilityDto,
    });

    this.logger.info(
      `Updated facility: ${updatedFacility.name}`,
      null,
      'FacilitiesService',
    );
    return updatedFacility;
  }

  /**
   * Delete facility (soft delete by setting isActive to false)
   */
  async deleteFacility(id: string): Promise<void> {
    const facility = await this.prisma.facility.findUnique({
      where: { id },
    });

    if (!facility) {
      throw new NotFoundException('Facility not found');
    }

    // Check if there are active sessions
    const activeSessions = await this.prisma.facilityUsage.count({
      where: {
        facilityId: id,
        isActive: true,
      },
    });

    if (activeSessions > 0) {
      throw new BadRequestException(
        'Cannot delete facility with active sessions',
      );
    }

    await this.prisma.facility.update({
      where: { id },
      data: { isActive: false },
    });

    this.logger.info(
      `Deleted facility: ${facility.name}`,
      null,
      'FacilitiesService',
    );
  }

  /**
   * Toggle facility access (time-in or time-out) using RFID
   */
  async toggleFacilityAccess(
    rfidId: string,
    facilityId: string,
  ): Promise<{
    action: 'time-in' | 'time-out';
    session: FacilityUsage & { user: User; facility: Facility };
  }> {
    // Find user by RFID
    const user = await this.prisma.user.findUnique({
      where: { rfidId },
    });

    if (!user) {
      throw new NotFoundException('RFID card not registered');
    }

    if (!user.emailVerified) {
      throw new BadRequestException(
        'Email must be verified before using facilities',
      );
    }

    // Check if facility exists and is active
    const facility = await this.prisma.facility.findUnique({
      where: { id: facilityId },
    });

    if (!facility) {
      throw new NotFoundException('Facility not found');
    }

    if (!facility.isActive) {
      throw new BadRequestException('Facility is not active');
    }

    // Check user's current facility status
    if (user.currentFacilityId) {
      if (user.currentFacilityId === facilityId) {
        // User is currently in this facility, time them out
        return {
          action: 'time-out',
          session: await this.performTimeOut(user.id, facilityId),
        };
      } else {
        // User is in a different facility, they need to time out first
        const currentFacility = await this.prisma.facility.findUnique({
          where: { id: user.currentFacilityId },
        });
        throw new ConflictException(
          `Student is currently in ${currentFacility?.name || 'another facility'}. Please time out first.`,
        );
      }
    } else {
      // User is not in any facility, time them in
      return {
        action: 'time-in',
        session: await this.performTimeIn(user.id, facilityId),
      };
    }
  }

  /**
   * Private method to perform time-in operation
   */
  private async performTimeIn(
    userId: string,
    facilityId: string,
  ): Promise<FacilityUsage & { user: User; facility: Facility }> {
    // Check facility capacity
    const facility = await this.prisma.facility.findUnique({
      where: { id: facilityId },
    });

    if (facility?.capacity) {
      const currentOccupancy = await this.prisma.facilityUsage.count({
        where: {
          facilityId,
          isActive: true,
        },
      });

      if (currentOccupancy >= facility.capacity) {
        throw new BadRequestException('Facility is at full capacity');
      }
    }

    // Double-check that user doesn't have an active session in this facility
    const existingActiveSession = await this.prisma.facilityUsage.findFirst({
      where: {
        userId,
        facilityId,
        isActive: true,
      },
    });

    if (existingActiveSession) {
      throw new ConflictException(
        'User already has an active session in this facility',
      );
    }

    // Create new usage session and update user's current facility
    const [facilityUsage] = await this.prisma.$transaction([
      this.prisma.facilityUsage.create({
        data: {
          userId,
          facilityId,
          timeIn: new Date(),
          isActive: true,
        },
        include: {
          user: true,
          facility: true,
        },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: { currentFacilityId: facilityId },
      }),
    ]);

    this.logger.info(
      `Student ${facilityUsage.user.username} timed in to facility ${facilityUsage.facility.name}`,
      facilityUsage.user,
      'FacilitiesService',
    );

    return facilityUsage;
  }

  /**
   * Private method to perform time-out operation
   */
  private async performTimeOut(
    userId: string,
    facilityId: string,
  ): Promise<FacilityUsage & { user: User; facility: Facility }> {
    // Find active session
    const activeSession = await this.prisma.facilityUsage.findFirst({
      where: {
        userId,
        facilityId,
        isActive: true,
      },
      orderBy: {
        timeIn: 'desc', // Get the most recent active session
      },
    });

    if (!activeSession) {
      throw new NotFoundException(
        'No active session found for this student in this facility',
      );
    }

    // Update session to mark as completed and clear user's current facility
    const [updatedSession] = await this.prisma.$transaction([
      this.prisma.facilityUsage.update({
        where: { id: activeSession.id },
        data: {
          timeOut: new Date(),
          isActive: false,
        },
        include: {
          user: true,
          facility: true,
        },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: { currentFacilityId: null },
      }),
    ]);

    this.logger.info(
      `Student ${updatedSession.user.username} timed out from facility ${updatedSession.facility.name}`,
      updatedSession.user,
      'FacilitiesService',
    );

    return updatedSession;
  }

  /**
   * Get facility usage status for a student
   */
  async getUsageStatus(
    rfidId: string,
    facilityId: string,
  ): Promise<{
    isCurrentlyInFacility: boolean;
    currentSession?: FacilityUsage & { user: User; facility: Facility };
  }> {
    // Find user by RFID
    const user = await this.prisma.user.findUnique({
      where: { rfidId },
    });

    if (!user) {
      throw new NotFoundException('RFID card not registered');
    }

    // Find active session
    const activeSession = await this.prisma.facilityUsage.findFirst({
      where: {
        userId: user.id,
        facilityId,
        isActive: true,
      },
      include: {
        user: true,
        facility: true,
      },
    });

    return {
      isCurrentlyInFacility: !!activeSession,
      currentSession: activeSession || undefined,
    };
  }

  /**
   * Get all active sessions for a facility
   */
  async getActiveSessions(
    facilityId: string,
  ): Promise<(FacilityUsage & { user: User })[]> {
    const facility = await this.prisma.facility.findUnique({
      where: { id: facilityId },
    });

    if (!facility) {
      throw new NotFoundException('Facility not found');
    }

    return this.prisma.facilityUsage.findMany({
      where: {
        facilityId,
        isActive: true,
      },
      include: {
        user: true,
      },
      orderBy: { timeIn: 'asc' },
    });
  }

  /**
   * Get usage history for a facility
   */
  async getFacilityUsageHistory(
    facilityId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{
    data: (FacilityUsage & { user: User })[];
    total: number;
    page: number;
    limit: number;
  }> {
    const facility = await this.prisma.facility.findUnique({
      where: { id: facilityId },
    });

    if (!facility) {
      throw new NotFoundException('Facility not found');
    }

    const [data, total] = await Promise.all([
      this.prisma.facilityUsage.findMany({
        where: { facilityId },
        include: {
          user: true,
        },
        orderBy: { timeIn: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.facilityUsage.count({
        where: { facilityId },
      }),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  /**
   * Get usage history for a student
   */
  async getStudentUsageHistory(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{
    data: (FacilityUsage & { facility: Facility })[];
    total: number;
    page: number;
    limit: number;
  }> {
    const [data, total] = await Promise.all([
      this.prisma.facilityUsage.findMany({
        where: { userId },
        include: {
          facility: true,
        },
        orderBy: { timeIn: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.facilityUsage.count({
        where: { userId },
      }),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  /**
   * Calculate session duration in minutes
   */
  calculateSessionDuration(timeIn: Date, timeOut?: Date): number | null {
    if (!timeOut) {
      return null;
    }

    const diffInMs = timeOut.getTime() - timeIn.getTime();
    return Math.floor(diffInMs / (1000 * 60));
  }

  /**
   * Format duration for display
   */
  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
    }

    return `${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
  }

  /**
   * Clean up orphaned sessions (sessions that are marked as active but user's currentFacilityId is null)
   * This is a utility method for data consistency
   */
  async cleanupOrphanedSessions(): Promise<number> {
    const orphanedSessions = await this.prisma.facilityUsage.findMany({
      where: {
        isActive: true,
        user: {
          currentFacilityId: null,
        },
      },
      include: {
        user: true,
        facility: true,
      },
    });

    if (orphanedSessions.length === 0) {
      return 0;
    }

    // Clean up orphaned sessions
    const cleanupPromises = orphanedSessions.map(async (session) => {
      await this.prisma.facilityUsage.update({
        where: { id: session.id },
        data: {
          timeOut: new Date(),
          isActive: false,
        },
      });

      this.logger.warn(
        `Cleaned up orphaned session for user ${session.user.username} in facility ${session.facility.name}`,
        session.user,
        'FacilitiesService',
      );
    });

    await Promise.all(cleanupPromises);

    this.logger.info(
      `Cleaned up ${orphanedSessions.length} orphaned sessions`,
      null,
      'FacilitiesService',
    );

    return orphanedSessions.length;
  }
}
