import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { UpdateRoleCommand } from './update-role.command';
import { RoleEntity } from '../../types/role.types';
import { RoleUtils } from '../../utils';
import { Prisma } from '../../../../generated/prisma';

@Injectable()
@CommandHandler(UpdateRoleCommand)
export class UpdateRoleHandler implements ICommandHandler<UpdateRoleCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly roleUtils: RoleUtils,
  ) {}

  async execute(command: UpdateRoleCommand): Promise<RoleEntity> {
    const { id, updateRoleDto } = command;
    const { name, description } = updateRoleDto;

    // Generate slug if name is being updated and slug is not provided
    let slug = updateRoleDto.slug;
    if (name && !slug) {
      slug = RoleUtils.generateSlug(name);
    }

    try {
      // Check if the role exists
      const existingRole = await this.roleUtils.getRoleById(id);

      if (!existingRole) {
        throw new NotFoundException(`Role with ID '${id}' not found`);
      }

      // Check for conflicts with other roles (excluding current role)
      if (name || slug) {
        const { exists, conflictField } = await this.roleUtils.checkRoleExists(
          name,
          slug,
          id,
        );

        if (exists) {
          throw new ConflictException(
            `Role with ${conflictField} '${conflictField === 'name' ? name : slug}' already exists`,
          );
        }
      }

      // Update the role
      const role = await this.prisma.userRole.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(slug && { slug }),
          ...(description !== undefined && { description }),
        },
      });

      return role;
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            'Role with this name or slug already exists',
          );
        }
        if (error.code === 'P2025') {
          throw new NotFoundException(`Role with ID '${id}' not found`);
        }
        throw new BadRequestException(
          'Failed to update role: ' + error.message,
        );
      }
      throw error;
    }
  }
}
