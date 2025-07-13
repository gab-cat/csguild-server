import { ApiProperty } from '@nestjs/swagger';
import {
  ProjectSummaryDto,
  ProjectApplicationDto,
} from './project-query-response.dto';

export class MyProjectsResponseDto {
  @ApiProperty({ example: 'User projects retrieved successfully' })
  message: string;

  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ type: [ProjectSummaryDto] })
  ownedProjects: ProjectSummaryDto[];

  @ApiProperty({ type: [ProjectSummaryDto] })
  memberProjects: ProjectSummaryDto[];
}

export class MyApplicationsResponseDto {
  @ApiProperty({ example: 'User applications retrieved successfully' })
  message: string;

  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ type: [ProjectApplicationDto] })
  applications: ProjectApplicationDto[];
}
