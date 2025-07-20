import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class RegisterToEventDto {
  @ApiProperty({
    description: 'Slug of the event to register for',
    example: 'cs-guild-tech-talk-advanced-react-patterns',
  })
  @IsString()
  @IsNotEmpty()
  eventSlug: string;
}
