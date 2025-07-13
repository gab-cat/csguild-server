import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { FacilitiesService } from './facilities.service';
import {
  CreateFacilityDto,
  UpdateFacilityDto,
} from './dto/create-facility.dto';
import { FacilityUsageStatusDto } from './dto/facility-time-in.dto';
import {
  FacilityToggleDto,
  FacilityToggleResponseDto,
} from './dto/facility-toggle.dto';
import {
  FacilityResponseDto,
  FacilityUsageStatusResponseDto,
  FacilityUsageResponseDto,
} from './dto/facility-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { Role, User } from '../../generated/prisma';
import { LoggerService } from '../common/logger/logger.service';

@ApiTags('Facilities')
@Controller('facilities')
export class FacilitiesController {
  constructor(
    private readonly facilitiesService: FacilitiesService,
    private readonly logger: LoggerService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STAFF, Role.ADMIN)
  @ApiOperation({
    summary: 'Create a new facility (staff/admin only)',
    description: `
      Creates a new facility for student use.
      
      ## Authentication required:
      This endpoint requires a valid JWT access token and STAFF or ADMIN role.
      
      ## How it works:
      1. Validates facility name is unique
      2. Creates facility with provided details
      3. Sets default values for optional fields
      4. Returns created facility information
      
      ## Facility Management:
      - Facilities can have capacity limits
      - Facilities can be temporarily deactivated
      - Facilities support location and description metadata
    `,
  })
  @ApiCookieAuth('Authentication')
  @ApiBody({ type: CreateFacilityDto })
  @ApiResponse({
    status: 201,
    description: 'Facility created successfully',
    type: FacilityResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid JWT token, or insufficient permissions',
  })
  @ApiConflictResponse({
    description: 'Facility with this name already exists',
  })
  async createFacility(
    @Body() createFacilityDto: CreateFacilityDto,
    @CurrentUser() user: User,
  ) {
    const facility =
      await this.facilitiesService.createFacility(createFacilityDto);
    const facilityWithOccupancy = await this.facilitiesService.getFacilityById(
      facility.id,
    );

    this.logger.info(
      `Created facility: ${facility.name}`,
      user,
      'FacilitiesController',
    );

    return {
      ...facilityWithOccupancy,
    };
  }

