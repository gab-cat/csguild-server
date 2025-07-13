import { ApiProperty } from '@nestjs/swagger';
import { ProjectSummaryResponseDto } from './project-summary-response.dto';
import { ProjectMemberResponseDto } from './project-member-response.dto';
import { ProjectApplicationResponseDto } from './project-application-response.dto';

export class ProjectDetailResponseDto extends ProjectSummaryResponseDto {
  @ApiProperty({
    description: 'Project members',
    type: [ProjectMemberResponseDto],
  })
  members: ProjectMemberResponseDto[];

  @ApiProperty({
    description: 'Project applications',
    type: [ProjectApplicationResponseDto],
  })
  applications: ProjectApplicationResponseDto[];
}
