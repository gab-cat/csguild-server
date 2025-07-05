import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FacilityUsageStatusDto {
  @ApiProperty({
    description: 'RFID card ID to check status',
    example: 'RFID123456789',
  })
  @IsString()
  @IsNotEmpty()
  rfidId: string;

  @ApiProperty({
    description: 'Facility ID to check status in',
    example: 'clm7x8k9e0000v8og4n2h5k7s',
  })
  @IsString()
  @IsNotEmpty()
  facilityId: string;
}