  @Get()
  @ApiOperation({
    summary: 'Get all active facilities',
    description: `
      Retrieves all active facilities available for student use.
      
      ## How it works:
      1. Returns all facilities where isActive is true
      2. Includes current occupancy count for each facility
      3. Sorted alphabetically by facility name
      
      ## Public Access:
      This endpoint is public and does not require authentication.
      Students can view available facilities before timing in.
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'List of active facilities',
    type: [FacilityResponseDto],
  })
  async getFacilities(): Promise<FacilityResponseDto[]> {
    const facilities = await this.facilitiesService.getFacilities();

    // Get current occupancy for each facility
    const facilitiesWithOccupancy = await Promise.all(
      facilities.map(async (facility) => {
        const facilityWithOccupancy =
          await this.facilitiesService.getFacilityById(facility.id);
        return facilityWithOccupancy;
      }),
    );

    return facilitiesWithOccupancy;
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get facility by ID',
    description: `
      Retrieves detailed information about a specific facility.
      
      ## How it works:
      1. Returns facility details including current occupancy
      2. Includes all facility metadata
      3. Shows real-time occupancy status
      
      ## Public Access:
      This endpoint is public and does not require authentication.
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'Facility ID',
    example: 'clm7x8k9e0000v8og4n2h5k7s',
  })
  @ApiResponse({
    status: 200,
    description: 'Facility information',
    type: FacilityResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Facility not found',
  })
  async getFacility(@Param('id') id: string): Promise<FacilityResponseDto> {
    return this.facilitiesService.getFacilityById(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STAFF, Role.ADMIN)
  @ApiOperation({
    summary: 'Update facility (staff/admin only)',
    description: `
      Updates an existing facility's information.
      
      ## Authentication required:
      This endpoint requires a valid JWT access token and STAFF or ADMIN role.
      
      ## How it works:
      1. Validates facility exists
      2. Checks for name conflicts if name is being updated
      3. Updates facility with provided changes
      4. Returns updated facility information
    `,
  })
  @ApiCookieAuth('Authentication')
  @ApiParam({
    name: 'id',
    description: 'Facility ID',
    example: 'clm7x8k9e0000v8og4n2h5k7s',
  })
  @ApiBody({ type: UpdateFacilityDto })
  @ApiResponse({
    status: 200,
    description: 'Facility updated successfully',
    type: FacilityResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid JWT token, or insufficient permissions',
  })
  @ApiNotFoundResponse({
    description: 'Facility not found',
  })
  @ApiConflictResponse({
    description: 'Facility with this name already exists',
  })
  async updateFacility(
    @Param('id') id: string,
    @Body() updateFacilityDto: UpdateFacilityDto,
    @CurrentUser() user: User,
  ) {
    const facility = await this.facilitiesService.updateFacility(
      id,
      updateFacilityDto,
    );
    const facilityWithOccupancy = await this.facilitiesService.getFacilityById(
      facility.id,
    );

    this.logger.info(
      `Updated facility: ${facility.name}`,
      user,
      'FacilitiesController',
    );

    return facilityWithOccupancy;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STAFF, Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete facility (staff/admin only)',
    description: `
      Soft deletes a facility by setting isActive to false.
      
      ## Authentication required:
      This endpoint requires a valid JWT access token and STAFF or ADMIN role.
      
      ## How it works:
      1. Validates facility exists
      2. Checks for active sessions (prevents deletion if students are still checked in)
      3. Sets facility as inactive instead of hard deletion
      4. Preserves historical data
      
      ## Safety Features:
      - Cannot delete facility with active sessions
      - Soft delete preserves usage history
      - Can be reactivated later if needed
    `,
  })
  @ApiCookieAuth('Authentication')
  @ApiParam({
    name: 'id',
    description: 'Facility ID',
    example: 'clm7x8k9e0000v8og4n2h5k7s',
  })
  @ApiResponse({
    status: 204,
    description: 'Facility deleted successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid JWT token, or insufficient permissions',
  })
  @ApiNotFoundResponse({
    description: 'Facility not found',
  })
  @ApiBadRequestResponse({
    description: 'Cannot delete facility with active sessions',
  })
  async deleteFacility(@Param('id') id: string, @CurrentUser() user: User) {
    await this.facilitiesService.deleteFacility(id);
    this.logger.info(
      `Deleted facility with ID: ${id}`,
      user,
      'FacilitiesController',
    );
  }

