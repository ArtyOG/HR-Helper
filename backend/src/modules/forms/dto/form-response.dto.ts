import { ApiProperty } from '@nestjs/swagger';
import { FieldType } from '@prisma/client';

class OptionResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 10 })
  fieldId!: number;

  @ApiProperty({ example: 'Engineering' })
  value!: string;

  @ApiProperty({ example: 0 })
  order!: number;

  @ApiProperty({ example: '2026-09-01T00:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-09-01T00:00:00.000Z' })
  updatedAt!: Date;
}

class FieldResponseDto {
  @ApiProperty({ example: 10 })
  id!: number;

  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  formId!: string;

  @ApiProperty({ example: 'Department' })
  label!: string;

  @ApiProperty({ enum: FieldType, example: FieldType.SELECT })
  type!: FieldType;

  @ApiProperty({ example: true })
  required!: boolean;

  @ApiProperty({ example: 0 })
  order!: number;

  @ApiProperty({ type: [OptionResponseDto], required: false })
  options?: OptionResponseDto[];

  @ApiProperty({ example: '2026-09-01T00:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-09-01T00:00:00.000Z' })
  updatedAt!: Date;
}

export class FormListResponseDto {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  id!: string;

  @ApiProperty({ example: 'Software Engineer Application' })
  title!: string;

  @ApiProperty({ required: false, example: 'Please fill out this form to apply.' })
  description?: string;

  @ApiProperty({ required: false, example: 'Must have 3+ years experience.' })
  requirements?: string;

  @ApiProperty({ example: true })
  isOpen!: boolean;

  @ApiProperty({ required: false, type: String, format: 'date-time', example: '2026-09-01T00:00:00.000Z' })
  openAt?: Date;

  @ApiProperty({ required: false, type: String, format: 'date-time', example: '2026-09-10T17:00:00.000Z' })
  closeAt?: Date;

  @ApiProperty({ example: 1 })
  userId!: number;

  @ApiProperty({ example: '2026-09-01T00:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-09-01T00:00:00.000Z' })
  updatedAt!: Date;

  @ApiProperty({ example: 5 })
  submissionCount!: number;
}

export class FormResponseDto extends FormListResponseDto {
  @ApiProperty({ type: [FieldResponseDto], required: false })
  fields?: FieldResponseDto[];
}
