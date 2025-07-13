import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { FindBySlugQuery } from './find-by-slug.query';
import { ProjectDetailResponse } from '../../types/project.types';
import { ProjectUtils } from '../../utils';

@Injectable()
@QueryHandler(FindBySlugQuery)
export class FindBySlugHandler implements IQueryHandler<FindBySlugQuery> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projectUtils: ProjectUtils,
  ) {}

  async execute(query: FindBySlugQuery): Promise<ProjectDetailResponse> {
    const { slug } = query;

    const project = await this.projectUtils.getProjectWithDetails(slug);

    if (!project) {
      throw new NotFoundException(`Project with slug ${slug} not found`);
    }

    return project;
  }
}