  @Post('toggle')
  @ApiOperation({
    summary: 'Toggle facility access using RFID',
    description: `
      Smart endpoint that automatically handles both time-in and time-out based on current status.
      
      ## How it works:
      1. Validates RFID card is registered and email is verified
      2. Checks if facility exists and is active
      3. Automatically detects student's current facility status:
         - If not in any facility: performs time-in
         - If in the same facility: performs time-out
         - If in different facility: returns error (must time-out first)
      4. Updates user's current facility tracking
      5. Returns action performed and session information
      
      ## Requirements:
      - RFID card must be registered to a student
      - Student email must be verified
      - Facility must be active
      - For time-in: facility must have available capacity
      - For time-out: student must have active session
      
      ## Use Cases:
      - Single RFID reader at facility entrance/exit
      - Automatic time-in/time-out detection
      - Simplified integration for RFID hardware
      - Prevents double check-ins
      - Real-time facility occupancy tracking
    `,
  })
  @ApiBody({ type: FacilityToggleDto })
  @ApiResponse({
    status: 200,
    description: 'Facility access toggled successfully',
    type: FacilityToggleResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'RFID card not registered or facility not found',
  })
  @ApiBadRequestResponse({
    description:
      'Email not verified, facility not active, or facility at capacity',
  })
  @ApiConflictResponse({
    description: 'Student is in different facility - must time out first',
  })
  async toggleFacilityAccess(
    @Body() toggleDto: FacilityToggleDto,
  ): Promise<FacilityToggleResponseDto> {
    const result = await this.facilitiesService.toggleFacilityAccess(
      toggleDto.rfidId,
      toggleDto.facilityId,
    );

    const durationMinutes =
      result.action === 'time-out'
        ? this.facilitiesService.calculateSessionDuration(
            result.session.timeIn,
            result.session.timeOut ?? undefined,
          )
        : null;

    const actionMessage =
      result.action === 'time-in'
        ? 'Time-in successful'
        : 'Time-out successful';

    const actionDetails =
      result.action === 'time-in'
        ? `Successfully checked in to ${result.session.facility.name}`
        : `Successfully checked out from ${result.session.facility.name}${
            durationMinutes
              ? `. Session duration: ${this.facilitiesService.formatDuration(durationMinutes)}`
              : ''
          }`;

    return {
      message: actionMessage,
      statusCode: result.action === 'time-in' ? 201 : 200,
      action: result.action,
      details: actionDetails,
      student: {
        id: result.session.user.id,
        firstName: result.session.user.firstName ?? '',
        lastName: result.session.user.lastName ?? '',
        username: result.session.user.username ?? '',
        email: result.session.user.email ?? '',
        imageUrl: result.session.user.imageUrl ?? '',
        course: result.session.user.course ?? '',
      },
      facility: {
        id: result.session.facility.id,
        name: result.session.facility.name,
        location: result.session.facility.location ?? undefined,
      },
      session: {
        id: result.session.id,
        timeIn: result.session.timeIn,
        timeOut: result.session.timeOut ?? undefined,
        isActive: result.session.isActive,
        durationMinutes: durationMinutes ?? undefined,
      },
    };
  }

  @Post('status')
  @ApiOperation({
    summary: 'Check facility usage status using RFID',
    description: `
      Checks if a student is currently checked in to a specific facility.
      
      ## How it works:
      1. Validates RFID card is registered
      2. Looks for active session in the specified facility
      3. Returns current status and session details
      
      ## Requirements:
      - RFID card must be registered to a student
      
      ## Use Cases:
      - Status verification at facility entrance
      - Integration with access control systems
      - Monitoring and reporting
      - Troubleshooting check-in issues
    `,
  })
  @ApiBody({ type: FacilityUsageStatusDto })
  @ApiResponse({
    status: 200,
    description: 'Usage status retrieved successfully',
    type: FacilityUsageStatusResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'RFID card not registered',
  })
  async getUsageStatus(
    @Body() statusDto: FacilityUsageStatusDto,
  ): Promise<FacilityUsageStatusResponseDto> {
    const status = await this.facilitiesService.getUsageStatus(
      statusDto.rfidId,
      statusDto.facilityId,
    );

    let currentSessionResponse: FacilityUsageResponseDto | undefined;

    if (status.currentSession) {
      currentSessionResponse = {
        id: status.currentSession.id,
        student: {
          id: status.currentSession.user.id,
          firstName: status.currentSession.user.firstName || '',
          lastName: status.currentSession.user.lastName || '',
          username: status.currentSession.user.username,
          email: status.currentSession.user.email,
        },
        facility: {
          id: status.currentSession.facility.id,
          name: status.currentSession.facility.name,
          location: status.currentSession.facility.location,
        },
        timeIn: status.currentSession.timeIn,
        timeOut: status.currentSession.timeOut,
        isActive: status.currentSession.isActive,
        durationMinutes: null,
      };
    }

    return {
      message: 'Usage status retrieved successfully',
      statusCode: 200,
      isCurrentlyInFacility: status.isCurrentlyInFacility,
      currentSession: currentSessionResponse,
    };
  }

