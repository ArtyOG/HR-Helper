import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { SubmissionStatus } from '@prisma/client';

export class UpdateSubmissionStatusDto {
  @ApiProperty({ enum: SubmissionStatus, example: SubmissionStatus.APPROVED })
  @IsEnum(SubmissionStatus)
  @IsNotEmpty()
  status!: SubmissionStatus;
}
