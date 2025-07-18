import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ToggleSessionDto {
  @ApiProperty({
    description: 'RFID ID of the user',
    example: 'RFID123456',
  })
  @IsString()
  @IsNotEmpty()
  rfidId: string;

  @ApiProperty({
    description: 'Event ID',
    example: 'cm0abc123def456',
  })
  @IsString()
  @IsNotEmpty()
  eventId: string;
}
