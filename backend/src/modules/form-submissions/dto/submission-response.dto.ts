import { ApiProperty } from '@nestjs/swagger';
import { CvEvaluationResponseDto } from './cv-evaluation-response.dto';

export class SubmissionResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  formId!: string;

  @ApiProperty({ example: 'applicant@example.com' })
  email!: string;

  @ApiProperty({ example: 'PENDING', enum: ['PENDING', 'APPROVED', 'REJECTED'] })
  status!: string;

  @ApiProperty({ example: '2026-09-01T00:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ type: () => CvEvaluationResponseDto, nullable: true, required: false })
  cvEvaluation?: CvEvaluationResponseDto | null;
}

