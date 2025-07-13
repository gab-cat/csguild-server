import { ApiProperty } from '@nestjs/swagger';
import { UserRoleResponseDto } from './user-role-response.dto';

export class ProjectRoleResponseDto {
  @ApiProperty({
    description: 'Project role ID',
    example: 'clm7x8k9e0000v8og4n2h5k7s',
  })
  id: string;

  @ApiProperty({
    description: 'Role details',
    type: UserRoleResponseDto,
  })
  role: UserRoleResponseDto;

  @ApiProperty({
    description: 'Maximum members for this role',
    example: 2,
    required: false,
  })
  maxMembers?: number;

  @ApiProperty({
    description: 'Current number of members',
    example: 1,
  })
  currentMembers: number;

  @ApiProperty({
    description: 'Role requirements',
    example: 'Experience with React and TypeScript required',
    required: false,
  })
  requirements?: string;
}
