import {
  Controller,
  Post,
  Put,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import {
  CreateFeedbackFormDto,
  UpdateFeedbackFormDto,
  SubmitFeedbackResponseDto,
  FeedbackFormResponseDto,
  FeedbackFormUpdateResponseDto,
  FeedbackSubmissionResponseDto,
  SubmitOrganizerRatingDto,
  OrganizerRatingResponseDto,
} from './dto';
import {
  CreateFeedbackFormCommand,
  UpdateFeedbackFormCommand,
  SubmitFeedbackResponseCommand,
  SubmitOrganizerRatingCommand,
} from './commands';
import { GetFeedbackFormQuery } from './queries';
import { FeedbackTokenService } from './utils';

@ApiTags('Event Feedback')
@Controller('feedback')
export class FeedbackController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly feedbackTokenService: FeedbackTokenService,
  ) {}

  @Post('forms')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a feedback form for an event (Admin/Staff only)',
  })
  @ApiResponse({
    status: 201,
    description: 'Feedback form created successfully',
    type: FeedbackFormResponseDto,
  })
  async createFeedbackForm(
    @Body() createFeedbackFormDto: CreateFeedbackFormDto,
  ): Promise<FeedbackFormResponseDto> {
    return this.commandBus.execute(
      new CreateFeedbackFormCommand(createFeedbackFormDto),
    );
  }

  @Put('forms/:formId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update a feedback form (Admin/Staff only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Feedback form updated successfully',
    type: FeedbackFormUpdateResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Feedback form not found',
  })
  async updateFeedbackForm(
    @Param('formId') formId: string,
    @Body() updateFeedbackFormDto: UpdateFeedbackFormDto,
  ): Promise<FeedbackFormUpdateResponseDto> {
    const updatedForm = await this.commandBus.execute(
      new UpdateFeedbackFormCommand({
        formId,
        ...updateFeedbackFormDto,
      }),
    );

    return {
      message: 'Feedback form updated successfully',
      statusCode: 200,
      feedbackForm: {
        id: updatedForm.id,
        eventId: updatedForm.eventId,
        title: updatedForm.title,
        fields: updatedForm.fields,
        isActive: updatedForm.isActive,
        createdAt: updatedForm.createdAt,
        updatedAt: updatedForm.updatedAt,
      },
    };
  }

  @Get('forms/event/:eventId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get feedback form for an event' })
  @ApiResponse({
    status: 200,
    description: 'Feedback form retrieved successfully',
    type: FeedbackFormResponseDto,
  })
  async getFeedbackForm(
    @Param('eventId') eventId: string,
    @Request() req: any,
  ): Promise<FeedbackFormResponseDto> {
    return this.queryBus.execute(
      new GetFeedbackFormQuery(eventId, req.user.username),
    );
  }

  @Get('forms/event/:eventId/public')
  @ApiOperation({
    summary: 'Get feedback form for an event (public access with token)',
  })
  @ApiQuery({
    name: 'token',
    description: 'JWT token for secure feedback form access',
    required: true,
    type: String,
  })
  @ApiQuery({
    name: 'userId',
    description: 'Username of the attendee',
    required: true,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Feedback form retrieved successfully',
    type: FeedbackFormResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Missing token or userId',
    examples: {
      missingToken: {
        summary: 'Missing token',
        value: {
          message: 'Token is required for public access',
          statusCode: 400,
        },
      },
      missingUserId: {
        summary: 'Missing user ID',
        value: {
          message: 'User ID is required for public access',
          statusCode: 400,
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or expired token',
    examples: {
      invalidToken: {
        summary: 'Invalid token',
        value: {
          message: 'Invalid token for this event or user',
          statusCode: 401,
        },
      },
      expiredToken: {
        summary: 'Expired token',
        value: {
          message: 'Token has expired',
          statusCode: 401,
        },
      },
      malformedToken: {
        summary: 'Malformed token',
        value: {
          message: 'Invalid or malformed token',
          statusCode: 401,
        },
      },
    },
  })
  async getFeedbackFormPublic(
    @Param('eventId') eventId: string,
    @Query('token') token: string,
    @Query('userId') userId: string,
  ): Promise<FeedbackFormResponseDto> {
    // Validate required parameters
    if (!token) {
      throw new BadRequestException('Token is required for public access');
    }
    if (!userId) {
      throw new BadRequestException('User ID is required for public access');
    }

    try {
      // Verify and decode the token
      const tokenPayload = this.feedbackTokenService.verifyFeedbackToken(token);

      // Validate token payload matches request parameters
      if (tokenPayload.eventId !== eventId || tokenPayload.userId !== userId) {
        throw new UnauthorizedException('Invalid token for this event or user');
      }

      // Check if token has expired
      if (Date.now() > tokenPayload.expiresAt) {
        throw new UnauthorizedException('Token has expired');
      }

      // Token is valid, proceed with the request
      return this.queryBus.execute(new GetFeedbackFormQuery(eventId, userId));
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      // Handle JWT verification errors
      throw new UnauthorizedException('Invalid or malformed token');
    }
  }

  @Post('responses')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit feedback response' })
  @ApiResponse({
    status: 201,
    description: 'Feedback response submitted successfully',
    type: FeedbackSubmissionResponseDto,
  })
  async submitFeedbackResponse(
    @Body() submitFeedbackResponseDto: SubmitFeedbackResponseDto,
    @Request() req: any,
  ): Promise<FeedbackSubmissionResponseDto> {
    return this.commandBus.execute(
      new SubmitFeedbackResponseCommand({
        ...submitFeedbackResponseDto,
        userId: req.user.username,
      }),
    );
  }

  @Post('responses/public')
  @ApiOperation({
    summary: 'Submit feedback response (public access with token)',
  })
  @ApiQuery({
    name: 'token',
    description: 'JWT token for secure feedback submission',
    required: true,
    type: String,
  })
  @ApiQuery({
    name: 'userId',
    description: 'Username of the attendee',
    required: true,
    type: String,
  })
  @ApiResponse({
    status: 201,
    description: 'Feedback response submitted successfully',
    type: FeedbackSubmissionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Missing token or userId',
    examples: {
      missingToken: {
        summary: 'Missing token',
        value: {
          message: 'Token is required for public access',
          statusCode: 400,
        },
      },
      missingUserId: {
        summary: 'Missing user ID',
        value: {
          message: 'User ID is required for public access',
          statusCode: 400,
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or expired token',
    examples: {
      invalidUser: {
        summary: 'Invalid token for user',
        value: {
          message: 'Invalid token for this user',
          statusCode: 401,
        },
      },
      invalidForm: {
        summary: 'Invalid token for feedback form',
        value: {
          message: 'Invalid token for this feedback form',
          statusCode: 401,
        },
      },
      expiredToken: {
        summary: 'Expired token',
        value: {
          message: 'Token has expired',
          statusCode: 401,
        },
      },
      malformedToken: {
        summary: 'Malformed token',
        value: {
          message: 'Invalid or malformed token',
          statusCode: 401,
        },
      },
    },
  })
  async submitFeedbackResponsePublic(
    @Body() submitFeedbackResponseDto: SubmitFeedbackResponseDto,
    @Query('token') token: string,
    @Query('userId') userId: string,
  ): Promise<FeedbackSubmissionResponseDto> {
    // Validate required parameters
    if (!token) {
      throw new BadRequestException('Token is required for public access');
    }
    if (!userId) {
      throw new BadRequestException('User ID is required for public access');
    }

    try {
      // Verify and decode the token
      const tokenPayload = this.feedbackTokenService.verifyFeedbackToken(token);

      // Validate token payload matches request parameters
      if (tokenPayload.userId !== userId) {
        throw new UnauthorizedException('Invalid token for this user');
      }

      // Validate that the form ID in the request matches the token
      if (tokenPayload.formId !== submitFeedbackResponseDto.formId) {
        throw new UnauthorizedException('Invalid token for this feedback form');
      }

      // Check if token has expired
      if (Date.now() > tokenPayload.expiresAt) {
        throw new UnauthorizedException('Token has expired');
      }

      // Token is valid, proceed with the request
      return this.commandBus.execute(
        new SubmitFeedbackResponseCommand({
          ...submitFeedbackResponseDto,
          userId,
        }),
      );
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      // Handle JWT verification errors
      throw new UnauthorizedException('Invalid or malformed token');
    }
  }

  @Post('organizer-rating/public')
  @ApiOperation({
    summary: 'Submit organizer rating (public access with token)',
  })
  @ApiQuery({
    name: 'token',
    description: 'JWT token for secure organizer rating submission',
    required: true,
    type: String,
  })
  @ApiQuery({
    name: 'userId',
    description: 'Username of the attendee',
    required: true,
    type: String,
  })
  @ApiResponse({
    status: 201,
    description: 'Organizer rating submitted successfully',
    type: OrganizerRatingResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Missing token, userId, or invalid rating',
    examples: {
      missingToken: {
        summary: 'Missing token',
        value: {
          message: 'Token is required for public access',
          statusCode: 400,
        },
      },
      missingUserId: {
        summary: 'Missing user ID',
        value: {
          message: 'User ID is required for public access',
          statusCode: 400,
        },
      },
      invalidRating: {
        summary: 'Invalid rating',
        value: {
          message: 'Rating must be between 1 and 5',
          statusCode: 400,
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or expired token',
    examples: {
      invalidUser: {
        summary: 'Invalid token for user',
        value: {
          message: 'Invalid token for this user',
          statusCode: 401,
        },
      },
      invalidEvent: {
        summary: 'Invalid token for event',
        value: {
          message: 'Invalid token for this event',
          statusCode: 401,
        },
      },
      expiredToken: {
        summary: 'Expired token',
        value: {
          message: 'Token has expired',
          statusCode: 401,
        },
      },
      malformedToken: {
        summary: 'Malformed token',
        value: {
          message: 'Invalid or malformed token',
          statusCode: 401,
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - Not an eligible attendee or trying to rate yourself',
  })
  @ApiResponse({
    status: 409,
    description:
      'Conflict - You have already rated the organizer for this event',
  })
  async submitOrganizerRatingPublic(
    @Body() submitOrganizerRatingDto: SubmitOrganizerRatingDto,
    @Query('token') token: string,
    @Query('userId') userId: string,
  ): Promise<OrganizerRatingResponseDto> {
    // Validate required parameters
    if (!token) {
      throw new BadRequestException('Token is required for public access');
    }
    if (!userId) {
      throw new BadRequestException('User ID is required for public access');
    }

    try {
      // Verify and decode the token
      const tokenPayload = this.feedbackTokenService.verifyFeedbackToken(token);

      // Validate token payload matches request parameters
      if (tokenPayload.userId !== userId) {
        throw new UnauthorizedException('Invalid token for this user');
      }

      // Check if token has expired
      if (Date.now() > tokenPayload.expiresAt) {
        throw new UnauthorizedException('Token has expired');
      }

      // Token is valid, proceed with the request using eventId from token
      return this.commandBus.execute(
        new SubmitOrganizerRatingCommand({
          eventId: tokenPayload.eventId,
          username: userId,
          rating: submitOrganizerRatingDto.rating,
          comment: submitOrganizerRatingDto.comment,
        }),
      );
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      // Handle JWT verification errors
      throw new UnauthorizedException('Invalid or malformed token');
    }
  }
}
