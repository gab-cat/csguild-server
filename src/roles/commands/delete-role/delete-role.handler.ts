import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { DeleteRoleCommand } from './delete-role.command';
import { RoleUtils } from '../../utils';
import { Prisma } from '../../../../generated/prisma';

@Injectable()
@CommandHandler(DeleteRoleCommand)
export class DeleteRoleHandler implements ICommandHandler<DeleteRoleCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly roleUtils: RoleUtils,
  ) {}

  async execute(command: DeleteRoleCommand): Promise<void> {
    const { id } = command;

    try {
      // Check if the role exists
      const existingRole = await this.roleUtils.getRoleById(id);

      if (!existingRole) {
        throw new NotFoundException(`Role with ID '${id}' not found`);
      }

      // Check if the role can be safely deleted
      const { canDelete, reason } = await this.roleUtils.canDeleteRole(id);

      if (!canDelete) {
        throw new ConflictException(
          `Cannot delete role '${existingRole.name}': ${reason}`,
        );
      }

      // Delete the role
      await this.prisma.userRole.delete({
        where: { id },
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Role with ID '${id}' not found`);
        }
        if (error.code === 'P2003') {
          throw new ConflictException(
            'Cannot delete role because it is referenced by other entities',
          );
        }
        throw new BadRequestException(
          'Failed to delete role: ' + error.message,
        );
      }
      throw error;
    }
  }
}
