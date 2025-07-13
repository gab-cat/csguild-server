import { ApiProperty } from '@nestjs/swagger';
import { ProjectSummaryResponseDto } from './project-summary-response.dto';
import { PaginationResponseDto } from './pagination-response.dto';

export class ProjectListResponseDto {
  @ApiProperty({
    description: 'List of projects',
    type: [ProjectSummaryResponseDto],
  })
  data: ProjectSummaryResponseDto[];

  @ApiProperty({
    description: 'Pagination information',
    example: {
      page: 1,
      limit: 10,
      total: 25,
      totalPages: 3,
      hasNext: true,
      hasPrev: false,
    },
  })
  pagination: PaginationResponseDto;
}
