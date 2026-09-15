import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsArray, ValidateNested, IsString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class AnswerDto {
  @ApiProperty()
  @IsNumber()
  fieldId!: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  value?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  optionId?: number;
}

export class SubmitFormDto {
  @ApiProperty()
  @IsString()
  email!: string;

  @ApiProperty()
  @IsNumber()
  cvFileId!: number;

  @ApiProperty({ type: [AnswerDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers!: AnswerDto[];
}
