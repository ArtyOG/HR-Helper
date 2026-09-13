import { ApiProperty } from '@nestjs/swagger';
import { CvEvaluationResponseDto } from './cv-evaluation-response.dto';

class AnswerDetailDto {
  @ApiProperty({ example: 1 })
  id!: number;
  @ApiProperty({ example: 10 })
  fieldId!: number;
  @ApiProperty({ example: 'John Doe' })
  value?: string;
  @ApiProperty({ example: 5, required: false })
  optionId?: number;
}

class OptionDto {
  @ApiProperty({ example: 20 })
  id!: number;
  @ApiProperty({ example: 'Engineering' })
  value!: string;
}

class FieldDto {
  @ApiProperty({ example: 10 })
  id!: number;
  @ApiProperty({ example: 'Full Name' })
  label!: string;
  @ApiProperty({ example: 'TEXT' })
  type!: string;
  @ApiProperty({ example: true })
  required!: boolean;
  @ApiProperty({ type: [OptionDto], required: false })
  options?: OptionDto[];
}

class FormTemplateDto {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  id!: string;
  @ApiProperty({ example: 'Software Engineer Application' })
  title!: string;
  @ApiProperty({ example: 'Please fill out this form to apply.' })
  description?: string;
  @ApiProperty({ 
    type: [FieldDto],
    example: [
      { id: 10, label: 'Full Name', type: 'TEXT', required: true },
      { id: 11, label: 'Department', type: 'SELECT', required: true, options: [{ id: 20, value: 'Engineering' }, { id: 21, value: 'Design' }] }
    ]
  })
  fields!: FieldDto[];
}

export class SubmissionDetailResponseDto {
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

  @ApiProperty({ type: FormTemplateDto })
  form!: FormTemplateDto;

  @ApiProperty({ type: [AnswerDetailDto] })
  answers!: AnswerDetailDto[];

  @ApiProperty({ type: () => CvEvaluationResponseDto, nullable: true, required: false })
  cvEvaluation?: CvEvaluationResponseDto | null;
}

