import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { FindByIdQuery } from './find-by-id.query';
import { ProjectDetailResponse } from '../../types/project.types';
import { ProjectUtils } from '../../utils';

@Injectable()
@QueryHandler(FindByIdQuery)
export class FindByIdHandler implements IQueryHandler<FindByIdQuery> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projectUtils: ProjectUtils,
  ) {}

  async execute(query: FindByIdQuery): Promise<ProjectDetailResponse> {
    const { id } = query;

    const project = await this.projectUtils.getProjectWithDetails(id);

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return project as any; // Type transformation will be handled by the controller
  }
}