  @Get(':id/active-sessions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STAFF, Role.ADMIN)
  @ApiOperation({
    summary: 'Get active sessions for facility (staff/admin only)',
    description: `
      Retrieves all currently active sessions for a specific facility.
      
      ## Authentication required:
      This endpoint requires a valid JWT access token and STAFF or ADMIN role.
      
      ## How it works:
      1. Returns all active sessions for the facility
      2. Includes student information for each session
      3. Sorted by time-in timestamp
      
      ## Use Cases:
      - Real-time occupancy monitoring
      - Emergency evacuation procedures
      - Facility management
      - Usage analytics
    `,
  })
  @ApiCookieAuth('Authentication')
  @ApiParam({
    name: 'id',
    description: 'Facility ID',
    example: 'clm7x8k9e0000v8og4n2h5k7s',
  })
  @ApiResponse({
    status: 200,
    description: 'Active sessions retrieved successfully',
    type: [FacilityUsageResponseDto],
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid JWT token, or insufficient permissions',
  })
  @ApiNotFoundResponse({
    description: 'Facility not found',
  })
  async getActiveSessions(
    @Param('id') id: string,
  ): Promise<FacilityUsageResponseDto[]> {
    const sessions = await this.facilitiesService.getActiveSessions(id);

    return sessions.map((session) => ({
      id: session.id,
      student: {
        id: session.user.id,
        firstName: session.user.firstName || '',
        lastName: session.user.lastName || '',
        username: session.user.username,
        email: session.user.email,
      },
      facility: {
        id: session.facilityId,
        name: '', // Will be filled by service if needed
        location: '',
      },
      timeIn: session.timeIn,
      timeOut: session.timeOut,
      isActive: session.isActive,
      durationMinutes: 0,
    }));
  }

  @Get(':id/usage-history')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STAFF, Role.ADMIN)
  @ApiOperation({
    summary: 'Get facility usage history (staff/admin only)',
    description: `
      Retrieves paginated usage history for a specific facility.
      
      ## Authentication required:
      This endpoint requires a valid JWT access token and STAFF or ADMIN role.
      
      ## How it works:
      1. Returns paginated usage history
      2. Includes both active and completed sessions
      3. Sorted by time-in timestamp (newest first)
      4. Supports pagination for large datasets
      
      ## Use Cases:
      - Usage analytics and reporting
      - Historical data analysis
      - Audit trails
      - Performance monitoring
    `,
  })
  @ApiCookieAuth('Authentication')
  @ApiParam({
    name: 'id',
    description: 'Facility ID',
    example: 'clm7x8k9e0000v8og4n2h5k7s',
  })
  @ApiQuery({
    name: 'page',
    description: 'Page number (default: 1)',
    required: false,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Records per page (default: 20)',
    required: false,
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: 'Usage history retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/FacilityUsageResponseDto' },
        },
        total: { type: 'number', example: 150 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 20 },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid JWT token, or insufficient permissions',
  })
  @ApiNotFoundResponse({
    description: 'Facility not found',
  })
  async getFacilityUsageHistory(
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const result = await this.facilitiesService.getFacilityUsageHistory(
      id,
      page || 1,
      limit || 20,
    );

    const data = result.data.map((session) => {
      const durationMinutes = this.facilitiesService.calculateSessionDuration(
        session.timeIn,
        session.timeOut,
      );

      return {
        id: session.id,
        student: {
          id: session.user.id,
          firstName: session.user.firstName || '',
          lastName: session.user.lastName || '',
          username: session.user.username,
          email: session.user.email,
        },
        facility: {
          id: session.facilityId,
          name: '', // Will be filled by service if needed
          location: '',
        },
        timeIn: session.timeIn,
        timeOut: session.timeOut,
        isActive: session.isActive,
        durationMinutes,
      };
    });

    return {
      data,
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }
}
