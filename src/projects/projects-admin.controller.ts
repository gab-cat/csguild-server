import { Controller, Post, Delete, Param, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import {
  PinProjectResponseDto,
  UnpinProjectResponseDto,
  PinProjectErrorResponseDto,
  UnpinProjectErrorResponseDto,
} from './dto';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { Role } from '../../generated/prisma';

// Commands
import { PinProjectCommand, UnpinProjectCommand } from './commands';

// User type
import { User } from '../../generated/prisma';

@ApiTags('Projects Admin')
@Controller('admin/projects')
export class ProjectsAdminController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post(':slug/pin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Pin a project (Admin only)',
    description:
      // eslint-disable-next-line max-len
      'Pin a project to make it globally visible to all users. Only administrators can pin projects. Maximum of 6 projects can be pinned at once.',
  })
  @ApiParam({
    name: 'slug',
    description: 'Project slug to pin',
    example: 'cs-guild-mobile-app',
    type: String,
  })
  @ApiResponse({
    status: 201,
    description: 'Project pinned successfully',
    type: PinProjectResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - valid JWT token required',
    type: PinProjectErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - admin privileges required',
    type: PinProjectErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Project not found',
    type: PinProjectErrorResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Project is already pinned',
    type: PinProjectErrorResponseDto,
  })
  @ApiResponse({
    status: 422,
    description: 'Maximum limit of 6 pinned projects reached',
    type: PinProjectErrorResponseDto,
  })
  async pinProject(
    @Param('slug') slug: string,
    @CurrentUser() user: User,
  ): Promise<PinProjectResponseDto> {
    const project = await this.commandBus.execute(
      new PinProjectCommand(slug, user.username),
    );

    return {
      message: 'Project pinned successfully',
      statusCode: 201,
      pinnedProject: {
        id: project.id,
        projectSlug: project.projectSlug,
        pinnedAt: project.pinnedAt.toISOString(),
        order: project.order,
        pinnedBy: project.pinnedBy,
      },
    };
  }

  @Delete(':slug/unpin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Unpin a project (Admin only)',
    description:
      'Remove a project from the globally pinned projects list. Only administrators can unpin projects.',
  })
  @ApiParam({
    name: 'slug',
    description: 'Project slug to unpin',
    example: 'cs-guild-mobile-app',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Project unpinned successfully',
    type: UnpinProjectResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - valid JWT token required',
    type: UnpinProjectErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - admin privileges required',
    type: UnpinProjectErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Project not found or not currently pinned',
    type: UnpinProjectErrorResponseDto,
  })
  async unpinProject(
    @Param('slug') slug: string,
    @CurrentUser() user: User,
  ): Promise<UnpinProjectResponseDto> {
    await this.commandBus.execute(new UnpinProjectCommand(slug, user.username));

    return {
      message: 'Project unpinned successfully',
      statusCode: 200,
    };
  }
}
