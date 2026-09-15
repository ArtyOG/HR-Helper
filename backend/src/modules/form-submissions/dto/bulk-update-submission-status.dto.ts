import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsArray, IsString } from 'class-validator';
import { SubmissionStatus } from '@prisma/client';

export class BulkUpdateSubmissionStatusDto {
  @ApiProperty({ type: [String], example: ['b1a2c3d4-e5f6-7890-abcd-ef1234567890'] })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  submissionIds!: string[];

  @ApiProperty({ enum: SubmissionStatus, example: SubmissionStatus.APPROVED })
  @IsEnum(SubmissionStatus)
  @IsNotEmpty()
  status!: SubmissionStatus;
}
