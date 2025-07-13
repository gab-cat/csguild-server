import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { GetProjectBasicInfoQuery } from './get-project-basic-info.query';
import { Project, User } from '../../../../generated/prisma';

@Injectable()
@QueryHandler(GetProjectBasicInfoQuery)
export class GetProjectBasicInfoHandler
  implements IQueryHandler<GetProjectBasicInfoQuery>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetProjectBasicInfoQuery): Promise<
    Project & {
      owner: Pick<User, 'username' | 'firstName' | 'lastName' | 'imageUrl'>;
    }
  > {
    const { projectSlug } = query;

    const project = await this.prisma.project.findUnique({
      where: { slug: projectSlug },
      include: {
        owner: {
          select: {
            username: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }
}
