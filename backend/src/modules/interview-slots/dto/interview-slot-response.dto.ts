import { ApiProperty } from '@nestjs/swagger';
import { InterviewSlotStatus } from '@prisma/client';

export class InterviewSlotResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  formId!: string;

  @ApiProperty({ example: 'b1a2c3d4-e5f6-7890-abcd-ef1234567890', nullable: true })
  submissionId!: string | null;

  @ApiProperty({ example: '2026-10-01T09:00:00.000Z' })
  startTime!: Date;

  @ApiProperty({ example: '2026-10-01T10:00:00.000Z' })
  endTime!: Date;

  @ApiProperty({ enum: InterviewSlotStatus, example: InterviewSlotStatus.AVAILABLE })
  status!: InterviewSlotStatus;

  @ApiProperty({ example: 'https://meet.google.com/abc-defg-hij', nullable: true })
  meetingLink!: string | null;

  @ApiProperty({ example: '2026-09-09T00:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-09-09T00:00:00.000Z' })
  updatedAt!: Date;
}
