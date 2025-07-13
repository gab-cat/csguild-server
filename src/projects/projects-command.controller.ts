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
  CreateProjectResponseDto,
  JoinProjectResponseDto,
  ProjectDetailResponseDto,
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
} from './commands';
import { ProjectApplication, User } from '../../generated/prisma';

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
          description: 'A mobile application for the CS Guild community',
          tags: ['mobile', 'typescript', 'react-native'],
          dueDate: '2024-12-31T23:59:59.000Z',
          roles: [
            {
              roleId: 'clm7x8k9e0000v8og4n2h5k7t',
              name: 'Frontend Developer',
              description: 'Responsible for UI/UX development',
              requiredSkills: ['React Native', 'TypeScript'],
              maxMembers: 2,
              requiredExperience: 'Intermediate',
            },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Project created successfully',
    type: CreateProjectResponseDto,
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
  ): Promise<CreateProjectResponseDto> {
    const project = await this.commandBus.execute(
      new CreateProjectCommand(createProjectDto, user.id),
    );
    return {
      message: 'Project created successfully',
      statusCode: 201,
      project: project,
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update a project',
    description:
      'Update project details. Only the project owner can update the project.',
  })
  @ApiParam({
    name: 'id',
    description: 'Project ID',
    example: 'clm7x8k9e0000v8og4n2h5k7s',
    type: String,
  })
  @ApiBody({
    type: UpdateProjectDto,
    description: 'Project update data',
    examples: {
      example1: {
        summary: 'Update project example',
        value: {
          title: 'Updated CS Guild Mobile App',
          description: 'Updated description for the mobile application',
          tags: ['mobile', 'typescript', 'react-native', 'updated'],
          dueDate: '2024-12-31T23:59:59.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Project updated successfully',
    type: ProjectDetailResponseDto,
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
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @CurrentUser() user: User,
  ): Promise<ProjectDetailResponseDto> {
    return this.commandBus.execute(
      new UpdateProjectCommand(id, updateProjectDto, user.id),
    );
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update project status',
    description:
      'Update the status of a project. Only the project owner can change status.',
  })
  @ApiParam({
    name: 'id',
    description: 'Project ID',
    example: 'clm7x8k9e0000v8og4n2h5k7s',
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
    type: ProjectDetailResponseDto,
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
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateProjectStatusDto,
    @CurrentUser() user: User,
  ): Promise<ProjectDetailResponseDto> {
    return this.commandBus.execute(
      new UpdateProjectStatusCommand(id, updateStatusDto, user.id),
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete a project',
    description:
      'Delete a project permanently. Only the project owner can delete the project.',
  })
  @ApiParam({
    name: 'id',
    description: 'Project ID',
    example: 'clm7x8k9e0000v8og4n2h5k7s',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Project deleted successfully',
    examples: {
      success: {
        summary: 'Successful deletion',
        value: {
          message: 'Project deleted successfully',
        },
      },
    },
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
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<{ message: string }> {
    await this.commandBus.execute(new DeleteProjectCommand(id, user.id));
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
        summary: 'Join project application',
        value: {
          projectId: 'clm7x8k9e0000v8og4n2h5k7s',
          projectRoleId: 'clm7x8k9e0000v8og4n2h5k7t',
          message:
            'I have 3 years of experience with React Native and would love to contribute to this project. ' +
            'I have previously worked on similar mobile applications and am excited about the CS Guild community.',
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
      new JoinProjectCommand(joinProjectDto, user.id),
    );
    return {
      message: 'Application submitted successfully',
      statusCode: 201,
      application: application,
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
          reviewMessage: 'Great experience and skills match our requirements.',
        },
      },
      reject: {
        summary: 'Reject application',
        value: {
          applicationId: 'clm7x8k9e0000v8og4n2h5k7u',
          decision: 'REJECTED',
          reviewMessage:
            'Thank you for your interest, but we are looking for different skills.',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Application reviewed successfully',
    examples: {
      success: {
        summary: 'Application reviewed',
        value: {
          message: 'Application reviewed successfully',
          statusCode: 200,
          application: {
            id: 'clm7x8k9e0000v8og4n2h5k7u',
            status: 'APPROVED',
            reviewNotes: 'Great experience and skills match our requirements.',
          },
        },
      },
    },
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
  ): Promise<ProjectApplication> {
    return this.commandBus.execute(
      new ReviewApplicationCommand(reviewDto, user.id),
    );
  }
}
