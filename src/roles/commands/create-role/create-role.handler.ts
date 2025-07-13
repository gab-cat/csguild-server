import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { CreateRoleCommand } from './create-role.command';
import { RoleEntity } from '../../types/role.types';
import { RoleUtils } from '../../utils';
import { Prisma } from '../../../../generated/prisma';

@Injectable()
@CommandHandler(CreateRoleCommand)
export class CreateRoleHandler implements ICommandHandler<CreateRoleCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly roleUtils: RoleUtils,
  ) {}

  async execute(command: CreateRoleCommand): Promise<RoleEntity> {
    const { createRoleDto } = command;
    const { name, description } = createRoleDto;

    // Generate slug if not provided
    const slug = createRoleDto.slug || RoleUtils.generateSlug(name);

    try {
      // Check if role with this name or slug already exists
      const { exists, conflictField } = await this.roleUtils.checkRoleExists(
        name,
        slug,
      );

      if (exists) {
        throw new ConflictException(
          `Role with ${conflictField} '${conflictField === 'name' ? name : slug}' already exists`,
        );
      }

      // Create the role
      const role = await this.prisma.userRole.create({
        data: {
          name,
          slug,
          description,
        },
      });

      return role;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(
          'Failed to create role: ' + error.message,
        );
      }
      throw error;
    }
  }
}
