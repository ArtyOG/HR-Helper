import { ApiProperty } from '@nestjs/swagger';

export class SubmissionResponseDto {
  @ApiProperty({ example: 'b1a2c3d4-e5f6-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  formId!: string;

  @ApiProperty({ example: 123 })
  cvFileId!: number;

  @ApiProperty({ example: 'applicant@example.com' })
  email!: string;

  @ApiProperty({ example: 'PENDING' })
  status!: string;

  @ApiProperty({ example: 85.5, nullable: true })
  cvScore!: number | null;

  @ApiProperty({ example: 'PENDING', enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'SKIPPED'] })
  aiScoreStatus!: string;

  @ApiProperty({ example: null, nullable: true })
  aiError!: string | null;

  @ApiProperty({ example: '2026-09-01T00:00:00.000Z' })
  createdAt!: Date;
}
