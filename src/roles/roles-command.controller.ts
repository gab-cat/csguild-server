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
  CreateRoleDto,
  UpdateRoleDto,
  CreateRoleResponseDto,
  UpdateRoleResponseDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { Role } from '../../generated/prisma';

// Commands
import {
  CreateRoleCommand,
  UpdateRoleCommand,
  DeleteRoleCommand,
} from './commands';

@ApiTags('Roles')
@Controller('roles')
export class RolesCommandController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STAFF, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a new role',
    description:
      'Create a new user role. Only staff and admin users can create roles.',
  })
  @ApiBody({
    type: CreateRoleDto,
    description: 'Role creation data',
    examples: {
      example1: {
        summary: 'Basic role example',
        value: {
          name: 'Frontend Developer',
          description:
            'Responsible for building and maintaining user interfaces using modern web technologies',
        },
      },
      example2: {
        summary: 'Role with custom slug',
        value: {
          name: 'UI/UX Designer',
          slug: 'ui-ux-designer',
          description: 'Creates user interfaces and user experience designs',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Role created successfully',
    type: CreateRoleResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - valid JWT token required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - only staff and admin can create roles',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - role with this name or slug already exists',
  })
  async create(
    @Body() createRoleDto: CreateRoleDto,
  ): Promise<CreateRoleResponseDto> {
    const role = await this.commandBus.execute(
      new CreateRoleCommand(createRoleDto),
    );
    return {
      message: 'Role created successfully',
      statusCode: 201,
      role: role,
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STAFF, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update a role',
    description:
      'Update role details. Only staff and admin users can update roles.',
  })
  @ApiParam({
    name: 'id',
    description: 'Role ID',
    example: 'clm7x8k9e0000v8og4n2h5k7s',
    type: String,
  })
  @ApiBody({
    type: UpdateRoleDto,
    description: 'Role update data',
    examples: {
      example1: {
        summary: 'Update role name and description',
        value: {
          name: 'Senior Frontend Developer',
          description:
            'Lead frontend development initiatives and mentor junior developers',
        },
      },
      example2: {
        summary: 'Update only description',
        value: {
          description: 'Updated role description with new responsibilities',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Role updated successfully',
    type: UpdateRoleResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - valid JWT token required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - only staff and admin can update roles',
  })
  @ApiResponse({
    status: 404,
    description: 'Role not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - role with this name or slug already exists',
  })
  async update(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<UpdateRoleResponseDto> {
    const role = await this.commandBus.execute(
      new UpdateRoleCommand(id, updateRoleDto),
    );
    return {
      message: 'Role updated successfully',
      statusCode: 200,
      role: role,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STAFF, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete a role',
    description:
      'Delete a role permanently. Only staff and admin users can delete roles. ' +
      'Roles that are assigned to users or projects cannot be deleted.',
  })
  @ApiParam({
    name: 'id',
    description: 'Role ID',
    example: 'clm7x8k9e0000v8og4n2h5k7s',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Role deleted successfully',
    examples: {
      success: {
        summary: 'Successful deletion',
        value: {
          message: 'Role deleted successfully',
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
    description: 'Forbidden - only staff and admin can delete roles',
  })
  @ApiResponse({
    status: 404,
    description: 'Role not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - role is assigned to users or projects',
  })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.commandBus.execute(new DeleteRoleCommand(id));
    return { message: 'Role deleted successfully' };
  }
}
