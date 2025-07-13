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
import { UtilsService } from 'src/common/utils/utils.service';

@Injectable()
@CommandHandler(UpdateRoleCommand)
export class UpdateRoleHandler implements ICommandHandler<UpdateRoleCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly roleUtils: RoleUtils,
    private readonly utilsService: UtilsService,
  ) {}

  async execute(command: UpdateRoleCommand): Promise<RoleEntity> {
    const { slug, updateRoleDto } = command;
    const { name, description } = updateRoleDto;

    // Generate slug if name is being updated and slug is not provided
    let newSlug = updateRoleDto.slug;
    if (name && !newSlug) {
      newSlug = this.utilsService.generateSlug(name);
    }

    try {
      // Check if the role exists
      const existingRole = await this.roleUtils.getRoleBySlug(slug);

      if (!existingRole) {
        throw new NotFoundException(`Role with slug '${slug}' not found`);
      }

      // Check for conflicts with other roles (excluding current role)
      if (name || newSlug) {
        const { exists, conflictField } = await this.roleUtils.checkRoleExists(
          name,
          newSlug,
          existingRole.id,
        );

        if (exists) {
          throw new ConflictException(
            `Role with ${conflictField} '${conflictField === 'name' ? name : newSlug}' already exists`,
          );
        }
      }

      // Update the role
      const role = await this.prisma.userRole.update({
        where: { slug },
        data: {
          ...(name && { name }),
          ...(newSlug && { slug: newSlug }),
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
          throw new NotFoundException(`Role with slug '${slug}' not found`);
        }
        throw new BadRequestException(
          'Failed to update role: ' + error.message,
        );
      }
      throw error;
    }
  }
}
