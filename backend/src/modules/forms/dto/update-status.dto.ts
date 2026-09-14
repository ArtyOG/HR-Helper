import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsBoolean } from 'class-validator';

export class UpdateScheduleDto {
  @ApiProperty({ description: 'The ISO date string when the form should close', example: '2026-09-10T17:00:00.000Z' })
  @IsDateString()
  closeAt!: string;
}

export class UpdateStatusDto {
  @ApiProperty()
  @IsBoolean()
  isOpen!: boolean;
}
