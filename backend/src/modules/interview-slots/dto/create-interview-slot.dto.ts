import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsDate, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';

export class CreateSingleSlotDto {
  @ApiProperty({ example: '2026-10-01T09:00:00.000Z' })
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  startTime!: Date;

  @ApiProperty({ example: '2026-10-01T10:00:00.000Z' })
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  endTime!: Date;

  @ApiProperty({ example: 'https://meet.google.com/abc-defg-hij', required: false })
  @IsString()
  @IsOptional()
  meetingLink?: string;
}

export class CreateInterviewSlotsDto {
  @ApiProperty({ type: [CreateSingleSlotDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSingleSlotDto)
  @IsNotEmpty()
  slots!: CreateSingleSlotDto[];
}
