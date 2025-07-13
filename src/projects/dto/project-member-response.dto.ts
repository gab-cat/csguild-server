import { ApiProperty } from '@nestjs/swagger';
import { MemberStatus } from '../../../generated/prisma';
import { ProjectOwnerResponseDto } from './project-owner-response.dto';
import { ProjectRoleResponseDto } from './project-role-response.dto';

export class ProjectMemberResponseDto {
  @ApiProperty({
    description: 'Member ID',
    example: 'clm7x8k9e0000v8og4n2h5k7s',
  })
  id: string;

  @ApiProperty({
    description: 'User details',
    type: ProjectOwnerResponseDto,
  })
  user: ProjectOwnerResponseDto;

  @ApiProperty({
    description: 'Project role',
    type: ProjectRoleResponseDto,
  })
  projectRole: ProjectRoleResponseDto;

  @ApiProperty({
    description: 'Member status',
    example: MemberStatus.ACTIVE,
    enum: MemberStatus,
  })
  status: MemberStatus;

  @ApiProperty({
    description: 'Date when user joined the project',
    example: '2024-01-01T00:00:00.000Z',
    format: 'date-time',
  })
  joinedAt: Date;
}
