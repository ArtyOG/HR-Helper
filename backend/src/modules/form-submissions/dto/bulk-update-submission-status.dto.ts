import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsArray, IsNumber } from 'class-validator';
import { SubmissionStatus } from '@prisma/client';

export class BulkUpdateSubmissionStatusDto {
  @ApiProperty({ type: [Number], example: [1, 2, 3] })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsNotEmpty()
  submissionIds!: number[];

  @ApiProperty({ enum: SubmissionStatus, example: SubmissionStatus.APPROVED })
  @IsEnum(SubmissionStatus)
  @IsNotEmpty()
  status!: SubmissionStatus;
}
