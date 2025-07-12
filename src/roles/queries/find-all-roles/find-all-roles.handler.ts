import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { FindAllRolesQuery } from './find-all-roles.query';
import { RoleListResponseDto } from '../../dto';
import { Prisma } from '../../../../generated/prisma';

@Injectable()
@QueryHandler(FindAllRolesQuery)
export class FindAllRolesHandler implements IQueryHandler<FindAllRolesQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: FindAllRolesQuery): Promise<RoleListResponseDto> {
    const { filters, pagination } = query;
    const { search } = filters;
    const {
      page,
      limit,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = pagination;

    // Build where clause
    const where: Prisma.UserRoleWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Build order by clause
    const orderBy: Prisma.UserRoleOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute queries
    const [roles, total] = await Promise.all([
      this.prisma.userRole.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.userRole.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      message: 'Roles retrieved successfully',
      statusCode: 200,
      data: roles,
      total,
      page,
      limit,
      totalPages,
    };
  }
}
