import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import {
  CreateProjectDto,
  JoinProjectDto,
  UpdateProjectDto,
  UpdateProjectStatusDto,
  ReviewApplicationDto,
  ProjectCreateResponseDto,
  ProjectUpdateResponseDto,
  ProjectStatusUpdateResponseDto,
  ProjectDeleteResponseDto,
  JoinProjectResponseDto,
  ReviewApplicationResponseDto,
  RemoveProjectMemberResponseDto,
  ReactivateProjectMemberResponseDto,
  SaveProjectResponseDto,
  UnsaveProjectResponseDto,
  SaveProjectErrorResponseDto,
  UnsaveProjectErrorResponseDto,
} from './dto';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

// Commands
import {
  CreateProjectCommand,
  UpdateProjectCommand,
  UpdateProjectStatusCommand,
  DeleteProjectCommand,
  JoinProjectCommand,
  ReviewApplicationCommand,
  RemoveProjectMemberCommand,
  ReactivateProjectMemberCommand,
  SaveProjectCommand,
  UnsaveProjectCommand,
} from './commands';

// Queries
import { User } from '../../generated/prisma';

@ApiTags('Projects')
@Controller('projects')
export class ProjectsCommandController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new project' })
  @ApiBody({
    type: CreateProjectDto,
    description: 'Project creation data',
    examples: {
      example1: {
        summary: 'Basic project example',
        value: {
          title: 'CS Guild Mobile App Development',
          description:
            'We are looking for developers to help build a mobile application for the CS Guild community. ' +
            'The app will include features for project collaboration, event management, and member networking.',
          tags: ['mobile', 'react-native', 'typescript', 'collaboration'],
          dueDate: '2024-12-31T23:59:59.000Z',
          roles: [
            {
              roleSlug: 'frontend-developer',
              maxMembers: 2,
              requirements:
                'Experience with React Native and TypeScript required',
            },
            {
              roleSlug: 'ui-ux-designer',
              maxMembers: 1,
              requirements: 'UI/UX design experience with mobile applications',
            },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Project created successfully',
    type: ProjectCreateResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - valid JWT token required',
  })
  async create(
    @Body() createProjectDto: CreateProjectDto,
    @CurrentUser() user: User,
  ): Promise<ProjectCreateResponseDto> {
    const project = await this.commandBus.execute(
      new CreateProjectCommand(createProjectDto, user.username),
    );
    return {
      message: 'Project created successfully',
      statusCode: 201,
      project,
    };
  }

  @Patch(':slug')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update a project',
    description:
      'Update project details. Only the project owner can update the project.',
  })
  @ApiParam({
    name: 'slug',
    description: 'Project slug',
    example: 'cs-guild-mobile-app',
    type: String,
  })
  @ApiBody({
    type: UpdateProjectDto,
    description: 'Project update data',
    examples: {
      example1: {
        summary: 'Update project details',
        value: {
          title: 'Updated CS Guild Mobile App',
          description:
            'Updated description for the mobile application with enhanced features',
          tags: ['mobile', 'typescript', 'react-native', 'updated'],
          dueDate: '2024-12-31T23:59:59.000Z',
        },
      },
      example2: {
        summary: 'Update project status and roles',
        value: {
          status: 'IN_PROGRESS',
          roles: [
            {
              roleSlug: 'frontend-developer',
              maxMembers: 3,
              requirements:
                'Updated requirements: Senior React Native developer',
            },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Project updated successfully',
    type: ProjectUpdateResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - valid JWT token required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - only project owner can update',
  })
  @ApiResponse({
    status: 404,
    description: 'Project not found',
  })
  async update(
    @Param('slug') slug: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @CurrentUser() user: User,
  ): Promise<ProjectUpdateResponseDto> {
    const project = await this.commandBus.execute(
      new UpdateProjectCommand(slug, updateProjectDto, user.username),
    );
    return {
      message: 'Project updated successfully',
      statusCode: 200,
      project,
    };
  }

  @Patch(':slug/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update project status',
    description:
      'Update the status of a project. Only the project owner can change status.',
  })
  @ApiParam({
    name: 'slug',
    description: 'Project slug',
    example: 'cs-guild-mobile-app',
    type: String,
  })
  @ApiBody({
    type: UpdateProjectStatusDto,
    description: 'Project status update data',
    examples: {
      example1: {
        summary: 'Update status to in progress',
        value: {
          status: 'IN_PROGRESS',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Project status updated successfully',
    type: ProjectStatusUpdateResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - valid JWT token required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - only project owner can update status',
  })
  @ApiResponse({
    status: 404,
    description: 'Project not found',
  })
  async updateStatus(
    @Param('slug') slug: string,
    @Body() updateStatusDto: UpdateProjectStatusDto,
    @CurrentUser() user: User,
  ): Promise<ProjectStatusUpdateResponseDto> {
    const project = await this.commandBus.execute(
      new UpdateProjectStatusCommand(slug, updateStatusDto, user.username),
    );
    return {
      message: 'Project status updated successfully',
      statusCode: 200,
      project,
    };
  }

  @Delete(':slug')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete a project',
    description:
      'Delete a project permanently. Only the project owner can delete the project.',
  })
  @ApiParam({
    name: 'slug',
    description: 'Project slug',
    example: 'cs-guild-mobile-app',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Project deleted successfully',
    type: ProjectDeleteResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - valid JWT token required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - only project owner can delete',
  })
  @ApiResponse({
    status: 404,
    description: 'Project not found',
  })
  async remove(
    @Param('slug') slug: string,
    @CurrentUser() user: User,
  ): Promise<ProjectDeleteResponseDto> {
    await this.commandBus.execute(
      new DeleteProjectCommand(slug, user.username),
    );
    return { message: 'Project deleted successfully' };
  }

  @Post('join')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Apply to join a project',
    description: 'Submit an application to join a project for a specific role',
  })
  @ApiBody({
    type: JoinProjectDto,
    description: 'Project join application data',
    examples: {
      example1: {
        summary: 'Join project application with message',
        value: {
          projectSlug: 'cs-guild-mobile-app',
          roleSlug: 'frontend-developer',
          message:
            'I have 3 years of experience with React Native and would love to contribute to this project. ' +
            'I have previously worked on similar mobile applications and am excited about the CS Guild community.',
        },
      },
      example2: {
        summary: 'Simple application without message',
        value: {
          projectSlug: 'cs-guild-mobile-app',
          roleSlug: 'frontend-developer',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Application submitted successfully',
    type: JoinProjectResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed or duplicate application',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - valid JWT token required',
  })
  @ApiResponse({
    status: 404,
    description: 'Project or role not found',
  })
  async joinProject(
    @Body() joinProjectDto: JoinProjectDto,
    @CurrentUser() user: User,
  ): Promise<JoinProjectResponseDto> {
    const application = await this.commandBus.execute(
      new JoinProjectCommand(joinProjectDto, user.username),
    );
    return {
      message: 'Application submitted successfully',
      statusCode: 201,
      application,
    };
  }

  @Post('applications/review')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Review a project application',
    description:
      'Approve or reject a project application. Only the project owner can review applications.',
  })
  @ApiBody({
    type: ReviewApplicationDto,
    description: 'Application review data',
    examples: {
      approve: {
        summary: 'Approve application',
        value: {
          applicationId: 'clm7x8k9e0000v8og4n2h5k7u',
          decision: 'APPROVED',
          reviewMessage:
            'Great experience and skills match our requirements perfectly.',
        },
      },
      reject: {
        summary: 'Reject application',
        value: {
          applicationId: 'clm7x8k9e0000v8og4n2h5k7u',
          decision: 'REJECTED',
          reviewMessage:
            'Thank you for your interest, but we are looking for different skills at this time.',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Application reviewed successfully',
    type: ReviewApplicationResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - valid JWT token required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - only project owner can review applications',
  })
  @ApiResponse({
    status: 404,
    description: 'Application not found',
  })
  async reviewApplication(
    @Body() reviewDto: ReviewApplicationDto,
    @CurrentUser() user: User,
  ): Promise<ReviewApplicationResponseDto> {
    const application = await this.commandBus.execute(
      new ReviewApplicationCommand(reviewDto, user.username),
    );
    return {
      message: 'Application reviewed successfully',
      statusCode: 200,
      application,
    };
  }

  @Delete(':slug/members/:memberUserSlug')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Remove a project member',
    description:
      'Remove a member from a project and free up their role slot. Only the project owner can remove members.',
  })
  @ApiParam({
    name: 'slug',
    description: 'Project slug',
    example: 'cs-guild-mobile-app',
    type: String,
  })
  @ApiParam({
    name: 'memberUserSlug',
    description: 'Username of the member to remove',
    example: 'johndoe',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Project member removed successfully',
    type: RemoveProjectMemberResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - valid JWT token required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - only project owner can remove members',
  })
  @ApiResponse({
    status: 404,
    description: 'Project or member not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - project owner cannot remove themselves',
  })
  async removeProjectMember(
    @Param('slug') slug: string,
    @Param('memberUserSlug') memberUserSlug: string,
    @CurrentUser() user: User,
  ): Promise<RemoveProjectMemberResponseDto> {
    await this.commandBus.execute(
      new RemoveProjectMemberCommand(slug, memberUserSlug, user.username),
    );
    return {
      message: 'Project member removed successfully',
      statusCode: 200,
    };
  }

  @Patch(':slug/members/:memberUserSlug/reactivate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Reactivate a removed project member',
    description:
      'Reactivate a previously removed member back to the project. Only the project owner can reactivate members.',
  })
  @ApiParam({
    name: 'slug',
    description: 'Project slug',
    example: 'cs-guild-mobile-app',
    type: String,
  })
  @ApiParam({
    name: 'memberUserSlug',
    description: 'Username of the removed member to reactivate',
    example: 'johndoe',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Project member reactivated successfully',
    type: ReactivateProjectMemberResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - valid JWT token required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - only project owner can reactivate members',
  })
  @ApiResponse({
    status: 404,
    description: 'Project or removed member not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - role is at maximum capacity',
  })
  async reactivateProjectMember(
    @Param('slug') slug: string,
    @Param('memberUserSlug') memberUserSlug: string,
    @CurrentUser() user: User,
  ): Promise<ReactivateProjectMemberResponseDto> {
    await this.commandBus.execute(
      new ReactivateProjectMemberCommand(slug, memberUserSlug, user.username),
    );
    return {
      message: 'Project member reactivated successfully',
      statusCode: 200,
    };
  }

  @Post(':slug/save')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Save a project',
    description:
      'Save a project to your personal saved projects list for easy access later.',
  })
  @ApiParam({
    name: 'slug',
    description: 'Project slug to save',
    example: 'cs-guild-mobile-app',
    type: String,
  })
  @ApiResponse({
    status: 201,
    description: 'Project saved successfully',
    type: SaveProjectResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - valid JWT token required',
    type: SaveProjectErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Project not found',
    type: SaveProjectErrorResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Project is already saved by this user',
    type: SaveProjectErrorResponseDto,
  })
  async saveProject(
    @Param('slug') slug: string,
    @CurrentUser() user: User,
  ): Promise<SaveProjectResponseDto> {
    const savedProject = await this.commandBus.execute(
      new SaveProjectCommand(slug, user.username),
    );

    return {
      message: 'Project saved successfully',
      statusCode: 201,
      savedProject: {
        id: savedProject.id,
        userSlug: savedProject.userSlug,
        projectSlug: savedProject.projectSlug,
        savedAt: savedProject.savedAt.toISOString(),
      },
    };
  }

  @Delete(':slug/unsave')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Unsave a project',
    description: 'Remove a project from your personal saved projects list.',
  })
  @ApiParam({
    name: 'slug',
    description: 'Project slug to unsave',
    example: 'cs-guild-mobile-app',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Project unsaved successfully',
    type: UnsaveProjectResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - valid JWT token required',
    type: UnsaveProjectErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Project not found or not currently saved by this user',
    type: UnsaveProjectErrorResponseDto,
  })
  async unsaveProject(
    @Param('slug') slug: string,
    @CurrentUser() user: User,
  ): Promise<UnsaveProjectResponseDto> {
    await this.commandBus.execute(
      new UnsaveProjectCommand(slug, user.username),
    );

    return {
      message: 'Project unsaved successfully',
      statusCode: 200,
    };
  }
}
