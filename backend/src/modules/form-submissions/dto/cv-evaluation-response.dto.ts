import { ApiProperty } from '@nestjs/swagger';

export class FileDetailDto {
  @ApiProperty({ example: 123 })
  id!: number;

  @ApiProperty({ example: 'resume.pdf' })
  filename!: string;

  @ApiProperty({ example: 'documents/1725531200000-resume.pdf' })
  key!: string;
}

export class CvEvaluationResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 1 })
  submissionId!: number;

  @ApiProperty({ example: 123 })
  fileId!: number;

  @ApiProperty({ example: 85.5, nullable: true })
  score!: number | null;

  @ApiProperty({ example: 'PENDING', enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'SKIPPED'] })
  status!: string;

  @ApiProperty({ example: null, nullable: true })
  error!: string | null;

  @ApiProperty({ example: '2026-09-01T00:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-09-01T00:00:00.000Z' })
  updatedAt!: Date;

  @ApiProperty({ type: () => FileDetailDto, required: false })
  file?: FileDetailDto;
}
