import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { InterviewSlotStatus } from '@prisma/client';

export class FilterInterviewSlotsDto {
  @ApiPropertyOptional({
    enum: InterviewSlotStatus,
    description: 'Filter by slot status (e.g. BOOKED, AVAILABLE, CANCELLED)',
    example: InterviewSlotStatus.BOOKED,
  })
  @IsOptional()
  @IsEnum(InterviewSlotStatus)
  status?: InterviewSlotStatus;

  @ApiPropertyOptional({
    description: 'Limit the number of returned slots (e.g. 5 or 10)',
    example: 5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Filter slots for a specific form UUID',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @IsOptional()
  @IsString()
  formId?: string;

  @ApiPropertyOptional({
    description: 'If true, only returns ongoing and future slots (endTime >= NOW())',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  upcoming?: boolean;
}
