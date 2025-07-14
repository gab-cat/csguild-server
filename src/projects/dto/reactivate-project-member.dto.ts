import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ReactivateProjectMemberDto {
  @ApiProperty({
    description: 'Username of the removed member to reactivate in the project',
    example: 'johndoe',
  })
  @IsString()
  @IsNotEmpty()
  memberUserSlug: string;
}

export class ReactivateProjectMemberResponseDto {
  @ApiProperty({ example: 'Project member reactivated successfully' })
  message: string;

  @ApiProperty({ example: 200 })
  statusCode: number;
}
