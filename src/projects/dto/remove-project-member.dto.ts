import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class RemoveProjectMemberDto {
  @ApiProperty({
    description: 'Username of the member to remove from the project',
    example: 'johndoe',
  })
  @IsString()
  @IsNotEmpty()
  memberUserSlug: string;
}

export class RemoveProjectMemberResponseDto {
  @ApiProperty({ example: 'Project member removed successfully' })
  message: string;

  @ApiProperty({ example: 200 })
  statusCode: number;
}
